const { request, response } = require("express");
const { Deduccione } = require("../models");


const registrarDeduccion = async(req = request, res = response) => {

    const{tipo, nombre, monto}= req.body;

    try {
        const existeDeduccion = await Deduccione.findOne({where:{nombre}});
        if(existeDeduccion){
            return res.status(400).json([
              {
                msg: "La deduccion ya esta registrada",
              },
            ]);
        }

        const deduccion = await Deduccione.create({tipo, nombre, monto});
        const total = await Deduccione.count();

        res.status(200).json({
            data:deduccion,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Registrar deduccion",
          },
        ]);
    }
};

const obtenerDeducciones = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const {count, rows} = await Deduccione.findAndCountAll({limit:Number(limit)});

        res.status(200).json({
            data:rows,
            total:count,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener deducciones'
            }
        ])
    }
};


const actualizarDeduccion = async(req = request, res = response) => {

    const{id} = req.params;
    const{tipo, nombre, monto}= req.body;

    try {
        const existeDeduci = await Deduccione.findOne({where:{tipo, nombre, monto}});
        if(existeDeduci){
            return res.status(400).json([
                {
                    msg:'La deduccion ya existe',
                }
            ]);
        }

        await Deduccione.update({tipo, nombre, monto}, {where:{id}});
        const deduccion = await Deduccione.findOne({where:{id}});

        res.status(200).json({
            data:deduccion
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Actualizar deduccion'
            }
        ])
    }
};


const eliminarDeduccion = async(req = request, res = response) => {

    const{id} = req.params;
    const{limit} = req.query;

    try {
        const existeDeduci = await Deduccione.findByPk(id);
        if(!existeDeduci){
            return res.status(400).json([
                {
                    msg:'La deduccion no existe'
                }
            ]);
        }

        await Deduccione.destroy({where:{id}});
        const {count, rows} = await Deduccione.findAndCountAll({limit:Number(limit)});

        res.status(200).json({
            data:rows,
            total:count
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar deduccion'
            }
        ])
    }
};


module.exports = {
    registrarDeduccion,
    obtenerDeducciones,
    actualizarDeduccion,
    eliminarDeduccion
}