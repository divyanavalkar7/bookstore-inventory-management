import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  id?: number;
  title: string;
  isbn: string;
  price: number;
  stock: number;
  authorId: number;
}

export namespace Book {
  export function validate(
    form: {
      title: string;
      isbn: string;
      price: number | string;
      stock: number | string;
      authorId: number | string;
    },
    existingBooks: Book[]
  ): string | null {
    const isTitleBlank = !form.title || !form.title.trim();
    const isIsbnBlank = !form.isbn || !form.isbn.trim();
    const isAuthorBlank = !form.authorId || Number(form.authorId) === 0;
    const isPriceBlank = form.price === undefined || form.price === null || form.price === '' || Number(form.price) === 0;
    const isStockBlank = form.stock === undefined || form.stock === null || form.stock === '' || Number(form.stock) === 0;

    if (isTitleBlank && isIsbnBlank && isAuthorBlank && isPriceBlank && isStockBlank) {
      return 'Book Title, ISBN, Author, Price, and Stock are required.';
    }

    if (isTitleBlank) {
      return 'Book Title is required.';
    }
    if (isIsbnBlank) {
      return 'ISBN is required.';
    }
    if (isAuthorBlank) {
      return 'Author is required.';
    }
    if (form.price === undefined || form.price === null || form.price === '' || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      return 'Price must be a positive number.';
    }
    if (form.stock === undefined || form.stock === null || form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      return 'Stock must be 0 or greater.';
    }

    const isbnExists = existingBooks.some(b => b.isbn === form.isbn.trim());
    if (isbnExists) {
      return 'A book with this ISBN already exists in the inventory.';
    }

    return null;
  }

  export function fromForm(form: {
    title: string;
    isbn: string;
    price: number | string;
    stock: number | string;
    authorId: number | string;
  }): Book {
    return {
      title: form.title.trim(),
      isbn: form.isbn.trim(),
      price: parseFloat(form.price.toString()),
      stock: parseInt(form.stock.toString(), 10),
      authorId: parseInt(form.authorId.toString(), 10)
    };
  }

  export function adjustStock(bookId: number, stock: number, apiBase: string, http: HttpClient): Observable<Book> {
    return http.patch<Book>(`${apiBase}/books/${bookId}/stock`, { change: stock });
  }
}
