const pool = require('../db')

const dameTodasLasTareas = async (req, res, next) => {
    // Devolvemos todas las tareas del usuario
    try {
        const { idusuario } = req.params
        const result = await pool.query('SELECT * FROM tareas WHERE idusuario = $1 ORDER BY estado DESC, ordencol ASC', [idusuario])
        res.send(result.rows)
    } catch (error) {
        next(error)
    }
}

const dameUnaTarea = async (req, res, next) => {
    // Devolvemos una tarea
    try {
        const { idtarea } = req.params
        const result = await pool.query('SELECT * FROM tareas WHERE idtarea = $1', [idtarea])

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Tarea no encontrada'
            })
        }
        res.send(result.rows[0])
    } catch (error) {
        next(error)
    }
}

const creaUnaTarea = async (req, res, next) => {
    try {
        const { nombre, descripcion, idusuario, estado } = req.body
        const countOrden = await pool.query('SELECT COUNT(*) FROM tareas WHERE estado = $1 AND idusuario = $2', [estado, idusuario])
        const result = await pool.query('INSERT INTO tareas (nombre, descripcion, idusuario, estado, ordencol) VALUES ($1, $2, $3, $4, $5) RETURNING *', [
            nombre,
            descripcion,
            idusuario,
            estado,
            countOrden.rows[0].count
        ])
        res.send(result.rows[0])
    } catch (error) {
        next(error)
    }
}

const actualizaTarea = async (req, res, next) => {
    try {
        const { idtarea } = req.params
        const { nombre, descripcion, idusuario, estado } = req.body

        const estadoOriginal = await pool.query('SELECT estado, ordencol FROM tareas WHERE idtarea = $1', [idtarea])
        const countOrdenEstado = await pool.query('SELECT COUNT(*) FROM tareas WHERE estado = $1 AND idusuario = $2', [estado, idusuario])

        ordencol = estado === estadoOriginal.rows[0].estado ? estadoOriginal.rows[0].ordencol : countOrdenEstado.rows[0].count
        const result = await pool.query('UPDATE tareas SET nombre = $1, descripcion = $2, estado = $3, ordencol = $4 WHERE idtarea = $5 RETURNING *', [nombre, descripcion, estado, ordencol, idtarea])

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Tarea no encontrada'
            })
        }
        return res.json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

const actualizaOrdenEstadoTarea = async (req, res, next) => {
    try {
        const { idtarea } = req.params
        const estados = ['Por hacer', 'Iniciada', 'En espera', 'Completada']
        const { estadoDestino, estadoOrigen, ordencolDestino, ordencolOrigen, idusuario } = req.body
        /// EMPAQUETAR ORIGEN
        const resultEmpaquetar = await pool.query('UPDATE tareas SET ordencol = ordencol - 1 WHERE idusuario = $1 AND estado = $2 AND ordencol > $3', [idusuario, estados[estadoOrigen], ordencolOrigen])

        /// INGRESAR DESTINO
        const resultEnsanchar = await pool.query('UPDATE tareas SET ordencol = ordencol + 1 WHERE idusuario = $1 AND estado = $2 AND ordencol >= $3', [idusuario, estados[estadoDestino], ordencolDestino])
        const resultIngresar = await pool.query('UPDATE tareas SET ordencol = $1, estado = $2 WHERE idtarea = $3', [ordencolDestino, estados[estadoDestino], idtarea])

        return res.status(200)
    } catch (error) {
        next(error)
    }
}

const eliminaTarea = async (req, res, next) => {
    try {
        const { idtarea } = req.params
        /// EMPAQUETAR ORIGEN
        const tarea = await pool.query('SELECT estado, ordencol, idusuario FROM tareas WHERE idtarea = $1', [idtarea])
        const resultEmpaquetar = await pool.query('UPDATE tareas SET ordencol = ordencol - 1 WHERE idusuario = $1 AND estado = $2 AND ordencol > $3', [tarea.rows[0].idusuario, tarea.rows[0].estado, tarea.rows[0].ordencol])
        const result = await pool.query('DELETE FROM tareas WHERE idtarea = $1', [idtarea])

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Tarea no encontrada'
            })
        }
/*         console.log("elimino:", result)
 */        return res.status(200).send({
            error: false
        });
        return res.status(200)
    } catch (error) {
        /* console.log("en catch:", error) */
        next(error)
    }
}

module.exports = {
    dameTodasLasTareas,
    dameUnaTarea,
    creaUnaTarea,
    actualizaTarea,
    actualizaOrdenEstadoTarea,
    eliminaTarea
}