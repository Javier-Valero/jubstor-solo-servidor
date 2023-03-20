const { Router } = require('express');
const { compruebaLogin, creaUsuario, actualizaUsuario, actualizaPassword, eliminaUsuario, refrescarToken } = require('../controladores/controlador.usuarios')
const { verifyToken } = require('../middleware/auth')

const router = Router();

router.post('/login', compruebaLogin)

router.post('/registro', creaUsuario)

router.put('/usuarios/:idusuario', verifyToken, actualizaUsuario)

router.put('/usuarios/password/:idusuario', verifyToken, actualizaPassword)

router.delete('/usuarios/:idusuario', verifyToken, eliminaUsuario)

router.get('/usuarios/refrescar/:idusuario', refrescarToken)

module.exports = router;