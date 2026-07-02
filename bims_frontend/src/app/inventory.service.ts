import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Author, Book } from './models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_BASE = 'http://localhost:3000';

  // State Signals
  readonly books = signal<Book[]>([]);
  readonly authors = signal<Author[]>([]);
  readonly selectedAuthor = signal<Author | null>(null);
  readonly isLoadingAuthorDetails = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed Values for dashboard statistics
  readonly totalValue = computed(() =>
    this.books().reduce((acc, book) => acc + (book.price * book.stock), 0)
  );

  readonly outOfStockCount = computed(() =>
    this.books().filter(book => book.stock === 0).length
  );

  readonly lowStockCount = computed(() =>
    this.books().filter(book => book.stock > 0 && book.stock <= 10).length
  );

  readonly wellStockedCount = computed(() =>
    this.books().filter(book => book.stock > 10).length
  );

  readonly criticalBooks = computed(() =>
    this.books()
      .filter(book => book.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
  );

  constructor(private http: HttpClient) {
    this.fetchBooksAndAuthors();
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  // Fetch initial data from backend API
  async fetchBooksAndAuthors(minPrice?: number, search?: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      let booksUrl = `${this.API_BASE}/books`;
      const params: string[] = [];
      if (minPrice !== undefined && minPrice !== null) {
        params.push(`minPrice=${minPrice}`);
      }
      if (search !== undefined && search !== null && search.trim() !== '') {
        params.push(`search=${encodeURIComponent(search.trim())}`);
      }
      if (params.length > 0) {
        booksUrl += `?${params.join('&')}`;
      }
      const booksData = await firstValueFrom(this.http.get<Book[]>(booksUrl));
      const parsedBooks = booksData.map((b: Book) => ({
        ...b,
        price: typeof b.price === 'string' ? parseFloat(b.price) : b.price
      }));
      this.books.set(parsedBooks);

      const authorsData = await firstValueFrom(this.http.get<Author[]>(`${this.API_BASE}/authors`));
      const parsedAuthors = authorsData.map((author: Author) => ({
        ...author,
        books: author.books ? author.books.map((b: Book) => ({
          ...b,
          price: typeof b.price === 'string' ? parseFloat(b.price) : b.price
        })) : []
      }));
      this.authors.set(parsedAuthors);
    } catch (e) {
      console.warn('Backend server not reachable. Running in standalone mock mode.', e);
      this.errorMessage.set('Backend server not reachable. Running in standalone mock mode.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Fetch detailed author profile with associated books (GET /authors/:id)
  async selectAuthor(authorId: number): Promise<void> {
    this.isLoadingAuthorDetails.set(true);
    this.selectedAuthor.set(null);
    this.errorMessage.set(null);

    // Initial fallback data from local signals
    const localAuthor = this.authors().find(a => a.id === authorId);
    let fallbackDetails: Author | null = null;
    if (localAuthor) {
      fallbackDetails = {
        ...localAuthor,
        books: this.books().filter(b => b.authorId === authorId)
      };
    }

    try {
      const remoteAuthor = await firstValueFrom(this.http.get<Author>(`${this.API_BASE}/authors/${authorId}`));
      if (remoteAuthor && remoteAuthor.books) {
        remoteAuthor.books = remoteAuthor.books.map((b: Book) => ({
          ...b,
          price: typeof b.price === 'string' ? parseFloat(b.price) : b.price
        }));
      }
      this.selectedAuthor.set(remoteAuthor);
    } catch (e: any) {
      console.warn(`Could not fetch author details from API. Using local fallback.`, e);
      this.selectedAuthor.set(fallbackDetails);
      this.errorMessage.set(`Could not fetch author details from API. Using local fallback.`);
    } finally {
      this.isLoadingAuthorDetails.set(false);
    }
  }

  async adjustStock(bookId: number, stock: number): Promise<void> {
    const book = this.books().find(b => b.id === bookId);
    if (!book) return;
    if (book.stock + stock < 0) {
      this.errorMessage.set('Failed to adjust stock: Stock cannot go below zero');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(Book.adjustStock(bookId, stock, this.API_BASE, this.http));
      await this.fetchBooksAndAuthors();
      const currentSelected = this.selectedAuthor();
      if (currentSelected) {
        await this.selectAuthor(currentSelected.id);
      }
    } catch (e: any) {
      const errMsg = e.error?.error?.message || e.error?.error || e.message || 'Server error';
      this.errorMessage.set(`Failed to adjust stock: ${errMsg}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateLocalStock(isbn: string, newStock: number): void {
    this.books.update(allBooks =>
      allBooks.map(b => b.isbn === isbn ? { ...b, stock: newStock } : b)
    );
  }

  async deleteBook(isbn: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.API_BASE}/books/${isbn}`));
      await this.fetchBooksAndAuthors();
      const currentSelected = this.selectedAuthor();
      if (currentSelected) {
        await this.selectAuthor(currentSelected.id);
      }
    } catch (e: any) {
      if (e.status === 0 || !e.status) {
        this.books.update(allBooks => allBooks.filter(book => book.isbn !== isbn));
        this.errorMessage.set('Backend server offline. Updated locally.');
      } else {
        const errMsg = e.error?.error?.message || e.error?.error || e.message || 'Server error';
        this.errorMessage.set(`Could not delete book: ${errMsg}`);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteAuthor(authorId: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.API_BASE}/authors/${authorId}`));
      await this.fetchBooksAndAuthors();
    } catch (e: any) {
      if (e.status === 0 || !e.status) {
        this.authors.update(allAuthors => allAuthors.filter(a => a.id !== authorId));
        this.books.update(allBooks => allBooks.filter(b => b.authorId !== authorId));
        this.errorMessage.set('Backend server offline. Updated locally.');
      } else {
        const errMsg = e.error?.error?.message || e.error?.error || e.message || 'Server error';
        this.errorMessage.set(`Could not delete author: ${errMsg}`);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveBook(newBook: Book): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(this.http.post<Book>(`${this.API_BASE}/books`, newBook));
      await this.fetchBooksAndAuthors();
      const currentSelected = this.selectedAuthor();
      if (currentSelected) {
        await this.selectAuthor(currentSelected.id);
      }
    } catch (e: any) {
      if (e.status === 0 || !e.status) {
        // Network/Connection error - run in mock/local mode
        this.books.update(allBooks => [...allBooks, newBook]);
        this.errorMessage.set(`Failed to connect to backend to save book. Updated locally.`);
      } else {
        const errMsg = e.error?.error?.message || e.error?.error || e.message || 'Server error';
        this.errorMessage.set(`Could not save book: ${errMsg}`);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  validateAndSaveBook(form: {
    title: string;
    isbn: string;
    price: number | string;
    stock: number | string;
    authorId: number | string;
  }): string | null {
    const error = Book.validate(form, this.books());
    if (error) {
      return error;
    }

    const newBook = Book.fromForm(form);
    this.saveBook(newBook);
    return null;
  }

  validateAndSaveAuthor(form: { name: string; bio?: string }): string | null {
    const error = Author.validate(form, this.authors());
    if (error) {
      return error;
    }

    const newAuthor = Author.fromForm(form, this.authors());
    this.saveAuthor(newAuthor);
    return null;
  }

  async saveAuthor(newAuthor: Author): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await firstValueFrom(
        this.http.post<Author>(`${this.API_BASE}/authors`, { name: newAuthor.name, bio: newAuthor.bio })
      );
      await this.fetchBooksAndAuthors();
    } catch (e: any) {
      if (e.status === 0 || !e.status) {
        // Network/Connection error - run in mock/local mode
        this.authors.update(allAuthors => [...allAuthors, newAuthor]);
        this.errorMessage.set(`Failed to connect to backend to save author. Updated locally.`);
      } else {
        const errMsg = e.error?.error?.message || e.error?.error || e.message || 'Server error';
        this.errorMessage.set(`Could not save author: ${errMsg}`);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
