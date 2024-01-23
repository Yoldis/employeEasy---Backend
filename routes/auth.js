const { Router } = require("express");
const { tokenController, loginController, registerAdmin, updateProcfile, cambioPassowrd} = require("../controller/auth");
const { check } = require("express-validator");
const {validarCamposLogin, validarCampos} = require("../middleware/validarCampos");
const validarToken = require("../middleware/validarToken");
const { noExisteUsuario } = require("../middleware/validar-db");
const validarHorario = require("../middleware/validarHorario");

const router = Router();

router.post(
  "/login",
  [
    check("email", "El email es obligatorio").isEmail(),
    noExisteUsuario,
    check("password", "El password debe tener al menos 6 caracteres").isLength({min: 6}),
    validarCamposLogin,
  ],
  loginController
);

router.get("/validarToken", validarToken, tokenController);

router.put("/actualizarPerfil", [
  validarToken,
  validarHorario,
  check("email", "El email es obligatorio").isEmail(),
  check("telefono", "El telefono es obligatorio").notEmpty({ignore_whitespace:true}),
  validarCampos
], updateProcfile);

router.post('/cambioPassword/:id', [
  check("password", "El password debe tener al menos 6 caracteres").isLength({min: 6}),
  validarCampos
], cambioPassowrd);

router.get('/registrarAdmin', registerAdmin);

module.exports = router;
