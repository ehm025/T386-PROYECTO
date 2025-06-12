const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'vehicle_inventory'
};

const pool = mysql.createPool(dbConfig);

module.exports = {
    pool
};
