const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const { format } = require('date-fns');


const Historial = sequelize.define('Historial', {
    
    nombre_empresa_anterior:{
        type:DataTypes.STRING
    },

    cargo_anterior:{
        type:DataTypes.STRING
    },

    fecha_inicio:{
        type:DataTypes.DATE,
        get(){
            return format(new Date(this.getDataValue('fecha_inicio')), 'yyyy-MM-dd');
        }
    },

    fecha_salida:{
        type:DataTypes.DATE,
        get(){
            return format(new Date(this.getDataValue('fecha_salida')), 'yyyy-MM-dd');
        }
    },

    motivo_salida:{
        type:DataTypes.STRING
    },

}, {
    timestamps:false,
});


module.exports = Historial;