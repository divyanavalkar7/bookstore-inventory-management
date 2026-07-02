import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-stock-distribution',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './stock-distribution.component.html',
  styleUrl: './stock-distribution.component.css'
})
export class StockDistributionComponent {
  constructor(public service: InventoryService) {}
}
