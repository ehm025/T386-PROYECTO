const express = require('express');
const currencyService = require('../services/currencyService');
const Vehicle = require('../models/vehicle');
const {authenticate} = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/currencies', async (req, res) => {
    try {
        const currencies = await currencyService.getAvailableCurrencies();
        res.status(200).json({
            success: true,
            data: currencies
        });
    } catch (error) {
        console.error('Error getting available currencies:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo monedas disponibles',
            error: error.message
        });
    }
});

router.get('/convert', async (req, res) => {
    try {
        const {amount, from, to} = req.query;

        if (!amount || !from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los parámetros amount, from y to'
            });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser un número válido'
            });
        }

        const result = await currencyService.convert(numericAmount, from, to);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({
            success: false,
            message: 'Error convirtiendo moneda',
            error: error.message
        });
    }
});

router.get('/vehicle/:id', async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const {baseCurrency, targetCurrencies} = req.query;

        const vehicle = await Vehicle.getById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        let currencies = ['EUR', 'GBP', 'JPY']; // Default currencies
        if (targetCurrencies) {
            currencies = targetCurrencies.split(',');
        }

        const result = await currencyService.convertVehiclePrice(
            vehicle.precio,
            baseCurrency || 'USD',
            currencies
        );

        res.status(200).json({
            success: true,
            data: {
                vehicle: {
                    id: vehicle.id,
                    marca: vehicle.marca,
                    modelo: vehicle.modelo,
                    anio: vehicle.anio
                },
                ...result
            }
        });
    } catch (error) {
        console.error('Error converting vehicle price:', error);
        res.status(500).json({
            success: false,
            message: 'Error convirtiendo precio del vehículo',
            error: error.message
        });
    }
});

router.get('/vehicles', async (req, res) => {
    try {
        const {baseCurrency, targetCurrency} = req.query;

        if (!targetCurrency) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el parámetro targetCurrency'
            });
        }

        const vehicles = await Vehicle.getAll();

        const rates = await currencyService.fetchRates(baseCurrency || 'USD');

        if (!rates[targetCurrency]) {
            return res.status(400).json({
                success: false,
                message: `Moneda ${targetCurrency} no soportada`
            });
        }

        const result = vehicles.map(vehicle => {
            const convertedPrice = parseFloat((vehicle.precio * rates[targetCurrency]).toFixed(2));
            return {
                ...vehicle,
                precio_original: vehicle.precio,
                moneda_original: baseCurrency || 'USD',
                precio_convertido: convertedPrice,
                moneda_convertida: targetCurrency,
                tasa_cambio: rates[targetCurrency]
            };
        });

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error('Error converting vehicle prices:', error);
        res.status(500).json({
            success: false,
            message: 'Error convirtiendo precios de vehículos',
            error: error.message
        });
    }
});

module.exports = router;
