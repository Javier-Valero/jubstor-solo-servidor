const jwt = require('jsonwebtoken')
const TOKEN_KEY = process.env.TOKEN_KEY;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).send({
            error: true,
            message: 'Token requerido'
        });
    }
    try {
        const decoded = jwt.verify(token, TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({
            error: true,
            message: 'Token invalido'
        });
    }
    return next();
};

module.exports = {
    verifyToken
}