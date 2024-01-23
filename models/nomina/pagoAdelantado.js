const {DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const PagoAdelantado = sequelize.define('PagoAdelantado', {

    nombre:{
        type:DataTypes.STRING
    },

    monto:{
        type:DataTypes.DECIMAL(10, 2)
    },

}, {
    timestamps:false
});


module.exports = PagoAdelantado;