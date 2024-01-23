const { request, response } = require("express");
const { Beneficio } = require("../models");


const registrarBeneficio = async(req = request, res = response) => {

    const{nombre, monto}= req.body;

    try {
        const existeBene = await Beneficio.findOne({where:{nombre}});
        if(existeBene){
            return res.status(400).json([
              {
                msg: "El empleado tiene este beneficio registrado",
              },
            ]);
        }

        const beneficio = await Beneficio.create({nombre, monto});
        const total = await Beneficio.count();

        res.status(200).json({
            data:beneficio,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Registrar beneficio",
          },
        ]);
    }
};



const actualizarBeneficio = async(req = request, res = response) => {

    const{id} = req.params;
    const{nombre, monto} = req.body;

    try {
        const existeBene = await Beneficio.findOne({where:{nombre, monto}});
        if(existeBene){
            return res.status(400).json([
                {
                    msg:'El beneficio ya existe',
                }
            ]);
        }

        await Beneficio.update({nombre, monto}, {where:{id}});
        const beneficio = await Beneficio.findOne({where:{id}});

        res.status(200).json({
            data:beneficio
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Actualizar beneficio'
            }
        ])
    }
};


const obtenerBeneficios = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const {count, rows} = await Beneficio.findAndCountAll({limit:Number(limit)});
        const beneficios = await Beneficio.findAll();
        
        res.status(200).json({
            data:beneficios,
            total:count,
            beneficioPag:rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener beneficios'
            }
        ])
    }
};


const eliminarBeneficio = async(req = request, res = response) => {

    const{id} = req.params;
    const{limit} = req.query;

    try {
      
        const existeBene = await Beneficio.findByPk(id);
        if(!existeBene){
            return res.status(400).json([
                {
                    msg:'El beneficio no existe'
                }
            ]);
        }

        await Beneficio.destroy({where:{id}});
        const {count, rows} = await Beneficio.findAndCountAll({limit:Number(limit)});
        
        res.status(200).json({
            data:rows,
            total:count
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar beneficio'
            }
        ])
    }
};


module.exports = {
    registrarBeneficio,
    obtenerBeneficios,
    actualizarBeneficio,
    eliminarBeneficio
}