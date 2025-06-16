const express = require('express');
const Vehicle = require('./models/vehicle');
const User = require('./models/user');
const Client = require('./models/client');
const Sale = require('./models/sale');
const vehicleRouter = require('./controllers/vehicleController');
const authRouter = require('./controllers/authController');
const clientRouter = require('./controllers/clientController');
const saleRouter = require('./controllers/saleController');
const currencyRouter = require('./controllers/currencyController');
const { authenticate } = require('./middleware/authMiddleware');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api/vehicles', vehicleRouter);
app.use('/api/clients', clientRouter);
app.use('/api/sales', saleRouter);
app.use('/api/currency', currencyRouter);

async function startServer() {
    try {
        await Vehicle.initTable();
        await User.initTable();
        await Client.initTable();
        await Sale.initTable();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
