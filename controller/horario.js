const { request, response } = require("express");
const { Horario, DiaSemana, HorarioDia, Turno } = require("../models");
const{Op} = require('sequelize');
const sequelize = require("../db/config");


const registrarHorario = async(req = request, res = response) => {

    const{turno, hora_entrada, hora_salida, horas, diasSemana} = req.body;

    try {
        const existeHorario = await Horario.findOne({
            where:{turnoId:turno, hora_entrada, hora_salida, horas},
            include:{
                model:DiaSemana,
                as:'diasSemana',
                through:{attributes:[]},
                where:{
                    id:diasSemana
                }
            }
        });

        if(existeHorario){
            return res.status(400).json([
                {
                    msg:'El horario ya esta registrado',
                }
            ]);
        }

        let{horario, total} = await sequelize.transaction(async(t) => {
            const horario = await Horario.create({turnoId:turno, hora_entrada, hora_salida, horas}, {transaction:t});
            const total = await Horario.count({transaction:t});
    
            for (const dia of diasSemana) {
                await HorarioDia.create({HorarioId:horario.id, DiaSemanaId:dia}, {transaction:t});
            }

            return {
                horario,
                total
            }
        });
        

        horario = await Horario.findOne({
            where:{turnoId:turno, hora_entrada, hora_salida, horas},
            attributes:{exclude:['turnoId']},
            include:[
                {
                    model:DiaSemana,
                    as:'diasSemana',
                    through:{attributes:[]}
                },
                {association:'turno'}
            ]

        });
        
        res.status(200).json({
            data:horario,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Registrar horario",
          },
        ]);
    }
};

const obtenerHorarios = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const[horariosPag, total] = await Promise.all([
            Horario.findAll({
                limit:Number(limit),
                attributes:{exclude:['turnoId']},
                include:[
                    {
                        model:DiaSemana,
                        as:'diasSemana',
                        through: { attributes: [] }
                    },

                    {association:'turno'}
                ],
            }),

            Horario.count()
        ]);

        const horarios = await Horario.findAll({
            attributes:{exclude:['turnoId']},
            include:[
                {
                    model:DiaSemana,
                    as:'diasSemana',
                    through: { attributes: [] }
                },

                {association:'turno'}
            ],
        })

        res.status(200).json({
            data:horarios,
            total:total,
            horariosPag
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Obtener horarios",
          },
        ]);
    }
};


const actualizarHorario = async(req = request, res = response) => {

    const{id} = req.params;
    const{turno, hora_entrada, hora_salida, horas, diasSemana} = req.body;
    let eixstenDias = false;
    let diasInDb = [];
    
    try {
        const existeHorario = await Horario.findOne({
            where:{turnoId:turno, hora_entrada, hora_salida, horas, id},
            include:{
                association:'diasSemana',
                through:{attributes:[]},
                attributes:['id']
            }
        });

        if(existeHorario){
            diasInDb = existeHorario.diasSemana.map(dia => dia.id);

            if(diasInDb.length === diasSemana.length){
                eixstenDias = diasSemana.every(dia => {
                    return diasInDb.includes(dia);
                });
            }
        }
        else diasInDb = diasSemana;
        
        if(eixstenDias){
            return res.status(400).json([
              {
                msg: "El horario ya existe",
              },
            ]);
        }

        sequelize.transaction(async(t) => {
            await Horario.update({turnoId:turno, hora_entrada, hora_salida, horas}, {where:{id}, transaction:t});
        
            let concatAllDias = [...diasInDb, ...diasSemana];
            const diasSinRepetir = [];
            new Set(concatAllDias).forEach(dia => diasSinRepetir.push(dia));

            for (const dia of diasSinRepetir) {
                if(!diasInDb.includes(dia) && diasSemana.includes(dia)){
                    await HorarioDia.create({HorarioId:id, DiaSemanaId:dia}, {transaction:t});
                }
                else if(diasInDb.includes(dia) && !diasSemana.includes(dia)){
                    await HorarioDia.destroy({where:{HorarioId:id, DiaSemanaId:dia}, transaction:t});
                }
            }
        })

        const horario = await Horario.findOne({
            where:{turnoId:turno, hora_entrada, hora_salida, horas},
            attributes:{exclude:['turnoId']},
            include:[
                {association:'diasSemana', through:{attributes:[]}},
                {association:'turno'}
            ]
        });

        res.status(200).json({
            data:horario,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Actualizar horario",
          },
        ]);
    }
};


const eliminarHorario = async(req = request, res = response) => {

    const{id} = req.params;
    const{limit} = req.query;

    try {
        const existeHorario = await Horario.findByPk(id);

        if(!existeHorario){
            return res.status(400).json([
              {
                msg: "El horario no existe",
              },
            ]);
        }
        

        await Horario.destroy({where:{id}});
        const[horarios, total] = await Promise.all([
            Horario.findAll({
                limit:Number(limit),
                 attributes:{exclude:['turnoId']},
                include:[
                    {
                        model:DiaSemana,
                        as:'diasSemana',
                        through: { attributes: [] }
                    },
                    {association:'turno'}
                ]
            }),

            Horario.count()
        ]);

        res.status(200).json({
            data:horarios,
            total:total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar horario'
            }
        ])
    }
};


const obtenerDias = async(req = request, res = response) => {

    try {
        const {count, rows} = await DiaSemana.findAndCountAll();

        res.status(200).json({
            data:rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener los dias'
            }
        ])
    }
};


const obtenerTurnos = async(req = request, res = response) => {

    try {
        const {count, rows} = await Turno.findAndCountAll();

        res.status(200).json({
            data:rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener los turnos'
            }
        ])
    }
};


module.exports = {
    registrarHorario,
     obtenerHorarios,
     actualizarHorario,
     eliminarHorario,
     obtenerDias,
     obtenerTurnos
}
