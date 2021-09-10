//ignore this, wont affect the other codes

// Bring in Sequalize
const Sequelize = require('sequelize');

// Bring in db.js which contains database name, username and password
const db = require('./db');

// Instantiates Sequalize with database parameters
const sequelize = new Sequelize(db.database, db.username, db.password, {
    host: db.host,          // Name or IP address of MySQL Server
    dialect: 'mysql',       // Tells sequelize that MySQL is used
    operatorsAliases: false,

    define: {
        timestamps: false       // Don't create timestamp fields in database
    },

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
})

module.exports = sequelize;