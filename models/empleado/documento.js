const {DataTypes} = require('sequelize');
const sequelize = require('../../db/config');


const Documento = sequelize.define('Documento', {

    documento:{
        type:DataTypes.STRING
    },

    nombre:{
        type:DataTypes.STRING
    }

}, {
    timestamps:false
});

module.exports = Documento;