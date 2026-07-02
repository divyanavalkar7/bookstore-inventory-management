'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.hasMany(models.Book, {
        foreignKey: 'authorId',
        as: 'books',
        onDelete: 'CASCADE'
      });
    }
  }
  Author.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
