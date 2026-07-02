import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { Author } from '../models';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_MODULES],
  templateUrl: './author-list.component.html'
})
export class AuthorListComponent {
  isAuthorPanelOpen = signal<boolean>(false);
  newAuthorForm = {
    name: '',
    bio: ''
  };

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
    if (open) {
      this.newAuthorForm = {
        name: '',
        bio: ''
      };
    }
  }

  deleteAuthor(authorId: number): void {
    if (confirm('Deleting this author will remove associated books (if any). Continue?')) {
      this.service.deleteAuthor(authorId);
    }
  }

  saveAuthor(event: Event): void {
    event.preventDefault();
    if (!this.newAuthorForm.name) {
      alert('Please enter the author\'s name.');
      return;
    }

    const nextId = this.service.authors().length > 0
      ? Math.max(...this.service.authors().map(a => a.id)) + 1
      : 1;

    const newAuthor: Author = {
      id: nextId,
      name: this.newAuthorForm.name,
      bio: this.newAuthorForm.bio
    };

    this.service.saveAuthor(newAuthor);
    this.toggleAuthorPanel(false);
  }
}
