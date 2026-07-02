'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.Author, {
        foreignKey: 'authorId',
        as: 'author'
      });
    }
  }
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Book title is required' },
        notEmpty: { msg: 'Book title cannot be empty' }
      }
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'ISBN must be unique'
      },
      validate: {
        notNull: { msg: 'ISBN is required' },
        notEmpty: { msg: 'ISBN cannot be empty' }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: 'Price is required' },
        isDecimal: { msg: 'Price must be a valid decimal' },
        gtZero(value) {
          if (parseFloat(value) <= 0) {
            throw new Error('Price must be greater than 0');
          }
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: 'Stock is required' },
        isInt: { msg: 'Stock must be an integer' },
        min: {
          args: [0],
          msg: 'Stock must be greater than or equal to 0'
        }
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Author ID is required' }
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};
