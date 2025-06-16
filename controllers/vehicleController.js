const express = require('express');
const Vehicle = require('../models/vehicle');
const {authenticate, authorize} = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.post('/', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const {marca, modelo, anio, precio} = req.body;
        if (!marca || !modelo || !anio || !precio) {
            return res.status(400).json({
                success: false,
                message: 'Marca, modelo, año y precio son campos requeridos'
            });
        }

        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Vehículo creado exitosamente',
            data: vehicle
        });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando vehiculo',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const filters = {
            marca: req.query.marca,
            modelo: req.query.modelo,
            anio: req.query.anio ? parseInt(req.query.anio) : undefined,
            precioMinimo: req.query.precioMinimo ? parseFloat(req.query.precioMinimo) : undefined,
            precioMaximo: req.query.precioMaximo ? parseFloat(req.query.precioMaximo) : undefined,
            disponibilidad: req.query.disponibilidad !== undefined ?
                req.query.disponibilidad === 'true' : undefined
        };

        const vehicles = await Vehicle.getAll(filters);
        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        console.error('Error getting vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo vehiculos',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.getById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehiculo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Error getting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo vehiculo',
            error: error.message
        });
    }
});

router.put('/:id', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.update(req.params.id, req.body);

        if (!updatedVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehiculo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehiculo actualizado exitosamente',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando vehiculo',
            error: error.message
        });
    }
});

router.delete('/:id', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const deleted = await Vehicle.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Vehiculo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehículo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando vehiculo',
            error: error.message
        });
    }
});

module.exports = router;
