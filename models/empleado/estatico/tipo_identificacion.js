const { DataTypes } = require("sequelize");
const sequelize = require("../../../db/config");

const TipoIdentificacion = sequelize.define(
  "TipoIdentificacion",
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

module.exports = TipoIdentificacion;
