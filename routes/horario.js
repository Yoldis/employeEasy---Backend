const { Router } = require("express");
const {validarCampos} = require("../middleware/validarCampos");
const validarToken = require("../middleware/validarToken");
const { check, query } = require("express-validator");
const { isAdmin } = require("../middleware/validar-db");
const {
  registrarHorario,
  obtenerHorarios,
  actualizarHorario,
  eliminarHorario,
  obtenerDias,
  obtenerTurnos,
} = require("../controller/horario");
const validarHora = require("../middleware/validarHoras");
const { existeDias } = require("../helpers/validar");
const validarHorario = require("../middleware/validarHorario");

const router = Router();

router.post(
  "/",
  [
    validarToken,
    isAdmin,
    validarHorario,
    check("turno", "El turno es obligatorio").notEmpty({ignore_whitespace:true}),
    check("hora_entrada", "La hora entrada es obligatorio").isTime(),
    check("hora_salida", "La hora salida es obligatorio").isTime(),
    check("horas", "Las hora son obligatorias").notEmpty({ignore_whitespace:true}),
    check("diasSemana").custom(existeDias),
    validarCampos,
    validarHora,
  ],
  registrarHorario
);

router.get(
  "/",
  [
    query("limit", "Se debe proporcionar el limite de datos").notEmpty({ignore_whitespace:true}),
    validarCampos,
  ],
  obtenerHorarios
);

router.put(
  "/:id",
  [
    validarToken,
    isAdmin,
    validarHorario,
    check("turno", "El turno es obligatorio").notEmpty({ignore_whitespace:true}),
    check("hora_entrada", "La hora entrada es obligatorio").isTime(),
    check("hora_salida", "La hora salida es obligatorio").isTime(),
    check("horas", "Las hora son obligatorias").notEmpty({ignore_whitespace:true}),
    check("diasSemana").custom(existeDias),
    validarCampos,
    validarHora,
  ],
  actualizarHorario
);

router.delete(
  "/:id",
  [
    validarToken,
    isAdmin,
    validarHorario,
    check("limit", "Se debe proporcionar el limite de datos").notEmpty({ignore_whitespace:true}),
    validarCampos,
  ],
  eliminarHorario
);

router.get("/dias", obtenerDias);
router.get("/turnos", obtenerTurnos);

module.exports = router;
