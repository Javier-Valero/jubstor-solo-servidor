const express = require('express'); // Framework de nodejs
const morgan = require('morgan'); // Lista las peticiones que llegan al servidor en consola
const cors = require('cors') // Permite comunicar servidores en dominos distintos
const PORT = process.env.PORT ?? 4000

const tareasRutas = require('./rutas/tareas.rutas');
const usuariosRutas = require('./rutas/usuarios.rutas');

const app = express();

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use(tareasRutas, usuariosRutas)

// Middleware manejador de errores
app.use((err, req, res, next
) => {
    return res.status(500).send({
        error: true,
        message: err.message
    });
})


app.listen(PORT)
console.log('Server on port 4000')