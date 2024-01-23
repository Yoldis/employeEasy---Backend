const {Router} = require('express');
const { registrarBeneficio, obtenerBeneficios, actualizarBeneficio, eliminarBeneficio } = require('../controller/beneficio');
const {validarCampos} = require('../middleware/validarCampos');
const validarToken = require('../middleware/validarToken');
const { check } = require('express-validator');
const { isAdmin } = require('../middleware/validar-db');
const validarHorario = require('../middleware/validarHorario');

const router = Router();


router.post('/', [
    validarToken,
    isAdmin,
    validarHorario,
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('monto','El monto es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], registrarBeneficio);


router.get('/', obtenerBeneficios);


router.put('/:id', [
    validarToken,
    isAdmin,
    validarHorario,
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('monto','El monto es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], actualizarBeneficio);


router.delete('/:id', [
    validarToken,
    isAdmin,
    validarHorario,
], eliminarBeneficio);


module.exports = router;