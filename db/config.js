const { Sequelize } = require('sequelize');
require('dotenv').config();

const database = process.env.DB_NAME; // Nombre de la base de datos
const username = process.env.DB_USER; // Nombre de usuario
const password = process.env.DB_PASSWORD; // Contraseña
const host = process.env.DB_HOST; // Host
const dialect = process.env.DB_DIALECT; // Dialecto


const sequelize = new Sequelize(database, username, password, {
  host,
  dialect
});

module.exports = sequelize;