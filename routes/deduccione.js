const{Router} = require('express');
const { registrarDeduccion, obtenerDeducciones, actualizarDeduccion, eliminarDeduccion } = require('../controller');
const { validarCampos } = require('../middleware/validarCampos');
const { check } = require('express-validator');
const validarToken = require('../middleware/validarToken');
const { isAdmin } = require('../middleware/validar-db');
const validarHorario = require('../middleware/validarHorario');


const router = Router();


router.post('/', [
    validarToken,
    isAdmin,
    validarHorario,
    check('tipo','El tipo debe ser: Fijo o Porciento').isIn(['Fijo', 'Porciento']),
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('monto','el monto es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], registrarDeduccion);

router.get('/', obtenerDeducciones);

router.put('/:id', [
    validarToken,
    isAdmin,
    validarHorario,
    check('tipo','El tipo debe ser: Fijo o Porciento').isIn(['Fijo', 'Porciento']),
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('monto','El monto es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], actualizarDeduccion);

router.delete('/:id', [
    validarToken,
    isAdmin,
    validarHorario,
], eliminarDeduccion);


module.exports = router;