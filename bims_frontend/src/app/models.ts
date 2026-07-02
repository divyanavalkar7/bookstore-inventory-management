export interface Book {
  title: string;
  isbn: string;
  price: number;
  stock: number;
  authorId: number;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
  books?: Book[];
}
