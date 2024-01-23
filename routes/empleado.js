const {Router} = require('express');
const {validarCampos} = require('../middleware/validarCampos');
const validarToken = require('../middleware/validarToken');
const { check, query } = require('express-validator');
const { isAdminOrRrhh } = require('../middleware/validar-db');
const { registrarEmpleado, obtenerEmpleados, actualizarEmpleado, eliminarEmpleado, obtenerGeneros, obtenerEstadoCivil, obtenerEstados, obtenerTipoidentificacion, obtenerTipocuenta, obtenerTipocontratos } = require('../controller/empleado');
const { validarFecha } = require('../helpers/validar');
const validarHorario = require('../middleware/validarHorario');

const router = Router();


router.post('/', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('nombre', 'El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('cargo', 'El cargo es obligatorio').notEmpty({ignore_whitespace:true}),
    check('departamento', 'El departamento es obligatorio').notEmpty({ignore_whitespace:true}),
    check('salario', 'El salario es obligatorio').notEmpty({ignore_whitespace:true}),
    check('fecha_nacimiento').custom(validarFecha),
    check('edad', 'El edad es obligatorio').notEmpty({ignore_whitespace:true}),
    check('genero', `El genero es obligatorio`).notEmpty({ignore_whitespace:true}),
    check('estadoCivil', `Estado Civil es obligatorio`).notEmpty({ignore_whitespace:true}),
    check('nacionalidad', 'La nacionalidad es obligatorio').notEmpty({ignore_whitespace:true}),
    check('email', 'El email no es valido').isEmail(),
    check('telefono', 'El telefeno no es correcto').notEmpty({ignore_whitespace:true}),
    check('tipoIdentificacion', `Tipo identificacion es obligatorio`).notEmpty({ignore_whitespace:true}),
    check('num_identificacion', 'La indentificacion es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
],  registrarEmpleado);


router.get('/', [
    query('limit', 'Se debe proporcionar el limite de datos').notEmpty({ignore_whitespace:true}),
    validarCampos
], obtenerEmpleados);


router.put('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('nombre', 'El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('cargo', 'El cargo es obligatorio').notEmpty({ignore_whitespace:true}),
    check('departamento', 'El departamento es obligatorio').notEmpty({ignore_whitespace:true}),
    check('salario', 'El salario es obligatorio').notEmpty({ignore_whitespace:true}),
    check('fecha_nacimiento').custom(validarFecha),
    check('edad', 'El edad es obligatorio').notEmpty({ignore_whitespace:true}),
    check('genero', `El genero es obligatorio`).notEmpty({ignore_whitespace:true}),
    check('estadoCivil', `Estado Civil es obligatorio`).notEmpty({ignore_whitespace:true}),
    check('nacionalidad', 'La nacionalidad es obligatorio').notEmpty({ignore_whitespace:true}),
    check('email', 'El email no es valido').isEmail(),
    check('telefono', 'El telefeno no es correcto').notEmpty({ignore_whitespace:true}),
    check('tipoIdentificacion', `Tipo identificacion es obligatorio`).notEmpty({ignore_whitespace:true}),
    check('num_identificacion', 'La indentificacion es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos,
], actualizarEmpleado);


router.delete('/:id', [
    validarToken,
    isAdminOrRrhh,
    validarHorario,
    check('limit', 'Se debe proporcionar el limite de datos').notEmpty({ignore_whitespace:true}),
    validarCampos
], eliminarEmpleado);


router.get('/generos', obtenerGeneros);
router.get('/estadosCivil', obtenerEstadoCivil);
router.get('/estados', obtenerEstados);
router.get('/tipoidentificacion', obtenerTipoidentificacion);
router.get('/tipocuenta', obtenerTipocuenta);
router.get('/tipocontratos', obtenerTipocontratos);

module.exports = router;