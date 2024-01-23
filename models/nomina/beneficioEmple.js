const { DataTypes } = require("sequelize");
const sequelize = require("../../db/config");
const Empleado = require("../empleado/empleado");
const Beneficio = require("./beneficio");

const BeneficioEmple = sequelize.define(
  "BeneficioEmple",
  {
    EmpleadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Empleado,
        key: "id",
      },
    },

    BeneficioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Beneficio,
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = BeneficioEmple;
