const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const Nomina = require('./nomina');
const PagoAdelantado = require('./pagoAdelantado');

const NominaPagoAdelantado = sequelize.define('NominaPagoAdelantado', {

    NominaId:{
        type:DataTypes.INTEGER,
        references:{
            model:Nomina,
            key:'id'
        }
    },

    PagoAdelantadoId:{
        type:DataTypes.INTEGER,
        references:{
            model:PagoAdelantado,
            key:'id'
        }
    },

    nombre:{
        type:DataTypes.STRING
    },

    monto:{
        type:DataTypes.DECIMAL(10, 2)
    },

}, {
    timestamps:false
});


module.exports = NominaPagoAdelantado;
