const {pool} = require('../config/db');

class Client {
    static async create(client) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
                [client.nombre, client.apellido, client.email, client.telefono, client.direccion]
            );
            return {id: result.insertId, ...client};
        } catch (error) {
            console.error('Error creando cliente:', error);
            throw error;
        }
    }

    static async getAll(filters = {}) {
        try {
            let query = 'SELECT * FROM clientes';
            const params = [];
            const conditions = [];

            if (filters.nombre) {
                conditions.push('nombre LIKE ?');
                params.push(`%${filters.nombre}%`);
            }

            if (filters.apellido) {
                conditions.push('apellido LIKE ?');
                params.push(`%${filters.apellido}%`);
            }

            if (filters.email) {
                conditions.push('email = ?');
                params.push(filters.email);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error(`Error obteniendo cliente con ID ${id}:`, error);
            throw error;
        }
    }

    static async update(id, clientData) {
        try {
            const client = await this.getById(id);
            if (!client) {
                return null;
            }

            await pool.execute(
                'UPDATE clientes SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
                [clientData.nombre, clientData.apellido, clientData.email, clientData.telefono, clientData.direccion, id]
            );

            return {id, ...clientData};
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM clientes WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            throw error;
        }
    }

    static async addConsultation(clientId, consultationData) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO consultas (cliente_id, vehiculo_id, fecha, descripcion) VALUES (?, ?, ?, ?)',
                [clientId, consultationData.vehiculo_id, new Date(), consultationData.descripcion]
            );
            return {id: result.insertId, cliente_id: clientId, ...consultationData};
        } catch (error) {
            console.error('Error agregando consulta:', error);
            throw error;
        }
    }

    static async getConsultations(clientId) {
        try {
            const [rows] = await pool.execute(
                `SELECT c.*, v.marca, v.modelo
                 FROM consultas c
                          JOIN vehiculo v ON c.vehiculo_id = v.id
                 WHERE c.cliente_id = ?
                 ORDER BY c.fecha DESC`,
                [clientId]
            );
            return rows;
        } catch (error) {
            console.error(`Error obteniendo consultas del cliente ${clientId}:`, error);
            throw error;
        }
    }

    static async initTable() {
        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS clientes
                (
                    id         INT AUTO_INCREMENT PRIMARY KEY,
                    nombre     VARCHAR(100) NOT NULL,
                    apellido   VARCHAR(100) NOT NULL,
                    email      VARCHAR(100) NOT NULL UNIQUE,
                    telefono   VARCHAR(20),
                    direccion  TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.execute(`
                CREATE TABLE IF NOT EXISTS consultas
                (
                    id          INT AUTO_INCREMENT PRIMARY KEY,
                    cliente_id  INT      NOT NULL,
                    vehiculo_id INT      NOT NULL,
                    fecha       DATETIME NOT NULL,
                    descripcion TEXT,
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE,
                    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo (id) ON DELETE CASCADE
                )
            `);

            console.log('Tablas clientes y consultas inicializadas');
        } catch (error) {
            console.error('Error inicializando tablas de clientes:', error);
            throw error;
        }
    }
}

module.exports = Client;
