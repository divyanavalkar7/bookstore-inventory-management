import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { Book } from '../models';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_MODULES],
  templateUrl: './book-list.component.html'
})
export class BookListComponent {
  searchQuery = signal<string>('');
  isBookPanelOpen = signal<boolean>(false);

  newBookForm = {
    title: '',
    isbn: '',
    price: 0,
    stock: 0,
    authorId: 0
  };

  filteredBooks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.service.books();
    }
    return this.service.books().filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query)
    );
  });

  constructor(public service: InventoryService) {}

  getAuthorName(authorId: number | string): string {
    const id = typeof authorId === 'string' ? parseInt(authorId, 10) : authorId;
    const author = this.service.authors().find(a => a.id === id);
    return author ? author.name : 'Unknown Author';
  }

  updateSearchQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  toggleBookPanel(open: boolean): void {
    this.isBookPanelOpen.set(open);
    if (open) {
      this.newBookForm = {
        title: '',
        isbn: '',
        price: 0,
        stock: 0,
        authorId: 0
      };
    }
  }

  adjustStock(isbn: string, amount: number): void {
    this.service.adjustStock(isbn, amount);
  }

  deleteBook(isbn: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.service.deleteBook(isbn);
    }
  }

  saveBook(event: Event): void {
    event.preventDefault();
    if (!this.newBookForm.title || !this.newBookForm.isbn || !this.newBookForm.authorId || this.newBookForm.price <= 0) {
      alert('Please fill out all required fields with valid values.');
      return;
    }

    const isbnExists = this.service.books().some(b => b.isbn === this.newBookForm.isbn);
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

    this.service.saveBook(newBook);
    this.toggleBookPanel(false);
  }
}
