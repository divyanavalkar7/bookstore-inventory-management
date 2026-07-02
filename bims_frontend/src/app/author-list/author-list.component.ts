import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { Author } from '../models';
import { AddAuthorComponent } from './add-author.component';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, AddAuthorComponent],
  templateUrl: './author-list.component.html',
  styleUrl: './author-list.component.css'
})
export class AuthorListComponent {
  isAuthorPanelOpen = signal<boolean>(false);

  constructor(public service: InventoryService, private router: Router) {}

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAuthorBookCount(authorId: number): number {
    return this.service.books().filter(b => b.authorId === authorId).length;
  }

  navigateToDetail(authorId: number): void {
    this.router.navigate(['/authors', authorId]);
  }

  toggleAuthorPanel(open: boolean): void {
    this.isAuthorPanelOpen.set(open);
  }

  deleteAuthor(authorId: number): void {
    const bookCount = this.getAuthorBookCount(authorId);
    if (bookCount > 0) {
      alert(`Cannot delete this author because they have ${bookCount} associated book(s) in the inventory.`);
      return;
    }
    if (confirm('Are you sure you want to delete this author?')) {
      this.service.deleteAuthor(authorId);
    }
  }
}
