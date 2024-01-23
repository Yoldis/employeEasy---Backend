const { DataTypes } = require("sequelize");
const sequelize = require("../../db/config");

const Horario = sequelize.define(
  "Horario",
  {

    hora_entrada: {
      type: DataTypes.TIME,
    },

    hora_salida: {
      type: DataTypes.TIME,
    },

    horas: {
      type: DataTypes.INTEGER,
    },
    
  },
  {
    timestamps: false,
  }
);

module.exports = Horario;
