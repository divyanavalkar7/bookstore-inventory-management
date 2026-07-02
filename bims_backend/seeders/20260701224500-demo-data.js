'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert Authors
    await queryInterface.bulkInsert('Authors', [
      {
        name: 'Triveni',
        bio: 'Anasuya Shankar, popularly known by her pen name Triveni, was an influential Kannada novelist.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Shivaram Karanth',
        bio: 'Kota Shivaram Karanth was an Indian novelist in the Kannada language, playwright and ecological activist.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sudha Murty',
        bio: 'Indian educator, author and philanthropist, chairperson of the Infosys Foundation.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Retrieve inserted authors to get their IDs
    const authors = await queryInterface.sequelize.query(
      `SELECT id, name from "Authors";`
    );

    const authorRows = authors[0];
    const triveni = authorRows.find(a => a.name === 'Triveni');
    const shivaramKaranth = authorRows.find(a => a.name === 'Shivaram Karanth');
    const sudhaMurty = authorRows.find(a => a.name === 'Sudha Murty');

    // Insert Books
    await queryInterface.bulkInsert('Books', [
      {
        title: 'Kashi Yatre',
        isbn: '9788172863487',
        price: 12.50,
        stock: 30,
        authorId: triveni.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Marali Mannige',
        isbn: '9788172861247',
        price: 15.00,
        stock: 25,
        authorId: shivaramKaranth.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Mookajjina Kanasugalu',
        isbn: '9788172862114',
        price: 18.00,
        stock: 15,
        authorId: shivaramKaranth.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Wise and Otherwise',
        isbn: '9780143062226',
        price: 9.99,
        stock: 100,
        authorId: sudhaMurty.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Sharapanjara',
        isbn: '9788172862800',
        price: 13.00,
        stock: 22,
        authorId: triveni.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Chellidaru Bandhana',
        isbn: '9788172863494',
        price: 10.50,
        stock: 20,
        authorId: triveni.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Delete all books and authors
    await queryInterface.bulkDelete('Books', null, {});
    await queryInterface.bulkDelete('Authors', null, {});
  }
};
