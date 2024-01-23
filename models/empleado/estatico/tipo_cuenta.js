const { DataTypes } = require("sequelize");
const sequelize = require("../../../db/config");

const TipoCuenta = sequelize.define(
  "TipoCuenta",
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

module.exports = TipoCuenta;
