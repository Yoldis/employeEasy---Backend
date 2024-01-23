const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const Bancaria = sequelize.define('Bancaria', {
    
    nombre_banco:{
        type:DataTypes.STRING
    },

    numero_cuenta_bancaria:{
        type:DataTypes.STRING
    },

}, {
    timestamps:false
});


module.exports = Bancaria;