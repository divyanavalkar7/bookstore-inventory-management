import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { StockDistributionComponent } from './stock-distribution.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, StockDistributionComponent, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  constructor(public service: InventoryService) {}

  getAuthorName(authorId: number | string): string {
    const id = typeof authorId === 'string' ? parseInt(authorId, 10) : authorId;
    const author = this.service.authors().find(a => a.id === id);
    return author ? author.name : 'Unknown Author';
  }
}
