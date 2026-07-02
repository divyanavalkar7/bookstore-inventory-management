import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from './material';
import { Author, Book } from './models';


@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_MODULES
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Backend config
  private readonly API_BASE = 'http://localhost:3000';

  // Navigation / View state
  protected readonly currentView = signal<'dashboard' | 'books' | 'authors'>('dashboard');

  // Search filter
  protected readonly searchQuery = signal<string>('');

  // Selected Author Detail State (consumes GET /authors/:id)
  protected readonly selectedAuthor = signal<Author | null>(null);
  protected readonly isLoadingAuthorDetails = signal<boolean>(false);

  // Sliding Form Panel state
  protected readonly isBookPanelOpen = signal<boolean>(false);
  protected readonly isAuthorPanelOpen = signal<boolean>(false);

  // Initial local/fallback data matching Database Schema
  protected readonly authors = signal<Author[]>([
    { id: 1, name: 'Martin Fowler', bio: 'Renowned software engineer, specialized in software design, Refactoring, and enterprise patterns.' },
    { id: 2, name: 'Robert C. Martin (Uncle Bob)', bio: 'Author of Clean Code, Clean Architecture, and one of the creators of the Agile Manifesto.' },
    { id: 3, name: 'Andrew Hunt', bio: 'Co-author of The Pragmatic Programmer, co-founder of the Pragmatic Bookshelf, and Agile advocate.' },
    { id: 4, name: 'Eric Evans', bio: 'Writer and consultant, author of Domain-Driven Design (DDD) which revolutionized software design patterns.' }
  ]);

  protected readonly books = signal<Book[]>([
    { title: 'Refactoring: Improving the Design of Existing Code', isbn: '978-0134757599', price: 49.99, stock: 15, authorId: 1 },
    { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', isbn: '978-0132350884', price: 39.99, stock: 4, authorId: 2 },
    { title: 'The Pragmatic Programmer: Your Journey to Mastery', isbn: '978-0135957059', price: 42.50, stock: 0, authorId: 3 },
    { title: 'Domain-Driven Design: Tackling Complexity in the Heart of Software', isbn: '978-0321125217', price: 55.00, stock: 18, authorId: 4 },
    { title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure', isbn: '978-0134494166', price: 35.99, stock: 25, authorId: 2 }
  ]);

  // Form bindings
  protected newBookForm = {
    title: '',
    isbn: '',
    price: 0,
    stock: 0,
    authorId: 0
  };

  protected newAuthorForm = {
    name: '',
    bio: ''
  };

  // Computed Values for dashboard statistics
  protected readonly totalValue = computed(() => 
    this.books().reduce((acc, book) => acc + (book.price * book.stock), 0)
  );

  protected readonly outOfStockCount = computed(() => 
    this.books().filter(book => book.stock === 0).length
  );

  protected readonly lowStockCount = computed(() => 
    this.books().filter(book => book.stock > 0 && book.stock <= 10).length
  );

  protected readonly wellStockedCount = computed(() => 
    this.books().filter(book => book.stock > 10).length
  );

  protected readonly criticalBooks = computed(() => 
    this.books()
      .filter(book => book.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
  );

  // Search and filter logic
  protected readonly filteredBooks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.books();
    }
    return this.books().filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.isbn.toLowerCase().includes(query)
    );
  });

  async ngOnInit() {
    await this.fetchBooksAndAuthors();
  }

  // Fetch initial data from backend API
  async fetchBooksAndAuthors(): Promise<void> {
    try {
      const booksRes = await fetch(`${this.API_BASE}/books`);
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        this.books.set(booksData);
      }
      
      const authorsRes = await fetch(`${this.API_BASE}/authors`);
      if (authorsRes.ok) {
        const authorsData = await authorsRes.json();
        this.authors.set(authorsData);
      }
    } catch (e) {
      console.warn('Backend server not reachable. Running in standalone mock mode.', e);
    }
  }

  // Fetch detailed author profile with associated books (GET /authors/:id)
  async selectAuthor(authorId: number): Promise<void> {
    this.isLoadingAuthorDetails.set(true);
    this.selectedAuthor.set(null);

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
        // Backend returns associated books in the 'books' field
        this.selectedAuthor.set(remoteAuthor);
      } else {
        this.selectedAuthor.set(fallbackDetails);
      }
    } catch (e) {
      console.warn(`Could not fetch author details from API. Using local fallback.`, e);
      this.selectedAuthor.set(fallbackDetails);
    } finally {
      this.isLoadingAuthorDetails.set(false);
    }
  }

  closeAuthorDetail(): void {
    this.selectedAuthor.set(null);
  }

  // Action Handlers
  setView(view: 'dashboard' | 'books' | 'authors'): void {
    this.currentView.set(view);
    if (view !== 'authors') {
      this.closeAuthorDetail();
    }
  }

  updateSearchQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  toggleBookPanel(open: boolean): void {
    this.isBookPanelOpen.set(open);
    if (open) {
      // Reset form
      this.newBookForm = {
        title: '',
        isbn: '',
        price: 0,
        stock: 0,
        authorId: 0
      };
    }
  }

  toggleAuthorPanel(open: boolean): void {
    this.isAuthorPanelOpen.set(open);
    if (open) {
      // Reset form
      this.newAuthorForm = {
        name: '',
        bio: ''
      };
    }
  }

  getAuthorName(authorId: number | string): string {
    const id = typeof authorId === 'string' ? parseInt(authorId, 10) : authorId;
    const author = this.authors().find(a => a.id === id);
    return author ? author.name : 'Unknown Author';
  }

  getAuthorBookCount(authorId: number): number {
    return this.books().filter(b => b.authorId === authorId).length;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  async adjustStock(isbn: string, amount: number): Promise<void> {
    const book = this.books().find(b => b.isbn === isbn);
    if (!book) return;
    const newStock = Math.max(0, book.stock + amount);

    try {
      const res = await fetch(`${this.API_BASE}/books/${isbn}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
      } else {
        this.updateLocalStock(isbn, newStock);
      }
    } catch (e) {
      this.updateLocalStock(isbn, newStock);
    }
  }

  private updateLocalStock(isbn: string, newStock: number): void {
    this.books.update(allBooks => 
      allBooks.map(b => b.isbn === isbn ? { ...b, stock: newStock } : b)
    );
  }

  async deleteBook(isbn: string): Promise<void> {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        const res = await fetch(`${this.API_BASE}/books/${isbn}`, { method: 'DELETE' });
        if (res.ok) {
          await this.fetchBooksAndAuthors();
        } else {
          this.books.update(allBooks => allBooks.filter(book => book.isbn !== isbn));
        }
      } catch (e) {
        this.books.update(allBooks => allBooks.filter(book => book.isbn !== isbn));
      }
    }
  }

  async deleteAuthor(authorId: number): Promise<void> {
    if (confirm('Deleting this author will remove associated books (if any). Continue?')) {
      try {
        const res = await fetch(`${this.API_BASE}/authors/${authorId}`, { method: 'DELETE' });
        if (res.ok) {
          await this.fetchBooksAndAuthors();
        } else {
          this.authors.update(allAuthors => allAuthors.filter(a => a.id !== authorId));
          this.books.update(allBooks => allBooks.filter(b => b.authorId !== authorId));
        }
      } catch (e) {
        this.authors.update(allAuthors => allAuthors.filter(a => a.id !== authorId));
        this.books.update(allBooks => allBooks.filter(b => b.authorId !== authorId));
      }
    }
  }

  async saveBook(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.newBookForm.title || !this.newBookForm.isbn || !this.newBookForm.authorId || this.newBookForm.price <= 0) {
      alert('Please fill out all required fields with valid values.');
      return;
    }

    const isbnExists = this.books().some(b => b.isbn === this.newBookForm.isbn);
    if (isbnExists) {
      alert('A book with this ISBN already exists in the inventory.');
      return;
    }

    const newBook: Book = {
      title: this.newBookForm.title,
      isbn: this.newBookForm.isbn,
      price: parseFloat(this.newBookForm.price.toString()),
      stock: parseInt(this.newBookForm.stock.toString(), 10),
      authorId: parseInt(this.newBookForm.authorId.toString(), 10)
    };

    try {
      const res = await fetch(`${this.API_BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
      } else {
        this.books.update(allBooks => [...allBooks, newBook]);
      }
    } catch (e) {
      this.books.update(allBooks => [...allBooks, newBook]);
    }
    
    this.toggleBookPanel(false);
  }

  async saveAuthor(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.newAuthorForm.name) {
      alert('Please enter the author\'s name.');
      return;
    }

    const nextId = this.authors().length > 0 
      ? Math.max(...this.authors().map(a => a.id)) + 1 
      : 1;

    const newAuthor: Author = {
      id: nextId,
      name: this.newAuthorForm.name,
      bio: this.newAuthorForm.bio
    };

    try {
      const res = await fetch(`${this.API_BASE}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAuthor.name, bio: newAuthor.bio })
      });
      if (res.ok) {
        await this.fetchBooksAndAuthors();
      } else {
        this.authors.update(allAuthors => [...allAuthors, newAuthor]);
      }
    } catch (e) {
      this.authors.update(allAuthors => [...allAuthors, newAuthor]);
    }
    
    this.toggleAuthorPanel(false);
  }
}
