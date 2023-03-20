const pool = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const TOKEN_KEY = process.env.TOKEN_KEY


const compruebaLogin = async (req, res, next) => {
    try {
        const { email, password, recuerdame } = req.body
        console.log('recuerdame: ', recuerdame)
        const result = await pool.query('SELECT idusuario, nombre, apellidos, vista, password FROM usuarios WHERE email = $1', [email])
        /* console.log(result) */

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: true,
                message: 'El email no corresponde a ningún usuario existente'
            })
        }
        else if (!(await bcrypt.compare(password, result.rows[0].password))) {
            return res.status(404).json({
                error: true,
                message: 'La contraseña es incorrecta'
            })
        }
        // Utilizamos jsonwebtoken para crear un token y controlar la sesión que tiene una vida de 1 día 
        const token = jwt.sign(
            { user_id: result.rows[0].idusuario, email },
            TOKEN_KEY,
            {
                expiresIn: "1d",
            }
        );

        await pool.query('UPDATE usuarios SET authtoken = $1 WHERE idusuario = $2', [
            token,
            result.rows[0].idusuario
        ])
        return res.status(200).json({
            error: false,
            token: token,
            usuario: {
                "idusuario": result.rows[0].idusuario,
                "nombre": result.rows[0].nombre,
                "apellidos": result.rows[0].apellidos,
                "vista": result.rows[0].vista,
                "email": email,
                "recuerdame": recuerdame
            }
        })
    } catch (error) {
        next(error)
    }
}

const creaUsuario = async (req, res, next) => {
    try {
        const { nombre, apellidos, email, password } = req.body
        const existeEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        if (existeEmail.rowCount > 0) {
            return res.status(404).json({
                error: true,
                message: 'El email corresponde a un usuario existente'
            })
        }
        else {
            const encryptedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query('INSERT INTO usuarios (nombre, apellidos, email, password) VALUES ($1, $2, $3, $4) RETURNING idusuario', [
                nombre,
                apellidos,
                email,
                encryptedPassword
            ])
            // Utilizamos jsonwebtoken para crear un token y controlar la sesión que tiene una vida de 1 día
            const token = jwt.sign(
                { user_id: result.rows[0].idusuario, email },
                TOKEN_KEY,
                {
                    expiresIn: "1d",
                }
            );

            await pool.query('UPDATE usuarios SET authtoken = $1 WHERE idusuario = $2', [
                token,
                result.rows[0].idusuario
            ])

            return res.status(200).json({
                error: false,
                token: token,
                usuario: {
                    "idusuario": result.rows[0].idusuario,
                    "nombre": nombre,
                    "apellidos": apellidos,
                    "vista": "listado",
                    "email": email
                }
            })
/*             res.send(result.rows[0])
 */        }

    } catch (error) {
        next(error)
    }
}

const actualizaUsuario = async (req, res, next) => {
    try {
        const { idusuario } = req.params
        const { nombre, apellidos, email, vista } = req.body
        const miEmail = await pool.query('SELECT email FROM usuarios WHERE idusuario = $1', [idusuario])
        const existeEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        if (miEmail.rows[0].email !== email && existeEmail.rowCount > 0) {
            return res.status(404).json({
                error: true,
                message: 'El email corresponde a un usuario existente'
            })
        }
        else {
            const result = await pool.query('UPDATE usuarios SET nombre = $1, apellidos = $2, email = $3, vista = $4 WHERE idusuario = $5', [
                nombre,
                apellidos,
                email,
                vista,
                idusuario
            ])
            // Utilizamos jsonwebtoken para crear un token y controlar la sesión que tiene una vida de 1 día
            const token = jwt.sign(
                { user_id: idusuario, email },
                TOKEN_KEY,
                {
                    expiresIn: "1d",
                }
            );

            return res.status(200).json({
                error: false,
                token: token,
                usuario: {
                    "idusuario": idusuario,
                    "nombre": nombre,
                    "apellidos": apellidos,
                    "vista": vista,
                    "email": email
                }
            })
        }

    } catch (error) {
        next(error)
    }
}

const actualizaPassword = async (req, res, next) => {
    try {
        const { idusuario } = req.params
        const { actual, nueva } = req.body
        /* console.log('mis datos: ', actual, nueva) */
        const result = await pool.query('SELECT password FROM usuarios WHERE idusuario = $1', [idusuario])
        if (!(await bcrypt.compare(actual, result.rows[0].password))) {
            return res.status(404).json({
                error: true,
                message: 'La contraseña actual introducida no es correcta'
            })
        }
        else {
            const nuevaEncryptedPassword = await bcrypt.hash(nueva, 10);
            const result = await pool.query('UPDATE usuarios SET password = $1 WHERE idusuario = $2', [
                nuevaEncryptedPassword,
                idusuario
            ])

            return res.status(200).json({
                error: false
            })
        }

    } catch (error) {
        next(error)
    }
}


const eliminaUsuario = async (req, res, next) => {
    try {
        const { idusuario } = req.params
        const result = await pool.query('DELETE FROM usuarios WHERE idusuario = $1', [idusuario])

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            })
        }
        return res.status(200).send({
            error: false
        });
    } catch (error) {
        /* console.log("en catch:", error) */
        next(error)
    }
}

const refrescarToken = async (req, res, next) => {
    try {
        const { idusuario } = req.params
        const result = await pool.query('SELECT email, nombre, apellidos, vista FROM usuarios WHERE idusuario = $1', [idusuario])
        /* console.log(result) */

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: true,
                message: 'No existe el usuario'
            })
        }
        else {
            // Utilizamos jsonwebtoken para crear un token y controlar la sesión que tiene una vida de 1 día
            const email = result.rows[0].email
            const token = jwt.sign(
                { user_id: idusuario, email },
                TOKEN_KEY,
                {
                    expiresIn: "1d",
                }
            );

            await pool.query('UPDATE usuarios SET authtoken = $1 WHERE idusuario = $2', [
                token,
                result.rows[0].idusuario
            ])
            return res.status(200).json({
                error: false,
                token: token,
                usuario: {
                    "idusuario": idusuario,
                    "nombre": result.rows[0].nombre,
                    "apellidos": result.rows[0].apellidos,
                    "vista": result.rows[0].vista,
                    "email": email,
                }
            })
        }

    } catch (error) {
        next(error)
    }
}

module.exports = {
    compruebaLogin,
    creaUsuario,
    actualizaUsuario,
    actualizaPassword,
    eliminaUsuario,
    refrescarToken
}