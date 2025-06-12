const express = require('express');
const Vehicle = require('../models/vehicle');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Vehículo creado exitosamente',
            data: vehicle
        });
    } catch (error) {
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
        res.status(500).json({
            success: false,
            message: 'Error obteniendo vehiculo',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error actualizando vehiculo',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error eliminando vehiculo',
            error: error.message
        });
    }
});

module.exports = router;
