const {DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const Deduccione = sequelize.define('Deduccione', {

    tipo:{
        type:DataTypes.STRING
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


module.exports = Deduccione;
