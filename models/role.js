
const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Role = sequelize.define('Role', {

    nombre:{
        type:DataTypes.STRING,
        unique:true
    }
},
{
    timestamps:false,
});


module.exports = Role;