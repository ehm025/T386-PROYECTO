const {pool} = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async create(user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [user.nombre, user.email, hashedPassword, user.rol || 'cliente']
            );

            return {id: result.insertId, nombre: user.nombre, email: user.email, rol: user.rol || 'cliente'};
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    static async initTable() {
        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS usuarios
                (
                    id         INT AUTO_INCREMENT PRIMARY KEY,
                    nombre     VARCHAR(100) NOT NULL,
                    email      VARCHAR(100) NOT NULL UNIQUE,
                    password   VARCHAR(100) NOT NULL,
                    rol        ENUM ( 'admin', 'vendedor', 'cliente' ) DEFAULT 'cliente',
                    created_at TIMESTAMP                               DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Tabla usuarios inicializada');
        } catch (error) {
            console.error('Error inicializando tabla usuarios:', error);
            throw error;
        }
    }
}

module.exports = User;
