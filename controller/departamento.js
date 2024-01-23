const { request, response } = require("express");
const { Departamento, Empleado } = require("../models");


const registrarDepartamento = async(req = request, res = response) => {

    const{nombre}= req.body;

    try {
        const existeDepart = await Departamento.findOne({where:{nombre}});
        if(existeDepart){
            return res.status(400).json([
              {
                msg: "El departamento ya esta registrado",
              },
            ]);
        }

        const departamento = await Departamento.create({nombre});
        const total = await Departamento.count();

        res.status(200).json({
            data:departamento,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Registrar departamento",
          },
        ]);
    }
};

const obtenerDepartamentos = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const {count, rows} = await Departamento.findAndCountAll({limit:Number(limit)});
        const departamentos = await Departamento.findAll();

        res.status(200).json({
            data:departamentos,
            total:count,
            departPag:rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener departamentos'
            }
        ])
    }
};


const actualizarDepartamento = async(req = request, res = response) => {

    const{id} = req.params;
    const{nombre} = req.body;

    try {
        const existeDepart = await Departamento.findOne({where:{nombre}});
        if(existeDepart){
            return res.status(400).json([
                {
                    msg:'El departamento ya existe',
                }
            ]);
        }

        await Departamento.update({nombre}, {where:{id}});
        const departamento = await Departamento.findOne({where:{id}});

        res.status(200).json({
            data:departamento
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Actualizar departamentos'
            }
        ])
    }
};


const eliminarDepartamento = async(req = request, res = response) => {

    const{id} = req.params;
    const{limit} = req.query;

    try {
        const departOnEmpleado = await Empleado.findOne({where:{departamentoId:id}});
        if(departOnEmpleado){
            return res.status(401).json([
                {
                    msg:'El departamento tiene empleados asignados'
                }
            ])
        }
        
        const existeDepart = await Departamento.findByPk(id);
        if(!existeDepart){
            return res.status(400).json([
                {
                    msg:'El departamento no existe'
                }
            ]);
        }

        await Departamento.destroy({where:{id}});
        const {count, rows} = await Departamento.findAndCountAll({limit:Number(limit)});

        res.status(200).json({
            data:rows,
            total:count
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar departamentos'
            }
        ])
    }
};


module.exports = {
    registrarDepartamento,
    obtenerDepartamentos,
    actualizarDepartamento,
    eliminarDepartamento
}