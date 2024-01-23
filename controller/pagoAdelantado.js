const { request, response } = require("express");
const { PagoAdelantado, Empleado, Estado } = require("../models");
const { Op } = require("sequelize");


const registrarPago = async(req = request, res = response) => {

    const{empleadoId, nombre, monto}= req.body;

    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        let empleado = await Empleado.findOne({
            attributes:['id', 'nombre', 'codigo_emple'],
            where:{id:empleadoId, estadoId:estado.id},
        });

        if(empleado){
            return res.status(401).json([
              {
                msg: "El empleado esta Inactivo",
              },
            ]);
        }

        const existePago = await PagoAdelantado.findOne({where:{nombre, empleadoId}});
        if(existePago){
            return res.status(400).json([
              {
                msg: "El empleado tiene este pago registrado",
              },
            ]);
        }

        await PagoAdelantado.create({nombre, monto, empleadoId});
        empleado = await Empleado.findOne({
            attributes:['id', 'nombre', 'codigo_emple'],
            where:{id:empleadoId},
            include:{
                association:'empleadoPago',
            }
        });

        const{empleadoPago, ...emple} = empleado.dataValues;
        const data = {...emple, data:empleado.empleadoPago}

        res.status(200).json({
            data
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Registrar pago",
          },
        ]);
    }
};



const actualizarPago = async(req = request, res = response) => {

    const{id} = req.params;
    const{empleadoId, nombre, monto} = req.body;

    try {
        const existePago = await PagoAdelantado.findOne({where:{nombre, empleadoId}});
        if(existePago){
            return res.status(400).json([
                {
                    msg:'El pago ya existe',
                }
            ]);
        }

        await PagoAdelantado.update({nombre, monto}, {where:{id}});
        const empleado = await Empleado.findOne({
            attributes:['id', 'nombre', 'codigo_emple'],
            where:{id:empleadoId},
            include:{
                association:'empleadoPago',
            }
        });

        const{empleadoPago, ...emple} = empleado.dataValues;
        const data = {...emple, data:empleado.empleadoPago}

        res.status(200).json({
            data
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Actualizar pago'
            }
        ])
    }
};


const obtenerPagos = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        const empleados = await Empleado.findAll({
                where:{[Op.not]:{estadoId:estado.id}},
                attributes:['id','nombre', 'codigo_emple'],
                include:{
                    where:{empleadoPago:{[Op.not]:[]}},
                    association:'empleadoPago'
                }
        });

        const data = empleados.map(e => {
            const{empleadoPago, ...data} = e.dataValues;
            return{...data, data:e.empleadoPago};
        });

        res.status(200).json({
            data,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener pagos'
            }
        ])
    }
};




const eliminarPago = async(req = request, res = response) => {

    const{id} = req.params;

    try {
      
        const existePago = await PagoAdelantado.findByPk(id);
        if(!existePago){
            return res.status(400).json([
                {
                    msg:'El pago no existe'
                }
            ]);
        }
        
        await PagoAdelantado.destroy({where:{id}});
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        const empleados = await Empleado.findAll({
            where:{[Op.not]:{estadoId:estado.id}},
            attributes:['id','nombre', 'codigo_emple'],
            include:{
                where:{empleadoPago:{[Op.not]:[]}},
                association:'empleadoPago'
            }
        });

        const data = empleados.map(e => {
            const{empleadoPago, ...data} = e.dataValues;
            return{...data, data:e.empleadoPago};
        });
        
        res.status(200).json({
            data,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar pago'
            }
        ])
    }
};


module.exports = {
    registrarPago,
    obtenerPagos,
    actualizarPago,
    eliminarPago
}