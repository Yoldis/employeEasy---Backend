const {Router} = require('express');
const {validarCampos} = require('../middleware/validarCampos');
const validarToken = require('../middleware/validarToken');
const { check, query } = require('express-validator');
const { isAdminOrRrhh } = require('../middleware/validar-db');
const { registrarCargo, obtenerCargos, actualizarCargo, eliminarCargo } = require('../controller');
const validarHorario = require('../middleware/validarHorario');

const router = Router();


router.post('/', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], registrarCargo);


router.get('/', [
    query('limit', 'Se debe proporcionar el limite de datos').notEmpty({ignore_whitespace:true}),
    validarCampos
], obtenerCargos);

router.put('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], actualizarCargo);


router.delete('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('limit', 'Se debe proporcionar el limite de datos').notEmpty({ignore_whitespace:true}),
    validarCampos
], eliminarCargo);


module.exports = router;