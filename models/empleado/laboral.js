const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const { format } = require('date-fns');


const Laboral = sequelize.define('Laboral', {
    
    fecha_contrato:{
        type:DataTypes.DATE,
        get(){
            const fecha = format(new Date(this.getDataValue('fecha_contrato')), 'yyyy-MM-dd');
            return fecha;
        }
    },

    finalizacion_contrato:{
        type:DataTypes.DATE,
        get(){
            const fecha = format(new Date(this.getDataValue('finalizacion_contrato')), 'yyyy-MM-dd');
            return fecha;
        }
    },

    salario:{
        type:DataTypes.INTEGER
    },

    numero_seguro:{
        type:DataTypes.INTEGER
    },

}, {
    timestamps:false
});


module.exports = Laboral;