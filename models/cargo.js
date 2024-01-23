const {DataTypes} = require('sequelize');
const sequelize = require('../db/config');


const Cargo = sequelize.define('Cargo', {
    nombre:{
        type:DataTypes.STRING
    },
}, {
    timestamps:false
});

module.exports = Cargo;