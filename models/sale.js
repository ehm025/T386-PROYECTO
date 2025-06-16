const {pool} = require('../config/db');

class Sale {
    static async create(sale) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO ventas (fecha, vehiculo_id, cliente_id, vendedor_id, precio_total, impuestos) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    sale.fecha || new Date(),
                    sale.vehiculo_id,
                    sale.cliente_id,
                    sale.vendedor_id,
                    sale.precio_total,
                    sale.impuestos
                ]
            );

            await pool.execute(
                'UPDATE vehiculo SET disponibilidad = FALSE WHERE id = ?',
                [sale.vehiculo_id]
            );

            return {id: result.insertId, ...sale};
        } catch (error) {
            console.error('Error creando venta:', error);
            throw error;
        }
    }

    static async getAll(filters = {}) {
        try {
            let query = `
                SELECT v.*,
                       c.nombre   AS cliente_nombre,
                       c.apellido AS cliente_apellido,
                       u.nombre   AS vendedor_nombre,
                       vh.marca,
                       vh.modelo,
                       vh.anio
                FROM ventas v
                         JOIN clientes c ON v.cliente_id = c.id
                         JOIN usuarios u ON v.vendedor_id = u.id
                         JOIN vehiculo vh ON v.vehiculo_id = vh.id
            `;

            const params = [];
            const conditions = [];

            if (filters.vendedor_id) {
                conditions.push('v.vendedor_id = ?');
                params.push(filters.vendedor_id);
            }

            if (filters.cliente_id) {
                conditions.push('v.cliente_id = ?');
                params.push(filters.cliente_id);
            }

            if (filters.vehiculo_id) {
                conditions.push('v.vehiculo_id = ?');
                params.push(filters.vehiculo_id);
            }

            if (filters.fecha_inicio) {
                conditions.push('v.fecha >= ?');
                params.push(filters.fecha_inicio);
            }

            if (filters.fecha_fin) {
                conditions.push('v.fecha <= ?');
                params.push(filters.fecha_fin);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY v.fecha DESC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error obteniendo ventas:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [rows] = await pool.execute(`
                SELECT v.*,
                       c.nombre   AS cliente_nombre,
                       c.apellido AS cliente_apellido,
                       u.nombre   AS vendedor_nombre,
                       vh.marca,
                       vh.modelo,
                       vh.anio
                FROM ventas v
                         JOIN clientes c ON v.cliente_id = c.id
                         JOIN usuarios u ON v.vendedor_id = u.id
                         JOIN vehiculo vh ON v.vehiculo_id = vh.id
                WHERE v.id = ?
            `, [id]);

            return rows[0] || null;
        } catch (error) {
            console.error(`Error obteniendo venta con ID ${id}:`, error);
            throw error;
        }
    }

    static async update(id, saleData) {
        try {
            const sale = await this.getById(id);
            if (!sale) {
                return null;
            }

            if (saleData.vehiculo_id && saleData.vehiculo_id !== sale.vehiculo_id) {
                await pool.execute(
                    'UPDATE vehiculo SET disponibilidad = TRUE WHERE id = ?',
                    [sale.vehiculo_id]
                );

                await pool.execute(
                    'UPDATE vehiculo SET disponibilidad = FALSE WHERE id = ?',
                    [saleData.vehiculo_id]
                );
            }

            await pool.execute(
                'UPDATE ventas SET fecha = ?, vehiculo_id = ?, cliente_id = ?, vendedor_id = ?, precio_total = ?, impuestos = ? WHERE id = ?',
                [
                    saleData.fecha || sale.fecha,
                    saleData.vehiculo_id || sale.vehiculo_id,
                    saleData.cliente_id || sale.cliente_id,
                    saleData.vendedor_id || sale.vendedor_id,
                    saleData.precio_total || sale.precio_total,
                    saleData.impuestos || sale.impuestos,
                    id
                ]
            );

            return {id, ...saleData};
        } catch (error) {
            console.error('Error actualizando venta:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sale = await this.getById(id);
            if (!sale) {
                return false;
            }

            await pool.execute(
                'UPDATE vehiculo SET disponibilidad = TRUE WHERE id = ?',
                [sale.vehiculo_id]
            );

            const [result] = await pool.execute('DELETE FROM ventas WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando venta:', error);
            throw error;
        }
    }

    static async calculateTotalSales(startDate, endDate) {
        try {
            const [rows] = await pool.execute(
                'SELECT SUM(precio_total) as total, SUM(impuestos) as impuestos FROM ventas WHERE fecha BETWEEN ? AND ?',
                [startDate, endDate]
            );
            return rows[0];
        } catch (error) {
            console.error('Error calculando ventas totales:', error);
            throw error;
        }
    }

    static async getSalesBySeller(sellerId) {
        try {
            const [rows] = await pool.execute(
                `SELECT v.*,
                        c.nombre AS cliente_nombre,
                        c.apellido AS cliente_apellido,
                        vh.marca,
                        vh.modelo,
                        vh.anio
                 FROM ventas v
                          JOIN clientes c ON v.cliente_id = c.id
                          JOIN vehiculo vh ON v.vehiculo_id = vh.id
                 WHERE v.vendedor_id = ?
                 ORDER BY v.fecha DESC`,
                [sellerId]
            );
            return rows;
        } catch (error) {
            console.error(`Error obteniendo ventas del vendedor ${sellerId}:`, error);
            throw error;
        }
    }

    static async initTable() {
        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS ventas
                (
                    id           INT AUTO_INCREMENT PRIMARY KEY,
                    fecha        DATETIME       NOT NULL,
                    vehiculo_id  INT            NOT NULL,
                    cliente_id   INT            NOT NULL,
                    vendedor_id  INT            NOT NULL,
                    precio_total DECIMAL(10, 2) NOT NULL,
                    impuestos    DECIMAL(10, 2) NOT NULL,
                    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo (id),
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
                    FOREIGN KEY (vendedor_id) REFERENCES usuarios (id)
                )
            `);
            console.log('Tabla ventas inicializada');
        } catch (error) {
            console.error('Error inicializando tabla ventas:', error);
            throw error;
        }
    }
}

module.exports = Sale;
