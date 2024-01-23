const { Router } = require("express");
const { registerUsuario, getRoles, obtenerUsuarios, updateUser,} = require("../controller/usuario");
const { check } = require("express-validator");
const {validarCampos} = require("../middleware/validarCampos");
const { existeRol, existeUsuario } = require("../helpers/validar");
const validarToken = require("../middleware/validarToken");

const router = Router();

router.post( "/",
  [
    validarToken,
    check("empleadoId").custom(existeUsuario),
    check("roleId").custom(existeRol),
    check("password", 'El password debe tener minimo 6 caracteres y maximo 13 caracteres').isLength({min:6, max:13}),
    validarCampos,
  ],
  registerUsuario
);

router.get('/', obtenerUsuarios);

router.put('/:id',[
    validarToken,
    check("roleId").custom(existeRol),
    check("password", 'El password debe tener minimo 6 caracteres').isLength({min:6}),
    validarCampos,
], updateUser);


router.get('/roles', [
  check('role', 'El rol es obligatorio').notEmpty({ignore_whitespace:true}),
  validarCampos
], getRoles);



module.exports = router;
