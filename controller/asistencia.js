const { request, response } = require("express");
const { format, differenceInMinutes, addDays } = require("date-fns");
const esLocale = require('date-fns/locale/es');
const { Asistencia, Role } = require("../models");
const { Op } = require("sequelize");


const registrarAsistencia = async(req = request, res = response) => {
    const{id: userId} = req.params;
    const{hora} = req.body;

    try {
        const fechaActual = format(new Date(), 'yyyy-MM-dd', {locale:esLocale});
        const asistenciaHoy = await Asistencia.findOne({where:{usuarioId:userId, fecha:new Date(fechaActual)}});
        if(!asistenciaHoy) {
             return res.status(400).json([
            {
                msg:'No se encontro ninguna asistencia para el usuario'
            }
        ])
        }

        if(!asistenciaHoy?.horaEntrada && !asistenciaHoy?.horaSalida){
            const minutos = differenceInMinutes(new Date(`${format(new Date(), 'dd-MM-yyyy')} ${hora}`), new Date(`${format(new Date(), 'dd-MM-yyyy')} ${asistenciaHoy?.horaIncioSesion}`));

            await Asistencia.update({horaEntrada:hora, llegada:minutos > 5 ? 'Tarde' : 'A Tiempo'}, {where:{usuarioId:userId, fecha:new Date(fechaActual)}});
        }
        else if(asistenciaHoy?.horaEntrada && !asistenciaHoy?.horaSalida){
            const horaEn = parseInt(asistenciaHoy?.horaEntrada.split(':')[0]);
            const horaSa = parseInt(hora.split(':')[0]);

            const horasTrabajadas = Math.abs(Number(differenceInMinutes(
                addDays(new Date(`${fechaActual} ${hora}`), horaEn > horaSa ? 1 : 0), 
                new Date(`${fechaActual} ${asistenciaHoy?.horaEntrada}`)
            ) / 60).toFixed(1));

            await Asistencia.update({horaSalida:hora, horasTrabajadas}, {where:{usuarioId:userId, fecha:new Date(fechaActual)}});
        }

        const asistencia = await Asistencia.findOne({where:{usuarioId:userId, fecha:new Date(fechaActual)}});

        res.status(200).json({
            data:asistencia
        })

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:"Algo salio mal al - Registrar la asistencia"
            }
        ])
    }
};


const restablecerAsistenciaHoras = async(req = request, res = response) => {
    const{id} = req.params;
    const{hora} = req.body;

    try {
        const fechaActual = format(new Date(), 'yyyy-MM-dd', {locale:esLocale});
        if(+hora === 1) await Asistencia.update({horaEntrada:null, horaSalida:null, horasTrabajadas:null, llegada:null}, {where:{usuarioId:id, fecha:new Date(fechaActual)}});

        else if(+hora === 2) await Asistencia.update({horaSalida:null, horasTrabajadas:null}, {where:{usuarioId:id, fecha:new Date(fechaActual)}});

        res.status(200).json({
            msg:'Hora Restablecida'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Restablecer la asistencia - hora'
            }
        ])
    }
};


const obtenerAsistencia = async(req = request, res = response) =>{
    const{fecha = format(new Date(), 'yyyy-MM-dd')} = req.params;
    const {limit} = req.query;

    try {

        const {count, rows} = await Asistencia.findAndCountAll({
            limit:Number(limit), 
            where:{fecha:new Date(fecha)},
            attributes:{exclude:['usuarioId']},
            include:{
                association:'usuario',
                where:{[Op.not]:{empleadoId:null}},
                attributes:['id'],
                include:[
                    {association:'role'},
                    {
                        association:'empleado',
                        attributes:['id', 'nombre', 'foto', 'codigo_emple'],
                        include:[
                            {association:'cargo'},
                            {association:'departamento'},
                        ]
                    }
                ]
            }
        });

        const asistencias = await Asistencia.findAll({
            where:{fecha:new Date(fecha)},
            attributes:{exclude:['usuarioId']},
            include:{
                association:'usuario',
                where:{[Op.not]:{empleadoId:null}},
                attributes:['id'],
                include:[
                    {association:'role'},
                    {
                        association:'empleado',
                        attributes:['id', 'nombre', 'foto', 'codigo_emple'],
                        include:[
                            {association:'cargo'},
                            {association:'departamento'},
                        ]
                    }
                ]
            }
        });

        res.status(200).json({
            data:asistencias,
            total:count,
            asistenciasPag:rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener Asistencias'
            }
        ])
    }
};


const actualizarAsistencia = async(req = request, res = response) => {
    const{id: userId} = req.params;
    const{horaEntrada, horaSalida, fecha} = req.body;
    const formatFecha = format(new Date(fecha), 'yyyy-MM-dd')
    try {
        const asistenciaHoy = await Asistencia.findOne({where:{usuarioId:userId, fecha:new Date(fecha)}});
        if(!asistenciaHoy) {
             return res.status(400).json([
            {
                msg:'No se encontro ninguna asistencia para el usuario'
            }
        ])
        }

        const minutos = differenceInMinutes(new Date(`${formatFecha} ${horaEntrada}`), new Date(`${formatFecha} ${asistenciaHoy?.horaIncioSesion}`));

        const horaEn = parseInt(horaEntrada.split(':')[0]);
        const horaSa = parseInt(horaSalida.split(':')[0]);

        const horasTrabajadas = Math.abs(Number(differenceInMinutes(
            addDays(new Date(`${formatFecha} ${horaSalida}`), horaEn > horaSa ? 1 : 0), 
            new Date(`${formatFecha} ${horaEntrada}`)
        ) / 60).toFixed(1));
        

        await Asistencia.update({horaEntrada, horaSalida, horasTrabajadas, llegada:minutos > 5 ? 'Tarde' : 'A Tiempo' }, {where:{usuarioId:userId, fecha:new Date(fecha)}});


        const asistencia = await Asistencia.findOne({
            where:{usuarioId:userId, fecha:new Date(fecha)},
            attributes:{exclude:['usuarioId']},
            include:{
                association:'usuario',
                where:{[Op.not]:{empleadoId:null}},
                attributes:['id'],
                include:[
                    {association:'role'},
                    {
                        association:'empleado',
                        attributes:['id', 'nombre', 'foto', 'codigo_emple'],
                        include:[
                            {association:'cargo'},
                            {association:'departamento'},
                        ]
                    }
                ]
            }
        });

        res.status(200).json({
            data:asistencia
        })

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:"Algo salio mal al - Registrar la asistencia"
            }
        ])
    }
};

module.exports = {
    registrarAsistencia,
    restablecerAsistenciaHoras,
    obtenerAsistencia,
    actualizarAsistencia
}