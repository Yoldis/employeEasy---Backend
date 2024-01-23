const{DataTypes} = require('sequelize');
const sequelize = require('../../db/config');
const { format, addDays } = require('date-fns');
const esLocale = require('date-fns/locale/es');

const Nomina = sequelize.define('Nomina', {

    fecha:{
        type:DataTypes.DATE,
        get(){
            const fecha = format(addDays(new Date(this.getDataValue('fecha')), 1), 'MMMM-yyyy', {locale:esLocale});
            return fecha;
        }
    },

    salario:{
        type:DataTypes.DECIMAL(10, 2)
    },
    
    totalDeducciones:{
        type:DataTypes.DECIMAL(10, 2)
    },

    totalBeneficios:{
        type:DataTypes.DECIMAL(10, 2)
    },

    totalPagos:{
        type:DataTypes.DECIMAL(10, 2)
    },

    totalNeto:{
        type:DataTypes.DECIMAL(10, 2)
    },

    moneda:{
        type:DataTypes.STRING
    }

}, {
    timestamps:false
});


module.exports = Nomina;