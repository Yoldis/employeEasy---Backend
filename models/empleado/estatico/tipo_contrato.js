const { DataTypes } = require("sequelize");
const sequelize = require("../../../db/config");

const TipoContrato = sequelize.define(
  "TipoContrato",
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

module.exports = TipoContrato;
