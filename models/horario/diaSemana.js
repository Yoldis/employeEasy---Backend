const {DataTypes} = require('sequelize');
const sequelize = require('../../db/config');

const DiaSemana = sequelize.define('DiaSemana', {

    dia:{
        type:DataTypes.STRING,
        unique:true
    }
  },
  {
    timestamps:false
  });
  

module.exports = DiaSemana;