import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MATERIAL_MODULES],
  templateUrl: './author-detail.component.html',
  styleUrl: './author-detail.component.css'
})
export class AuthorDetailComponent implements OnInit, OnDestroy {
  private routeSub!: Subscription;
  isBookPanelOpen = signal<boolean>(false);

  newBookForm = {
    title: '',
    isbn: '',
    price: 0,
    stock: 0,
    authorId: 0
  };

  constructor(public service: InventoryService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const authorId = parseInt(params['id'], 10);
      if (!isNaN(authorId)) {
        this.service.selectAuthor(authorId);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.service.selectedAuthor.set(null);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  toggleBookPanel(open: boolean): void {
    this.isBookPanelOpen.set(open);
    if (open) {
      const author = this.service.selectedAuthor();
      this.newBookForm = {
        title: '',
        isbn: '',
        price: 0,
        stock: 0,
        authorId: author ? author.id : 0
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
