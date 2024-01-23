const { DataTypes } = require("sequelize");
const sequelize = require("../../db/config");
const Horario = require("./horario");
const DiaSemana = require("./diaSemana");

const HorarioDia = sequelize.define(
  "HorarioDia",
  {
    HorarioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Horario,
        key: "id",
      },
    },

    DiaSemanaId: {
      type: DataTypes.INTEGER,
      references: {
        model: DiaSemana,
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = HorarioDia;
