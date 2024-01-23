const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const Direccion = sequelize.define('Direccion', {
    
    provincia:{
        type:DataTypes.STRING
    },

    municipio:{
        type:DataTypes.STRING
    },

    sector:{
        type:DataTypes.STRING
    },

    calle:{
        type:DataTypes.STRING
    },

    num_residencia:{
        type:DataTypes.INTEGER
    }

}, {
    timestamps:false
});


module.exports = Direccion;