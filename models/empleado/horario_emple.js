const { DataTypes } = require("sequelize");
const sequelize = require("../../db/config");
const Empleado = require("./empleado");
const Horario = require("../horario/horario");

const HorarioEmple = sequelize.define(
  "HorarioEmple",
  {
    EmpleadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Empleado,
        key: "id",
      },
    },

    HorarioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Horario,
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = HorarioEmple;
