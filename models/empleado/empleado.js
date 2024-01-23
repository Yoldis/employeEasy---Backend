const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const { format, addDays } = require('date-fns');

const Empleado = sequelize.define('Empleado', {
    
    codigo_emple:{
        type:DataTypes.STRING,
        unique:true
    },

    foto:{
        type:DataTypes.STRING
    },

    nombre:{
        type:DataTypes.STRING
    },
    

    fecha_nacimiento:{
        type:DataTypes.DATE,
        get(){
            if(!this.getDataValue('fecha_nacimiento')) return;
            const fecha = format(addDays(new Date(this.getDataValue('fecha_nacimiento')), 1), 'yyyy-MM-dd');
            return fecha;
        }
    },

    edad:{
        type:DataTypes.INTEGER
    },

    nacionalidad:{
        type:DataTypes.STRING
    },

    email:{
        type:DataTypes.STRING,
        unique:true
    },

    telefono:{
        type:DataTypes.STRING,
        unique:true
    },

    num_identificacion:{
        type:DataTypes.STRING,
        unique:true
    },


}, {
    timestamps:false
});


module.exports = Empleado;