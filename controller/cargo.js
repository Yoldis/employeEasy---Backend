const { request, response } = require("express");
const { Cargo, Empleado } = require("../models");


const registrarCargo = async(req = request, res = response) => {

    const{nombre}= req.body;

    try {
        const existeCargo = await Cargo.findOne({where:{nombre}});
        if(existeCargo){
            return res.status(400).json([
                {
                    msg:'El cargo ya esta registrado'
                }
            ]);
        }

        const cargo = await Cargo.create({nombre});
        const total = await Cargo.count();

        res.status(200).json({
            data:cargo,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Registrar cargo'
            }
        ])
    }
};

const obtenerCargos = async(req = request, res = response) => {

    const {limit} = req.query;
    try {
        const {count, rows} = await Cargo.findAndCountAll({limit:Number(limit)});
        const cargos = await Cargo.findAll();
        
        res.status(200).json({
            data:cargos,
            total:count,
            cargoPag:rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener cargos'
            }
        ])
    }
};


const actualizarCargo = async(req = request, res = response) => {

    const{id}= req.params;
    const{nombre}= req.body;

    try {
        const existeCargo = await Cargo.findOne({where:{nombre}});
        if(existeCargo){
            return res.status(400).json([
                {
                    msg:'El cargo ya existe'
                }
            ]);
        }

        await Cargo.update({nombre}, {where:{id}});
        const cargo = await Cargo.findOne({where:{id}});

        res.status(200).json({
            data:cargo
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Actualizar cargos'
            }
        ])
    }
};


const eliminarCargo = async(req = request, res = response) => {

    const{id} = req.params;
    const{limit} = req.query;

    try {

        const cargoOnEmpleado = await Empleado.findOne({where:{cargoId:id}});
        if(cargoOnEmpleado){
            return res.status(401).json([
                {
                    msg:'Existen empledos con dicho cargo'
                }
            ])
        }

        const existeCargo = await Cargo.findByPk(id);
        if(!existeCargo){
            return res.status(400).json([
                {
                    msg:'El cargo no existe'
                }
            ]);
        }

        await Cargo.destroy({where:{id}});
        const {count, rows} = await Cargo.findAndCountAll({limit:Number(limit)});

        res.status(200).json({
            data:rows,
            total:count,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar cargo'
            }
        ]);
    }
};


module.exports = {
    registrarCargo,
    obtenerCargos,
    actualizarCargo,
    eliminarCargo
}