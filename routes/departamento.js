const {Router} = require('express');
const { registrarDepartamento, obtenerDepartamentos, actualizarDepartamento, eliminarDepartamento } = require('../controller');
const {validarCampos} = require('../middleware/validarCampos');
const validarToken = require('../middleware/validarToken');
const { check, query } = require('express-validator');
const { isAdminOrRrhh } = require('../middleware/validar-db');
const validarHorario = require('../middleware/validarHorario');

const router = Router();


router.post('/', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], registrarDepartamento);


router.get('/', [
    query('limit', 'Se debe proporcionar el limite de datos').notEmpty({ignore_whitespace:true}),
    validarCampos
], obtenerDepartamentos);


router.put('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], actualizarDepartamento);


router.delete('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('limit', 'Se debe proporcionar el limite de datos').notEmpty({ignore_whitespace:true}),
    validarCampos
], eliminarDepartamento);


module.exports = router;