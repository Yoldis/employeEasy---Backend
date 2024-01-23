const{DataTypes} = require('sequelize');
const sequelize = require('../../../db/config');


const EstadoCivil = sequelize.define('EstadoCivil', {
    
    nombre:{
        type:DataTypes.STRING,
        unique:true
    },

}, {
    timestamps:false
});


module.exports = EstadoCivil;