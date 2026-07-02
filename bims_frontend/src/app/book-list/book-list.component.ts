import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';


@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_MODULES, RouterLink],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
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

  constructor(public service: InventoryService) { }

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

  adjustStock(bookId: number, amount: number): void {
    this.service.adjustStock(bookId, amount);
  }

  deleteBook(isbn: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.service.deleteBook(isbn);
    }
  }

  saveBook(event: Event): void {
    event.preventDefault();
    const errorMessage = this.service.validateAndSaveBook(this.newBookForm);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }
    this.toggleBookPanel(false);
  }
}
