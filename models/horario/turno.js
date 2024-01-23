const { DataTypes } = require("sequelize");
const sequelize = require("../../db/config");

const Turno = sequelize.define(
  "Turno",
  {
    nombre: {
      type:DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Turno;
