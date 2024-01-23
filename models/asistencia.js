const{DataTypes} = require('sequelize');
const sequelize = require('../db/config');

const Asistencia = sequelize.define('Asistencia', {

    horaIncioSesion:{
        type:DataTypes.TIME
    },

    horaUltimaVezIniciado:{
        type:DataTypes.TIME
    },

    horaEntrada:{
        type:DataTypes.TIME
    },
    
    horaSalida:{
        type:DataTypes.TIME
    },

    llegada:{
        type:DataTypes.STRING
    },

    horasTrabajadas:{
        type:DataTypes.DECIMAL(10, 1)
    },

    fecha:{
        type:DataTypes.DATE
    },

}, {
    timestamps:false
})

module.exports = Asistencia;