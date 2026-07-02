import { Book } from './book.model';

export interface Author {
  id: number;
  name: string;
  bio?: string;
  books?: Book[];
}

export namespace Author {
  export function validate(form: { name: string; bio?: string }): string | null {
    if (!form.name || !form.name.trim()) {
      return "Please enter the author's name.";
    }
    return null;
  }

  export function fromForm(form: { name: string; bio?: string }, existingAuthors: Author[]): Author {
    const nextId = existingAuthors.length > 0
      ? Math.max(...existingAuthors.map(a => a.id)) + 1
      : 1;
    return {
      id: nextId,
      name: form.name.trim(),
      bio: form.bio ? form.bio.trim() : ''
    };
  }
}
