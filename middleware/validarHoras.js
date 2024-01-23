const { request, response } = require("express");
const {format, compareAsc, differenceInHours, getHours} = require('date-fns');
const { Turno } = require("../models");

const validarHora = async(req = request, res = response, next) => {

    const{turno, hora_entrada, hora_salida, horas} = req.body;
    
    const horarioDiurno = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
    const horarioNocturno = [19,20,21,22,23,0,1,2,3,4,5];
    const horasInDia = 24;

    const fecha = format(new Date(), 'MM/dd//yyy');
    
    const horaE = new Date(`${fecha} ${hora_entrada}`);
    const horaS = new Date(`${fecha} ${hora_salida}`);
    
    const horaNumE = getHours(horaE);
    const horaNumS = getHours(horaS);

    const existeTurno = await Turno.findOne({where:{id:turno}});
    if(!existeTurno){
        return res.status(400).json([
            {
                msg:`El turno seleccionado no existe`
            }
        ]);
    };

    if(existeTurno.nombre === 'Diurno'){
        if(!horarioDiurno.includes(horaNumE) || !horarioDiurno.includes(horaNumS) ){
            return res.status(400).json([
                {
                    msg:`El horario no es ${existeTurno.nombre}`
                }
            ]);
        };
        
        const horasTraDir = differenceInHours(horaS, horaE);

        if(horasTraDir !== Number(horas)){
            return res.status(400).json([
                {
                    msg:`El horario debe tener ${horas} horas`,
                }
            ]);
        };

        const valid = compareAsc(horaE, horaS);
        if(valid === 1){
            return res.status(400).json([
              {
                msg: "La hora de entrada debe ser menor que la hora de salida",
              },
            ]);
        }
    }

    else if(existeTurno.nombre === 'Nocturno'){
      
        if(!horarioNocturno.includes(horaNumE) || !horarioNocturno.includes(horaNumS)){
            return res.status(400).json([
                {
                    msg:`El horario no es ${existeTurno.nombre}`
                }
            ]);
        }

        const horasTraNoc = differenceInHours(horaE, horaS);

        if(Math.abs(horasTraNoc > horasInDia / 2 ? horasTraNoc - horasInDia : horasTraNoc) !== Number(horas)){
            return res.status(400).json([
                {
                    msg:`El horario debe tener ${horas} horas`
                }
            ]);
        };

        const valid =  Math.abs(horasTraNoc) > horasInDia / 2 ? compareAsc(horaS, horaE) :  compareAsc(horaE, horaS);
        if(valid === 1){
            return res.status(400).json([
                {
                    msg:'La hora de salida debe ser mayor que la hora de entrada',
                }
            ]);
        }
    }
    
    next();
};



module.exports = validarHora;