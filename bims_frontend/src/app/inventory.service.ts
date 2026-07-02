import { Injectable, signal, computed } from '@angular/core';
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

  constructor() {
    this.fetchBooksAndAuthors();
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  // Fetch initial data from backend API
  async fetchBooksAndAuthors(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const booksRes = await fetch(`${this.API_BASE}/books`);
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        const parsedBooks = booksData.map((b: any) => ({
          ...b,
          price: typeof b.price === 'string' ? parseFloat(b.price) : b.price
        }));
        this.books.set(parsedBooks);
      } else {
        throw new Error(`Failed to fetch books: status ${booksRes.status}`);
      }

      const authorsRes = await fetch(`${this.API_BASE}/authors`);
      if (authorsRes.ok) {
        const authorsData = await authorsRes.json();
        const parsedAuthors = authorsData.map((author: any) => ({
          ...author,
          books: author.books ? author.books.map((b: any) => ({
            ...b,
            price: typeof b.price === 'string' ? parseFloat(b.price) : b.price
          })) : []
        }));
        this.authors.set(parsedAuthors);
      } else {
        throw new Error(`Failed to fetch authors: status ${authorsRes.status}`);
      }
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
      const res = await fetch(`${this.API_BASE}/authors/${authorId}`);
      if (res.ok) {
        const remoteAuthor = await res.json();
        if (remoteAuthor && remoteAuthor.books) {
          remoteAuthor.books = remoteAuthor.books.map((b: any) => ({
            ...b,
            price: typeof b.price === 'string' ? parseFloat(b.price) : b.price
          }));
        }
        this.selectedAuthor.set(remoteAuthor);
      } else {
        this.selectedAuthor.set(fallbackDetails);
        this.errorMessage.set(`Could not fetch author details from API (status ${res.status}). Using local fallback.`);
      }
    } catch (e) {
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
      const res = await Book.adjustStock(bookId, stock, this.API_BASE);
      if (res.ok) {
        await this.fetchBooksAndAuthors();
        const currentSelected = this.selectedAuthor();
        if (currentSelected) {
          await this.selectAuthor(currentSelected.id);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || errorData.error || `Server returned status ${res.status}`;
        this.errorMessage.set(`Failed to adjust stock: ${errMsg}`);
      }
    } catch (e: any) {
      this.errorMessage.set(`Failed to connect to backend: ${e.message}`);
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
      const res = await fetch(`${this.API_BASE}/books/${isbn}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
        const currentSelected = this.selectedAuthor();
        if (currentSelected) {
          await this.selectAuthor(currentSelected.id);
        }
      } else {
        this.books.update(allBooks => allBooks.filter(book => book.isbn !== isbn));
        this.errorMessage.set(`Could not delete book from backend (status ${res.status}). Updated locally.`);
      }
    } catch (e) {
      this.books.update(allBooks => allBooks.filter(book => book.isbn !== isbn));
      this.errorMessage.set(`Failed to connect to backend to delete book. Updated locally.`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteAuthor(authorId: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const res = await fetch(`${this.API_BASE}/authors/${authorId}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
      } else {
        this.authors.update(allAuthors => allAuthors.filter(a => a.id !== authorId));
        this.books.update(allBooks => allBooks.filter(b => b.authorId !== authorId));
        this.errorMessage.set(`Could not delete author from backend (status ${res.status}). Updated locally.`);
      }
    } catch (e) {
      this.authors.update(allAuthors => allAuthors.filter(a => a.id !== authorId));
      this.books.update(allBooks => allBooks.filter(b => b.authorId !== authorId));
      this.errorMessage.set(`Failed to connect to backend to delete author. Updated locally.`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveBook(newBook: Book): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const res = await fetch(`${this.API_BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
        const currentSelected = this.selectedAuthor();
        if (currentSelected) {
          await this.selectAuthor(currentSelected.id);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || errorData.error || `Server returned status ${res.status}`;
        this.errorMessage.set(`Could not save book: ${errMsg}`);
      }
    } catch (e) {
      this.books.update(allBooks => [...allBooks, newBook]);
      this.errorMessage.set(`Failed to connect to backend to save book. Updated locally.`);
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
    const error = Author.validate(form);
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
      const res = await fetch(`${this.API_BASE}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAuthor.name, bio: newAuthor.bio })
      });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || errorData.error || `Server returned status ${res.status}`;
        this.errorMessage.set(`Could not save author: ${errMsg}`);
      }
    } catch (e) {
      this.authors.update(allAuthors => [...allAuthors, newAuthor]);
      this.errorMessage.set(`Failed to connect to backend to save author. Updated locally.`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
