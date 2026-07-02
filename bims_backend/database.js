const { Sequelize } = require('sequelize');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: env === 'development' ? console.log : false,
});

module.exports = sequelize;
