const express = require('express');
const Vehicle = require('./models/vehicle');
const vehicleRouter = require('./controllers/vehicleController');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/vehicles', vehicleRouter);

async function startServer() {
    try {
        await Vehicle.initTable();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
