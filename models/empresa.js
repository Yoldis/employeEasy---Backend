const{DataTypes} = require('sequelize');
const sequelize = require('../db/config');

const Empresa = sequelize.define('Empresa', {

    logo:{
        type:DataTypes.STRING
    },

    nombre:{
        type:DataTypes.STRING
    },

    contacto:{
        type:DataTypes.STRING
    },

    direccion:{
        type:DataTypes.STRING
    },

    identificacion:{
        type:DataTypes.INTEGER
    },

    descripcion:{
        type:DataTypes.STRING
    },

}, {
    timestamps:false
});

module.exports = Empresa;
