const { DataTypes } = require("sequelize");
const sequelize = require("../../../db/config");

const Estado = sequelize.define(
  "Estado",
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

module.exports = Estado;
