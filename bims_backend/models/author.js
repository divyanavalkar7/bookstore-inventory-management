'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.hasMany(models.Book, {
        foreignKey: 'authorId',
        as: 'books',
        onDelete: 'RESTRICT'
      });
    }
  }
  Author.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Author name must be unique'
      },
      validate: {
        notNull: { msg: 'Author name is required' },
        notEmpty: { msg: 'Author name cannot be empty' }
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Author',
  });
  return Author;
};
