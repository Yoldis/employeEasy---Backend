const {Router} = require('express');
const { registrarBeneficiosEmple, obtenerBeneficiosEmple, actualizarBeneficiosEmple, eliminarBeneficiosEmple } = require('../controller/beneficiosEmple');
const {validarCampos} = require('../middleware/validarCampos');
const validarToken = require('../middleware/validarToken');
const { check, query } = require('express-validator');
const { isAdmin } = require('../middleware/validar-db');
const validarHorario = require('../middleware/validarHorario');
const { existeEmpleado } = require('../helpers/validar');

const router = Router();


router.post('/', [
    validarToken,
    isAdmin,
    validarHorario,
    check('empleadoId','El empleado no existe').custom(existeEmpleado),
    check('beneficiosEmple','Los beneficios son obligatorios').isArray({min:1}),
    validarCampos
], registrarBeneficiosEmple);


router.get('/', obtenerBeneficiosEmple);


router.put('/', [
    validarToken,
    isAdmin,
    validarHorario,
    check('empleadoId','El empleado no existe').custom(existeEmpleado),
    check('beneficiosEmple','Los beneficios son obligatorios').isArray({min:1}),
    validarCampos
], actualizarBeneficiosEmple);


router.delete('/:id', [
    validarToken,
    isAdmin,
    validarHorario,

], eliminarBeneficiosEmple);


module.exports = router;