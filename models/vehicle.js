const { pool } = require('../config/db');

class Vehicle {
  static async create(vehicle) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO vehiculo (marca, modelo, anio, precio, disponibilidad) VALUES (?, ?, ?, ?, ?)',
        [vehicle.marca, vehicle.modelo, vehicle.anio, vehicle.precio, vehicle.disponibilidad]
      );
      return { id: result.insertId, ...vehicle };
    } catch (error) {
      console.error('Error creando vehiculo:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      let query = 'SELECT * FROM vehiculo';
      const params = [];
      const conditions = [];

      if (filters.marca) {
        conditions.push('marca = ?');
        params.push(filters.marca);
      }

      if (filters.modelo) {
        conditions.push('modelo = ?');
        params.push(filters.modelo);
      }

      if (filters.precioMinimo) {
        conditions.push('precio >= ?');
        params.push(filters.precioMinimo);
      }

      if (filters.precioMaximo) {
        conditions.push('precio <= ?');
        params.push(filters.precioMaximo);
      }

      if (filters.disponibilidad !== undefined) {
        conditions.push('disponibilidad = ?');
        params.push(filters.disponibilidad);
      }

      if (filters.anio) {
        conditions.push('anio = ?');
        params.push(filters.anio);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error obteniendo vehiculos:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM vehiculo WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error obteniendo vehiculo con ID ${id}:`, error);
      throw error;
    }
  }

  static async update(id, vehicleData) {
    try {
      const vehicle = await this.getById(id);
      if (!vehicle) {
        return null;
      }

      await pool.execute(
          'UPDATE vehiculo SET marca = ?, modelo = ?, anio = ?, precio = ?, disponibilidad = ? WHERE id = ?',
          [vehicleData.marca, vehicleData.modelo, vehicleData.anio, vehicleData.precio, vehicleData.disponibilidad, id]
      );

      return { id, ...vehicleData };
    } catch (error) {
      console.error('Error actualizando vehiculo:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM vehiculo WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error eliminando vehiculo:', error);
      throw error;
    }
  }

  static async initTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS vehiculo (
          id INT AUTO_INCREMENT PRIMARY KEY,
          marca VARCHAR(100) NOT NULL,
          modelo VARCHAR(100) NOT NULL,
          anio INT NOT NULL,
          precio DECIMAL(10, 2) NOT NULL,
          disponibilidad BOOLEAN DEFAULT TRUE
        )
      `);
      console.log('Tabla vehiculo inicializada');
    } catch (error) {
      console.error('Error inicializando tabla vehiculo:', error);
      throw error;
    }
  }
}

module.exports = Vehicle;
