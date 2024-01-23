const {Router} = require('express');
const { check } = require('express-validator');
const { registrarAsistencia, restablecerAsistenciaHoras, obtenerAsistencia, actualizarAsistencia } = require('../controller/asistencia');
const validarToken = require('../middleware/validarToken');
const validarHorario = require('../middleware/validarHorario');
const { validarCampos } = require('../middleware/validarCampos');
const { validarFecha } = require('../helpers/validar');


const router = Router();

router.put('/:id', [
    validarToken,
    validarHorario,
    check('hora', 'La hora es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], registrarAsistencia);

router.put('/restablecerAsistencia/:id', [
    validarToken,
    validarHorario,
    check('hora', 'La hora es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], restablecerAsistenciaHoras);


router.get('/:fecha',  obtenerAsistencia);

router.put('/actualiazarAsistencia/:id', [
    validarToken,
    validarHorario,
    check('horaEntrada', 'La hora entrada es obligatoria').notEmpty({ignore_whitespace:true}),
    check('horaSalida', 'La hora salida es obligatoria').notEmpty({ignore_whitespace:true}),
    check('fecha', 'La fecha no es valida').custom(validarFecha),
    validarCampos
], actualizarAsistencia);


module.exports = router;