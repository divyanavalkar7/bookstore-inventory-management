const test = require('node:test');
const assert = require('node:assert');
const app = require('../app');

// Start temporary test server
let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

test.after(async () => {
  if (server) {
    server.close();
  }
});

test('Integration Tests', async (t) => {
  
  await t.test('(a) Full Happy-Path Flow (create author, create book, list/find book)', async () => {
    // 1. Create Author
    const authorRes = await fetch(`${baseUrl}/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Happy Author ' + Date.now(),
        bio: 'A happy test author'
      })
    });
    assert.strictEqual(authorRes.status, 201);
    const authorData = await authorRes.json();
    assert.ok(authorData.id);
    const authorId = authorData.id;

    // 2. Create Book
    const uniqueIsbn = 'isbn-' + Date.now();
    const bookRes = await fetch(`${baseUrl}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Happy Book',
        isbn: uniqueIsbn,
        price: 15.99,
        stock: 5,
        authorId: authorId
      })
    });
    assert.strictEqual(bookRes.status, 201);
    const bookData = await bookRes.json();
    assert.ok(bookData.id);
    const bookId = bookData.id;

    // 3. List Books (Verify filter minPrice and inStock work)
    const listRes = await fetch(`${baseUrl}/books?inStock=true&minPrice=10`);
    assert.strictEqual(listRes.status, 200);
    const books = await listRes.json();
    const createdBook = books.find(b => b.id === bookId);
    assert.ok(createdBook);
    assert.strictEqual(createdBook.title, 'Happy Book');
  });

  await t.test('(b) Validation Failure (missing author name should return 400)', async () => {
    const authorRes = await fetch(`${baseUrl}/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '', // Empty name trigger error
        bio: 'Invalid author'
      })
    });
    assert.strictEqual(authorRes.status, 400);
    const errorData = await authorRes.json();
    assert.ok(errorData.error);
    assert.strictEqual(errorData.error.field, 'name');
    assert.strictEqual(errorData.error.message, 'Author name cannot be empty');
  });

  await t.test('(c) Negative-Stock Rejection Rule (changing stock to negative should fail)', async () => {
    // 1. Create Author & Book
    const authorRes = await fetch(`${baseUrl}/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stock Author ' + Date.now(),
        bio: 'Author bio'
      })
    });
    const authorData = await authorRes.json();
    const authorId = authorData.id;

    const uniqueIsbn = 'stock-isbn-' + Date.now();
    const bookRes = await fetch(`${baseUrl}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Stock Book',
        isbn: uniqueIsbn,
        price: 12.00,
        stock: 2,
        authorId: authorId
      })
    });
    const bookData = await bookRes.json();
    const bookId = bookData.id;

    // 2. Try to change stock by -3 (resulting in 2 - 3 = -1)
    const patchRes = await fetch(`${baseUrl}/books/${bookId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        change: -3
      })
    });
    assert.strictEqual(patchRes.status, 400);
    const errorData = await patchRes.json();
    assert.ok(errorData.error);
    assert.strictEqual(errorData.error.field, 'stock');
    assert.strictEqual(errorData.error.message, 'Stock cannot go below zero');
  });
});
