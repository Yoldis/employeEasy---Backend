const Usuario = require("./usuario");
const Role = require("./role");
const Departamento = require("./departamento");
const Cargo = require("./cargo");
const Asistencia = require('./asistencia');
const Empresa = require('./empresa');

// Horario
const Horario = require("./horario/horario");
const DiaSemana = require("./horario/diaSemana");
const HorarioDia = require("./horario/horario_dia");
const Turno = require('./horario/turno');

// Empleado

const Empleado = require("./empleado/empleado");
const Direccion = require("./empleado/direccion");
const Emergencia = require("./empleado/emergencia");
const Laboral = require("./empleado/laboral");
const Bancaria = require("./empleado/bancaria");
const Documento = require("./empleado/documento");
const Historial = require("./empleado/historial");
const HorarioEmple = require("./empleado/horario_emple");

// Empleado Data Estatico
const Genero = require("./empleado/estatico/genero");
const EstadoCivil = require("./empleado/estatico/estado_civil");
const Estado = require("./empleado/estatico/estado");
const TipoIdentificacion = require("./empleado/estatico/tipo_identificacion");
const TipoCuenta = require("./empleado/estatico/tipo_cuenta");
const TipoContrato = require("./empleado/estatico/tipo_contrato");

// Nomina
const Deduccione = require('./nomina/deduccione');
const Beneficio = require('./nomina/beneficio');
const BeneficioEmple = require('./nomina/beneficioEmple');
const PagoAdelantado = require('./nomina/pagoAdelantado');
const Nomina = require('./nomina/nomina');
const NominaDeduccione = require('./nomina/nominaDeduccione');
const NominaBeneficio = require('./nomina/nominaBeneficio');
const NominaPagoAdelantado = require('./nomina/nominaPagoAdelantado');


module.exports = {
  Usuario,
  Role,
  Departamento,
  Cargo,
  Asistencia,
  Empresa,

  // Horario
  Horario,
  DiaSemana,
  HorarioDia,
  Turno,

  // Empleado
  Empleado,
  Direccion,
  Emergencia,
  Laboral,
  Bancaria,
  Documento,
  Historial,
  HorarioEmple,

  // Empleado Data Estatico
  Genero,
  EstadoCivil,
  Estado,
  TipoIdentificacion,
  TipoCuenta,
  TipoContrato,

  // Nomina
  Deduccione,
  Beneficio,
  BeneficioEmple,
  PagoAdelantado,
  Nomina,
  NominaDeduccione,
  NominaBeneficio,
  NominaPagoAdelantado
};
