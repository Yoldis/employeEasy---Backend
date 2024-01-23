const { DataTypes } = require("sequelize");
const sequelize = require("../../../db/config");

const Genero = sequelize.define(
  "Genero",
  {
    nombre: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Genero;
