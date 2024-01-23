const Auth = require('./auth');
const Usuario = require('./usuario');
const Departamento = require('./departamento');
const Cargo = require('./cargo');
const Horario = require('./horario');
const Empleado = require('./empleado');
const Ui = require('./ui');
const Asistencia = require('./asistencia');
const Deduccione = require('./deduccione');
const Beneficio = require('./beneficio');
const BeneficioEmple = require('./beneficiosEmple');
const PagosAdelantado = require('./pagoAdelantado');
const Nomina = require('./nomina');

module.exports = {
    ...Auth,
    ...Usuario,
    ...Departamento,
    ...Cargo,
    ...Horario,
    ...Empleado,
    ...Ui,
    ...Asistencia,
    ...Deduccione,
    ...Beneficio,
    ...BeneficioEmple,
    ...PagosAdelantado,
    ...Nomina
}