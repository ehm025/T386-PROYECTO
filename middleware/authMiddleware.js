const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) =>{
    const authHeader = req.headers.authorization;

    if(authHeader){
        const token = authHeader.split(' ')[1];

        if(token){
            jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
                if(err){
                    return res.status(403).json({ error: 'Token no válido.' });
                }

                req.userId = user.userId;
                next();
            });
        }else{
            res.status(401).json({ error: 'Token no proporcionado.' });
        }
    }else{
        res.status(401).json({ error: 'Encabezado de autorización no proporcionado.' });
    }
};

module.exports = { authenticateUser };