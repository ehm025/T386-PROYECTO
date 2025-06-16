const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = 'mi contrasenia super secreta';

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó el encabezado de autorización'
            });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'El formato de autorización debe ser: Bearer [token]'
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado'
            });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor durante la autenticación'
        });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (roles.length && !roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'Permisos insuficientes'
            });
        }

        next();
    };
};

const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        JWT_SECRET,
        {expiresIn: '24h'}
    );
};

module.exports = {
    authenticate,
    authorize,
    generateToken,
    JWT_SECRET
};
