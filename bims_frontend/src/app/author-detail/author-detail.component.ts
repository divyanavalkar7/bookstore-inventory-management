import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../material';
import { InventoryService } from '../inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MATERIAL_MODULES],
  templateUrl: './author-detail.component.html'
})
export class AuthorDetailComponent implements OnInit, OnDestroy {
  private routeSub!: Subscription;

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
}
