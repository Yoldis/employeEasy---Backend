const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const Nomina = require('./nomina');
const Beneficio = require('./beneficio');

const NominaBeneficio = sequelize.define('NominaBeneficio', {

    NominaId:{
        type:DataTypes.INTEGER,
        references:{
            model:Nomina,
            key:'id'
        }
    },

    BeneficioId:{
        type:DataTypes.INTEGER,
        references:{
            model:Beneficio,
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

module.exports = NominaBeneficio;