import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BookListComponent } from './book-list/book-list.component';
import { AuthorListComponent } from './author-list/author-list.component';
import { AuthorDetailComponent } from './author-detail/author-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'books', component: BookListComponent },
  { path: 'authors', component: AuthorListComponent },
  { path: 'authors/:id', component: AuthorDetailComponent },
  { path: '**', redirectTo: 'dashboard' }
];
