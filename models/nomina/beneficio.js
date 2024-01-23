const {DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const Beneficio = sequelize.define('Beneficio', {

    nombre:{
        type:DataTypes.STRING
    },

    monto:{
        type:DataTypes.DECIMAL(10, 2)
    },

}, {
    timestamps:false
});


module.exports = Beneficio;