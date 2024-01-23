const {Router} = require('express');
const { paginacion, cargarFotoClodinary, cargarDocumentosCloudinary, deleteFotoOnCloudinary, deleteDocsOnCloudinary, buscarController, eliminarArchivosSinDestino} = require('../controller/ui');
const { check, param } = require('express-validator');
const {validarCampos} = require('../middleware/validarCampos');
const validarArchivo = require('../middleware/validarArchivo');
const { validarColeccion } = require('../helpers/validar');
const validarToken = require('../middleware/validarToken');
const validarHorario = require('../middleware/validarHorario');


const router = Router();

router.get('/paginacion/:coleccion/:pagina/:limit', [
    param('coleccion', 'La coleccion es obligatoria').custom(validarColeccion),
    param('pagina', 'La pagina es obligatoria').notEmpty({ignore_whitespace:true}),
    param('limit', 'El limite es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], paginacion);


router.get('/buscar/:coleccion/',[
    param('coleccion', 'coleccion es obligatoria').custom(validarColeccion),
    validarCampos
], buscarController);


router.post('/subirFoto', [
    validarToken,
    validarHorario,
    validarArchivo,
    check('coleccion', 'coleccion es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
],  cargarFotoClodinary);

router.post('/deleteFoto', [
    validarHorario,
    check('coleccion', 'coleccion es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], deleteFotoOnCloudinary);

router.post('/subirDocumentos', [
    validarToken,
    validarHorario,
    validarArchivo,
],  cargarDocumentosCloudinary);


router.post('/deleteDocumentos', [
    validarHorario,
    check('documentos', 'documentos es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
],  deleteDocsOnCloudinary);

router.get('/eliminarArchivosSinDestino', eliminarArchivosSinDestino);

module.exports = router;