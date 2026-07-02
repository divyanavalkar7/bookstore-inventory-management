import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { Author } from '../models';

@Component({
  selector: 'app-add-author',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_MODULES],
  templateUrl: './add-author.component.html'
})
export class AddAuthorComponent {
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();

  newAuthorForm = {
    name: '',
    bio: ''
  };

  constructor(private service: InventoryService) {}

  onClose(): void {
    this.closePanel.emit();
    this.newAuthorForm = { name: '', bio: '' };
  }

  saveAuthor(event: Event): void {
    event.preventDefault();
    if (!this.newAuthorForm.name) {
      alert("Please enter the author's name.");
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
    this.onClose();
  }
}
