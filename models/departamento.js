
const {DataTypes} = require('sequelize');
const sequelize = require('../db/config');


const Departamento = sequelize.define('Departamento', {
    nombre:{
        type:DataTypes.STRING,
        unique:true
    }

}, {
    timestamps:false
});

module.exports = Departamento;
