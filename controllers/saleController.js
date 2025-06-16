const express = require('express');
const Sale = require('../models/sale');
const Vehicle = require('../models/vehicle');
const Client = require('../models/client');
const User = require('../models/user');
const {authenticate, authorize} = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const filters = {
            vendedor_id: req.query.vendedor_id,
            cliente_id: req.query.cliente_id,
            vehiculo_id: req.query.vehiculo_id,
            fecha_inicio: req.query.fecha_inicio,
            fecha_fin: req.query.fecha_fin
        };

        const sales = await Sale.getAll(filters);
        res.status(200).json({
            success: true,
            count: sales.length,
            data: sales
        });
    } catch (error) {
        console.error('Error getting sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ventas',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const sale = await Sale.getById(req.params.id);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: sale
        });
    } catch (error) {
        console.error('Error getting sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo venta',
            error: error.message
        });
    }
});

router.post('/', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const {vehiculo_id, cliente_id, precio_total, impuestos} = req.body;
        if (!vehiculo_id || !cliente_id || !precio_total || !impuestos) {
            return res.status(400).json({
                success: false,
                message: 'Vehículo, cliente, precio total e impuestos son campos requeridos'
            });
        }

        const vehicle = await Vehicle.getById(vehiculo_id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        if (!vehicle.disponibilidad) {
            return res.status(400).json({
                success: false,
                message: 'El vehículo no está disponible para la venta'
            });
        }

        const client = await Client.getById(cliente_id);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const vendedor_id = req.body.vendedor_id || req.user.id;

        const sale = await Sale.create({
            ...req.body,
            vendedor_id,
            fecha: req.body.fecha || new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Venta registrada exitosamente',
            data: sale
        });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando venta',
            error: error.message
        });
    }
});

router.put('/:id', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const existingSale = await Sale.getById(req.params.id);
        if (!existingSale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        if (req.body.vehiculo_id && req.body.vehiculo_id !== existingSale.vehiculo_id) {
            const vehicle = await Vehicle.getById(req.body.vehiculo_id);
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehículo no encontrado'
                });
            }

            if (!vehicle.disponibilidad) {
                return res.status(400).json({
                    success: false,
                    message: 'El vehículo no está disponible para la venta'
                });
            }
        }

        if (req.body.cliente_id && req.body.cliente_id !== existingSale.cliente_id) {
            const client = await Client.getById(req.body.cliente_id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }
        }

        const updatedSale = await Sale.update(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Venta actualizada exitosamente',
            data: updatedSale
        });
    } catch (error) {
        console.error('Error updating sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando venta',
            error: error.message
        });
    }
});

router.delete('/:id', authorize(['admin']), async (req, res) => {
    try {
        const deleted = await Sale.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Venta eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando venta',
            error: error.message
        });
    }
});

router.get('/stats/total', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const {start_date, end_date} = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Fechas de inicio y fin son requeridas'
            });
        }

        const stats = await Sale.calculateTotalSales(new Date(start_date), new Date(end_date));
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting sales statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas de ventas',
            error: error.message
        });
    }
});

router.get('/stats/seller/:id', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        if (req.user.rol !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver las ventas de otro vendedor'
            });
        }

        const sales = await Sale.getSalesBySeller(req.params.id);
        res.status(200).json({
            success: true,
            count: sales.length,
            data: sales
        });
    } catch (error) {
        console.error('Error getting seller sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ventas del vendedor',
            error: error.message
        });
    }
});

module.exports = router;
