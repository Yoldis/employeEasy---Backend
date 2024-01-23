const {Router} = require('express');
const { registerEmpresaOrUpdate, obtenerEmpresaData } = require('../controller/empresa');
const validarToken = require('../middleware/validarToken');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validarCampos');

const router = Router();


router.post('/', [
    validarToken,
    check('logo','El logo es obligatorio').notEmpty({ignore_whitespace:true}),
    check('nombre','El nombre es obligatorio').notEmpty({ignore_whitespace:true}),
    check('contacto','El contacto es obligatorio').notEmpty({ignore_whitespace:true}),
    check('direccion','La direccion es obligatoria').notEmpty({ignore_whitespace:true}),
    check('identificacion','La identificacion es obligatoria').notEmpty({ignore_whitespace:true}),
    validarCampos
], registerEmpresaOrUpdate);

router.get('/', obtenerEmpresaData);

module.exports = router;