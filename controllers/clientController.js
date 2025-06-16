const express = require('express');
const Client = require('../models/client');
const {authenticate, authorize} = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const filters = {
            nombre: req.query.nombre,
            apellido: req.query.apellido,
            email: req.query.email
        };

        const clients = await Client.getAll(filters);
        res.status(200).json({
            success: true,
            count: clients.length,
            data: clients
        });
    } catch (error) {
        console.error('Error getting clients:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo clientes',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const client = await Client.getById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        console.error('Error getting client:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo cliente',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const {nombre, apellido, email} = req.body;
        if (!nombre || !apellido || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido y email son campos requeridos'
            });
        }

        const client = await Client.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: client
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        console.error('Error creating client:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando cliente',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedClient = await Client.update(req.params.id, req.body);

        if (!updatedClient) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: updatedClient
        });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando cliente',
            error: error.message
        });
    }
});

router.delete('/:id', authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const deleted = await Client.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando cliente',
            error: error.message
        });
    }
});

router.post('/:id/consultations', async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await Client.getById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const {vehiculo_id, descripcion} = req.body;
        if (!vehiculo_id || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'ID del vehículo y descripción son campos requeridos'
            });
        }

        const consultation = await Client.addConsultation(clientId, req.body);
        res.status(201).json({
            success: true,
            message: 'Consulta registrada exitosamente',
            data: consultation
        });
    } catch (error) {
        console.error('Error adding consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando consulta',
            error: error.message
        });
    }
});

router.get('/:id/consultations', async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await Client.getById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const consultations = await Client.getConsultations(clientId);
        res.status(200).json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        console.error('Error getting consultations:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo historial de consultas',
            error: error.message
        });
    }
});

module.exports = router;
