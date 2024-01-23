const { request, response } = require("express");
const { Empleado, Deduccione, NominaDeduccione, Nomina, NominaPagoAdelantado, NominaBeneficio, Estado } = require("../models");
const sequelize = require("../db/config");
const { Op } = require("sequelize");


const generarNomina = async(req = request, res = response) => {

    const{fecha, moneda} = req.body;
    const [ano, mes] = fecha.split('-');

    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        const [empleados, deducciones] = await Promise.all([
            Empleado.findAll({
                where:{[Op.not]:{estadoId:estado.id}},
                attributes:['id', 'nombre', 'codigo_emple'],
                include:[
                    {association:'laboral', attributes:['salario'] },
                    {association:'beneficiosEmple', through: { attributes: [] }},
                    {association:'empleadoPago',},
                ]
            }),
            Deduccione.findAll(),
        ]);

        const existeNomina = await Nomina.findAll({
            where:{
                fecha:{
                    [Op.and]:[
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano ),
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes ),
                    ]
                }
            }
        });

        if(!existeNomina.length){
            const nomina = empleados.map(emple => {
                // Empleado
                const{laboral:{salario}} = emple;
                let totalNeto = salario;
                let totalDeducciones = 0;
                let totalBeneficios = 0;
                let totalPagos = 0;
    
                // Deducciones
                const salarioDedu = deducciones.map(de => {
                    let data = {};
                    const{id, tipo, nombre, monto} = de;
                    if(tipo === 'Porciento'){
                        const deduccion = salario * (monto / 100);
                        data = {...data, id, nombre, monto:deduccion};
                    }
                    else if(tipo === 'Fijo') {
                        data = {...data, id, nombre, monto};
                    }
                    return data;
                });
    
                // Pagos Adelantados
                const pagos = emple.empleadoPago.map(pa => {
                    totalPagos = totalPagos + parseInt(pa.monto);
                    totalNeto = totalNeto - pa.monto;
                    return pa;
                });
    
                // Beneficios
                const beneficios = emple.beneficiosEmple.map(be => {
                    totalBeneficios = totalBeneficios + parseInt(be.monto);
                    totalNeto = totalNeto + parseInt(be.monto);
                    return be;
                });
    
                // Salario Neto
                for (const de of salarioDedu) {
                    totalDeducciones = totalDeducciones + parseInt(de.monto);
                    totalNeto =  totalNeto - de.monto;
                }
    
                // Retorno final
                return {deducciones:salarioDedu, pagos, beneficios, salario, totalNeto:parseInt(totalNeto),totalDeducciones, totalBeneficios, totalPagos, empleado:emple.id};
            });
    
            // Registrar en la Base de datos
            await sequelize.transaction(async(t) => {
    
                for (const nomi of nomina) {
                    const{deducciones,pagos,beneficios,salario,totalNeto, totalDeducciones, totalBeneficios, totalPagos, empleado} = nomi;
                    const createdNomina = await Nomina.create({fecha, totalNeto, totalDeducciones, totalBeneficios, totalPagos, moneda, salario, empleadoId:empleado}, {transaction:t});
                    await Promise.all([
                        ...deducciones.map(de => NominaDeduccione.create({NominaId:createdNomina.id, DeduccioneId:de.id, nombre:de.nombre, monto:de.monto}, {transaction:t})),
    
                        ...pagos.map(pa => NominaPagoAdelantado.create({NominaId:createdNomina.id, PagoAdelantadoId:pa.id, nombre:pa.nombre, monto:pa.monto}, {transaction:t})),
    
                        ...beneficios.map(be => NominaBeneficio.create({NominaId:createdNomina.id, BeneficioId:be.id, nombre:be.nombre, monto:be.monto}, {transaction:t})),
                    ]);
                }
            });
        }

        const data = await Nomina.findAll({
            where: {
                fecha: {
                  [Op.and]: [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano),
                    sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes)
                  ]
                }
              },
            include:[
                {association:'empleadoNomina', attributes:['id', 'nombre', 'codigo_emple'], where:{[Op.not]:{estadoId:estado.id}}},
                {association:'nominaDeducciones', attributes:{exclude:['nombre', 'monto', 'tipo']}},
                {association:'nominaBeneficios', attributes:{exclude:['nombre', 'monto']}},
                {association:'nominaPagoAdelantado', attributes:{exclude:['nombre', 'monto']}},
            ]
        });

        res.status(201).json({
            ano, mes,
            data
        });

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal al - Registrar la Nomina'
            }
        ])
    }
};


const obtenerNominas = async(req = request, res = response)=> {
    const{limit, fecha} = req.query;
    const [ano, mes] = fecha.split('-');
    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});

        const[nominas, nominasPag, total] = await Promise.all([
            Nomina.findAll({
                where:{
                    fecha:{
                        [Op.and]:[
                            sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano),
                            sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes),
                        ]
                    }
                },
                include:[
                    {association:'empleadoNomina', attributes:['id', 'nombre', 'codigo_emple'], where:{[Op.not]:{estadoId:estado.id}}},
                    {association:'nominaDeducciones', attributes:{exclude:['nombre', 'monto', 'tipo']}},
                    {association:'nominaBeneficios', attributes:{exclude:['nombre', 'monto']}},
                    {association:'nominaPagoAdelantado', attributes:{exclude:['nombre', 'monto']}},
                ]
            }),

            Nomina.findAll({
                limit:Number(limit),
                where:{
                    fecha:{
                        [Op.and]:[
                            sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano),
                            sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes),
                        ]
                    }
                },
                include:[
                    {association:'empleadoNomina', attributes:['id', 'nombre', 'codigo_emple'], where:{[Op.not]:{estadoId:estado.id}}},
                    {association:'nominaDeducciones', attributes:{exclude:['nombre', 'monto', 'tipo']}},
                    {association:'nominaBeneficios', attributes:{exclude:['nombre', 'monto']}},
                    {association:'nominaPagoAdelantado', attributes:{exclude:['nombre', 'monto']}},
                ]
            }),


            Nomina.count({ where:{
                fecha:{
                    [Op.and]:[
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano),
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes),
                    ]
                }
            },})
        ]);

        res.status(201).json({
            data:nominas,
            nominasPag,
            total,
        });

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener Nominas'
            }
        ])
    }
};


const obtenerNominaPorEmpleado = async(req = request, res = response) => {
    const{fecha, empleadoId} = req.query;
    const[ano, mes] = fecha.split('-');
    try {
        const nomina = await Nomina.findAll({
            where:{
                empleadoId,
                fecha:{
                    [Op.and]:[
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano),
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes),
                    ]
                }
            },
            include:[
                {association:'empleadoNomina', attributes:['id', 'nombre', 'codigo_emple']},
                {association:'nominaDeducciones', attributes:{exclude:['nombre', 'monto', 'tipo']}},
                {association:'nominaBeneficios', attributes:{exclude:['nombre', 'monto']}},
                {association:'nominaPagoAdelantado', attributes:{exclude:['nombre', 'monto']}},
            ]
        });

        res.status(200).json({
            data:nomina
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener Nomina'
            }
        ])
    }
}

module.exports = {
    generarNomina,
    obtenerNominas,
    obtenerNominaPorEmpleado
}