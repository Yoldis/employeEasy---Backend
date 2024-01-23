const{ DataTypes} = require('sequelize');
const sequelize = require('../db/config');

const Usuario = sequelize.define('Usuario', {

    foto:{
        type:DataTypes.STRING,
    },

    email:{
        type:DataTypes.STRING,
        unique:true
    },

    password:{
        type:DataTypes.STRING,
    },

    cambioPassword:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },

}, {
    
    timestamps:false
});



module.exports = Usuario;