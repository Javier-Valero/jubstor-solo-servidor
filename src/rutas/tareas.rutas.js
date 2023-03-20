const { Router } = require('express');
const { dameTodasLasTareas, dameUnaTarea, creaUnaTarea, eliminaTarea, actualizaTarea, actualizaOrdenEstadoTarea } = require('../controladores/controlador.tareas')
const { verifyToken } = require('../middleware/auth')

const router = Router();

// Definimos la ruta, comprobando si el cliente tiene permisos con el middelware verifyToken, si los tiene le damos paso a la funcionalidad.
router.get('/tareas/:idusuario', verifyToken, dameTodasLasTareas)

router.get('/tareas/tarea/:idtarea', verifyToken, dameUnaTarea)

router.post('/tareas', verifyToken, creaUnaTarea)

router.delete('/tareas/:idtarea', verifyToken, eliminaTarea)

router.put('/tareas/tarea/:idtarea', verifyToken, actualizaTarea)

router.put('/tareas/ordenestado/:idtarea', verifyToken, actualizaOrdenEstadoTarea)

module.exports = router;