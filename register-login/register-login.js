const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

//COMPAÑERO SI TIENE SU BASE DE DATOS PRUEBELOS POR FAVOR, SI ME EQUIVOQUE EN ALGO DÍGAME.
//TAMBIEN FIJESE EN LAS RUTAS YA QUE SOLO TENGO ACCESO A LA RAMA "Develop"

//Registro de usuario
router.post('/registro', async (req, res) => {
    const { Nombre, Email, Contraseña, rol} = req.body;

    if(!Nombre || !Email || !Contraseña){
        return res.status(400).json({ error: 'Por favor, proporciona un nombre, email y contraseña.' });
    }

    try{
        // Chequeamos que el email exista
        const emailCheckQuery = 'SELECT ID_Usuario FROM Usuarios WHERE Email = ?';
        const [existingUser] = await db.promise().query(emailCheckQuery, [Email]);

        if(existingUser.length > 0){
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Contraseña, saltRounds);

        const insertQuery = 'INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) VALUES (?, ?, ?, ?)';
        const [result] = await db.promise().query(insertQuery, [Nombre, Email, hashedPassword, rol,]);

        res.status(201).json({message: 'Usuario registrado exitosamente.', userId: result.insertId});

    } catch (error){
        console.error('Error al registrar el usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrarse.'});
    }

});

//Login de usuario
router.post('/login', async (req, res) => {
    const { Email, Contraseña } = req.body;

    if(!Email || !Contraseña){
        return res.status(400).json({ error: 'Por favor, proporciona email y contraseña.' });
    }

    try{
        const query = 'SELECT ID_Usuario, Contraseña FROM Usuarios WHERE Email = ?';
        const [results] = await db.promise().query(query, [Email]);

        if(results.length === 0){
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(Contraseña, user.Contraseña);

        if(!passwordMatch){
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        //Generamos el token
        const token = jwt.sign({ userId: user.ID_Usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Inicio de sesión exitoso.', token: token, userId: user.ID_Usuario });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
});

module.exports = router;
