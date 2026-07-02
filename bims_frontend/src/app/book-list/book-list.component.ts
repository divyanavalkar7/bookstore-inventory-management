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

  stockFilter = signal<'all' | 'inStock' | 'outOfStock'>('all');
  minPriceFilter = signal<number | null>(null);

  filteredBooks = computed(() => {
    let books = this.service.books();

    // Stock Availability filter (local client filter)
    const stock = this.stockFilter();
    if (stock === 'inStock') {
      books = books.filter(book => book.stock > 0);
    } else if (stock === 'outOfStock') {
      books = books.filter(book => book.stock === 0);
    }

    return books;
  });

  updateStockFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.stockFilter.set(target.value as 'all' | 'inStock' | 'outOfStock');
  }

  updateMinPriceFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = target.value ? parseFloat(target.value) : null;
    const parsedVal = val && !isNaN(val) ? val : null;
    this.minPriceFilter.set(parsedVal);
    this.service.fetchBooksAndAuthors(parsedVal !== null ? parsedVal : undefined, this.searchQuery());
  }

  constructor(public service: InventoryService) { }

  getAuthorName(authorId: number | string): string {
    const id = typeof authorId === 'string' ? parseInt(authorId, 10) : authorId;
    const author = this.service.authors().find(a => a.id === id);
    return author ? author.name : 'Unknown Author';
  }

  updateSearchQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.searchQuery.set(query);
    this.service.fetchBooksAndAuthors(this.minPriceFilter() !== null ? (this.minPriceFilter() as number) : undefined, query);
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
