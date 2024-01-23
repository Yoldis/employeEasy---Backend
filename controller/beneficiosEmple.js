const { request, response } = require("express");
const { Beneficio, BeneficioEmple, Empleado, Estado } = require("../models");
const { Op } = require("sequelize");


const registrarBeneficiosEmple = async(req = request, res = response) => {

    const{empleadoId, beneficiosEmple = []}= req.body;

    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        let empleadoInactivo = await Empleado.findOne({
            attributes:['id', 'nombre', 'codigo_emple'],
            where:{id:empleadoId, estadoId:estado.id},
        });

        if(empleadoInactivo){
            return res.status(401).json([
              {
                msg: "El empleado esta Inactivo",
              },
            ]);
        }

        const existeBeneficios = await BeneficioEmple.findOne({where:{EmpleadoId:empleadoId} });
        if(existeBeneficios){
            return res.status(401).json([
                {
                    msg:"El empleado esta registrado"
                }
            ])
        }

        // Crear Beneficios para empleados
        const createBene = beneficiosEmple.map((b) => {
            BeneficioEmple.create({EmpleadoId:empleadoId, BeneficioId:b});
        });

        await Promise.all(createBene);
        
        const[empleado, beneficios] = await Promise.all([
            Empleado.findOne({where:{id:empleadoId, [Op.not]:{estadoId:estado.id}}, attributes:['id','nombre', 'codigo_emple']}),
            Beneficio.findAll({where:{id:beneficiosEmple}}),
        ]);

        const data = {...empleado.dataValues, id:empleado.id, data:beneficios};
        res.status(200).json({
            data
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


const actualizarBeneficiosEmple = async(req = request, res = response) => {

    let{empleadoId, beneficiosEmple = []}= req.body;
    beneficiosEmple = beneficiosEmple.map(b => Number(b));
    
    try {
        const existeBeneficios = await BeneficioEmple.findOne({where:{EmpleadoId:empleadoId} });

        if(!existeBeneficios){
            return res.status(401).json([
                {
                    msg:"El empleado no esta registrado"
                }
            ])
        }

        const idBeneficiosInDb = (await BeneficioEmple.findAll({where:{EmpleadoId:empleadoId}})).map(b => b.BeneficioId);

        if(beneficiosEmple.length === idBeneficiosInDb.length){
            const existeBeneficios = beneficiosEmple.every(b => idBeneficiosInDb.includes(b));
        
            if(existeBeneficios){
                return res.status(401).json([
                    {
                        msg:"El empleado ya tiene estos beneficios"
                    }
                ])
            }
        }
        
        const concatIdBeneficios = new Set([...beneficiosEmple, ...idBeneficiosInDb]);
        const allBeneficios = [...concatIdBeneficios];

        for(const b of allBeneficios){
           if(beneficiosEmple.includes(b) && !idBeneficiosInDb.includes(b)){
            await BeneficioEmple.create({EmpleadoId:empleadoId, BeneficioId:b});
           }

           else if(!beneficiosEmple.includes(b) && idBeneficiosInDb.includes(b)){
            await BeneficioEmple.destroy({where:{EmpleadoId:empleadoId, BeneficioId:b}});
           }
        }

        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        const[empleado, beneficios] = await Promise.all([
            Empleado.findOne({where:{id:empleadoId, [Op.not]:{estadoId:estado.id},}, attributes:['id' ,'nombre', 'codigo_emple']}),
            Beneficio.findAll({where:{id:beneficiosEmple}}),
        ]);

        const data = {...empleado.dataValues, id:empleado.id, data:beneficios};

        res.status(200).json({
            data
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


const obtenerBeneficiosEmple = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        const empleados = await Empleado.findAll({
            where:{[Op.not]:{estadoId:estado.id}},
            attributes:['id', 'nombre', 'codigo_emple'],
            include:{
                where:{beneficiosEmple:{[Op.not]: []}},
                association:'beneficiosEmple',
                through:{attributes:[]}
            }
        })

        const data = empleados.map(e => {
            const{beneficiosEmple, ...values} = e.dataValues;
            return {...values, data:e.beneficiosEmple}
        });
        
        res.status(200).json({
            data
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


const eliminarBeneficiosEmple = async(req = request, res = response) => {
    const{id} = req.params;

    try {
      
        const existeBene = await BeneficioEmple.findOne({where:{EmpleadoId:id}});
        if(!existeBene){
            return res.status(400).json([
                {
                    msg:'El beneficio no existe'
                }
            ]);
        }

        await BeneficioEmple.destroy({where:{EmpleadoId:id}});
        
        res.status(200).json({
           
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
    registrarBeneficiosEmple,
    obtenerBeneficiosEmple,
    actualizarBeneficiosEmple,
    eliminarBeneficiosEmple
}