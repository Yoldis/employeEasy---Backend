const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const Nomina = require('./nomina');
const Deduccione = require('./deduccione');

const NominaDeduccione = sequelize.define('NominaDeduccione', {

    NominaId:{
        type:DataTypes.INTEGER,
        references:{
            model:Nomina,
            key:'id'
        }
    },

    DeduccioneId:{
        type:DataTypes.INTEGER,
        references:{
            model:Deduccione,
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


module.exports = NominaDeduccione;
