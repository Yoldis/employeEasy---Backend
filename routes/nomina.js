const {Router} =require('express');
const { generarNomina, obtenerNominas, obtenerNominaPorEmpleado } = require('../controller');
const validarToken = require('../middleware/validarToken');
const { isAdminOrRrhh } = require('../middleware/validar-db');
const validarHorario = require('../middleware/validarHorario');
const { check, query } = require('express-validator');
const { validarCampos } = require('../middleware/validarCampos');
const { validarFecha } = require('../helpers/validar');

const router = Router();


router.post('/', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('fecha', 'La fecha es obligatoria').custom(validarFecha),
    check('moneda', 'La moneda es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], generarNomina);


router.get('/', [
    query('fecha', 'La fecha no es valida').custom(validarFecha),
    validarCampos
], obtenerNominas);


router.get('/empleado', [
    query('fecha', 'La fecha no es valida').custom(validarFecha),
    query('empleadoId', 'El empleado es obligatorio').notEmpty({ignore_whitespace:true}),
    validarCampos
], obtenerNominaPorEmpleado);

module.exports = router;