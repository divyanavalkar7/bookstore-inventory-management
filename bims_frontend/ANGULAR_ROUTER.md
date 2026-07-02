# BIMS Angular Routing and Data Loading Documentation

This document describes the design decisions, routing configuration, and route-level data loading strategy implemented in the Bookstore Inventory Management System (BIMS).

---

## 1. Routing Architecture

The routing configuration is defined in [`app.routes.ts`](file:///home/blubirch/workspace/kpi_task/bims_frontend/src/app/app.routes.ts) using Angular's standalone `Routes` array:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'books', component: BookListComponent },
  { path: 'authors', component: AuthorListComponent },
  { path: 'authors/:id', component: AuthorDetailComponent },
  { path: '**', redirectTo: 'dashboard' }
];
```

We configure two primary feature routes:
1. **`/books`** (`BookListComponent`): Display and filter book titles.
2. **`/authors/:id`** (`AuthorDetailComponent`): View detailed metrics and books for a specific author.

---

## 2. Route-Level Data Loading Strategy

For data fetching on routing, we selected the **Route Parameter Fetching pattern** over Route Resolvers.

### Implementation Details:
In [`author-detail.component.ts`](file:///home/blubirch/workspace/kpi_task/bims_frontend/src/app/author-detail/author-detail.component.ts), we listen to parameter changes inside `ngOnInit` and invoke the API via the shared `InventoryService`:

```typescript
  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const authorId = parseInt(params['id'], 10);
      if (!isNaN(authorId)) {
        // Triggers Angular HttpClient API call and updates state signals
        this.service.selectAuthor(authorId);
      }
    });
  }
```
And to avoid memory leaks, the active subscription is cleanly disposed of during `ngOnDestroy`:
```typescript
  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    // Clean up current selection
    this.service.selectedAuthor.set(null);
  }
```
