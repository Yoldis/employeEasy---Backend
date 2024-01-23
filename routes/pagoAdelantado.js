const {Router} = require('express');
const {registrarPago, obtenerPagos, actualizarPago, eliminarPago} = require('../controller/pagoAdelantado');
const {validarCampos} = require('../middleware/validarCampos');
const validarToken = require('../middleware/validarToken');
const { check, query } = require('express-validator');
const { isAdminOrRrhh } = require('../middleware/validar-db');
const validarHorario = require('../middleware/validarHorario');
const { existeEmpleado } = require('../helpers/validar');

const router = Router();


router.post('/', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('empleadoId','El empleado es obligatorio').custom(existeEmpleado),
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('monto','El monto es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], registrarPago);


router.get('/', obtenerPagos);


router.put('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('empleadoId','El empleado es obligatorio').custom(existeEmpleado),
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('monto','El monto es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], actualizarPago);


router.delete('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
], eliminarPago);


module.exports = router;