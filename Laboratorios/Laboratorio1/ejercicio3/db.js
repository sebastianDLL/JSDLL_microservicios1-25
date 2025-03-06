const { Pool } = require('pg');

const conexion = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bd_agenda',
    password: 'lilianjc123',
    port: 5432
});

module.exports = conexion;
