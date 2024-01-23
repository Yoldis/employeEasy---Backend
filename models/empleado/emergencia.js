const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const Emergencia = sequelize.define('Emergencia', {
    
    nombre_contacto1:{
        type:DataTypes.STRING
    },

    telefono_contacto1:{
        type:DataTypes.STRING
    },

    nombre_contacto2:{
        type:DataTypes.STRING
    },

    telefono_contacto2:{
        type:DataTypes.STRING
    },

}, {
    timestamps:false
});


module.exports = Emergencia;