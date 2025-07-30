const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bimatekdb', 'bimatekuser', 'bimatekpass', {
  host: 'bimatek_db', // matches docker-compose service name
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;
