import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-add-author',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_MODULES],
  templateUrl: './add-author.component.html',
  styleUrl: './add-author.component.css'
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
    const error = this.service.validateAndSaveAuthor(this.newAuthorForm);
    if (error) {
      alert(error);
      return;
    }
    this.onClose();
  }
}
