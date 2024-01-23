const { request, response } = require("express");
const { Empleado, Direccion, Emergencia, Laboral, Bancaria, Historial, HorarioEmple, Documento, Genero, EstadoCivil, Estado, TipoIdentificacion, TipoCuenta, TipoContrato, Usuario } = require("../models");
const{Op} = require('sequelize');
const sequelize = require("../db/config");


const registrarEmpleado = async(req = request, res = response) => {
    
    const{
        // Info TBL Empleado
        codigo_emple, foto, nombre, fecha_nacimiento, edad, genero, estadoCivil, nacionalidad, email, telefono, tipoIdentificacion, num_identificacion, departamento, cargo, horariosEmple = [], documentos = [],

        // Info TBL Direccion
        provincia, municipio, sector, calle, num_residencia,

        // Info TBL Emergencia
        nombre_contacto1, telefono_contacto1, nombre_contacto2, telefono_contacto2,

        // Info TBL Laboral
        fecha_contrato, tipoContrato, finalizacion_contrato, salario, numero_seguro,

        // Info TBL Bancaria
        nombre_banco, tipoCuenta, numero_cuenta_bancaria,

        // Info TBL Historial
        nombre_empresa_anterior, cargo_anterior, fecha_inicio, fecha_salida, motivo_salida
    } = req.body;
    
    try {
    const {round, random} = Math;
        const min = 10000;
        const max  = 99999;
        const ramdon1 = round(random() * (max - min+1) + min);
        const ramdon2 = round(random() * (max - min+1) + min);
        const codigo = `EMP-${ramdon1}-${ramdon2}`

        // Verificar si existe el empleado
        const existeEmpleado = await Empleado.findOne({where:{
            [Op.or]:{codigo_emple:codigo, email, telefono, num_identificacion}
        }});

        if(existeEmpleado){
            return res.status(400).json([
                {
                    msg:'El empleado ya esta registrado',
                }
            ]);
        };

        // Buscando el estado activo
        const estado = await Estado.findOne({where:{nombre:'Activo'}});
        
        let{empleado, total} = await sequelize.transaction(async(t) => {
            // Registrar empleado
            let empleado = await Empleado.create({codigo_emple:codigo, foto, nombre, fecha_nacimiento, edad, generoId:genero, estadoCivilId:estadoCivil, nacionalidad, email, telefono, tipoIdentificacionId:tipoIdentificacion, num_identificacion, departamentoId:departamento, cargoId:cargo, estadoId:estado.id}, {transaction:t});

            const promesas = [
                // Registrar Horarios del empleado en la relacion mucho a muchos
                ...horariosEmple.map(horario => HorarioEmple.create({EmpleadoId:empleado.id, HorarioId:horario}, {transaction:t})),

                // Registrar Documentos del empleado en la relacion uno a muchos
                ...documentos.map(doc => Documento.create({empleadoId:empleado.id, documento:doc.documento, nombre:doc.nombre}, {transaction:t}))
            ]

            // Ejercutar arrays de Promsesas
            await Promise.all(promesas);

            // Registrar demas Info relacionada con el empleado en la relacion uno a uno y
            // Obtener el total de empleado
            const [total] = await Promise.all([
                Empleado.count({transaction:t}),
                Direccion.create({empleadoId:empleado.id, provincia, municipio, sector, calle, num_residencia}, {transaction:t}),

                Emergencia.create({empleadoId:empleado.id, nombre_contacto1, telefono_contacto1, nombre_contacto2, telefono_contacto2}, {transaction:t}),

                Laboral.create({empleadoId:empleado.id, fecha_contrato, tipoContratoId:tipoContrato, finalizacion_contrato, salario, numero_seguro}, {transaction:t}),

                Bancaria.create({empleadoId:empleado.id, nombre_banco, tipoCuentaId:tipoCuenta, numero_cuenta_bancaria}, {transaction:t}),

                Historial.create({empleadoId:empleado.id, nombre_empresa_anterior, cargo_anterior, fecha_inicio, fecha_salida, motivo_salida}, {transaction:t}),
            ]);

            return {
                empleado,
                total
            }
        });


        // Obtener el empleado actual registrado
        empleado = await Empleado.findOne({
            where:{email},
            attributes:{
                exclude:['departamentoId', 'cargoId', 'generoId', 'estadoCivilId', 'tipoIdentificacionId', 'estadoId']
            },

            include:[
                {association:'genero'},
                {association:'estado'},
                {association:'estadoCivil'},
                {association:'tipoIdentificacion'},
                {association:'cargo'},
                {association:'departamento'},
                {association:'direccion'},
                {association:'emergencia'},
                {
                    association:'laboral',
                    attributes:{exclude:['tipoContratoId']},
                    include:{association:'tipoContrato'}
                },
                {
                    association:'bancaria',
                    attributes:{exclude:['tipoCuentaId']},
                    include:{association:'tipoCuenta',}
                },
                {association:'documentos', attributes:{exclude:['empleadoId']}},
                {association:'historial'},
                {
                    association:'horariosEmple', through:{attributes:[]},
                    attributes:{exclude:['turnoId']},
                    include:[
                        {association:'turno'},
                        {association:'diasSemana', through:{attributes:[]}},
                    ],
                },
            ]
        });
        
        res.status(200).json({
            data:empleado,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Registrar Empleado'
            }
        ])
    }
};


const obtenerEmpleados = async(req = request, res = response) => {

    const {limit} = req.query;

    try {
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});

        let[emplePag, total] = await Promise.all([
            
            Empleado.findAll({
                where:{
                    [Op.not]:{estadoId:estado.id}
                },

                limit:Number(limit),
                attributes:{
                    exclude:['departamentoId','cargoId', 'generoId', 'estadoCivilId', 'tipoIdentificacionId', 'estadoId']
                },

                include:[
                    {association:'genero'},
                    {association:'estado'},
                    {association:'estadoCivil'},
                    {association:'tipoIdentificacion'},
                    {association:'cargo'},
                    {association:'departamento'},
                    {association:'direccion'},
                    {association:'emergencia'},
                    {
                        association:'laboral',
                        attributes:{exclude:['tipoContratoId']},
                        include:{association:'tipoContrato'}
                    },
                    {
                        association:'bancaria',
                        attributes:{exclude:['tipoCuentaId']},
                        include:{association:'tipoCuenta',}
                    },
                    {association:'documentos', attributes:{exclude:['empleadoId']}},
                    {association:'historial'},
                    {
                        association:'horariosEmple', through:{attributes:[]},
                        attributes:{exclude:['turnoId']},
                        include:[
                            {association:'turno'},
                            {association:'diasSemana', through:{attributes:[]}},
                        ],
                    },
                ]
            }),
            Empleado.count({
                where:{
                    [Op.not]:{estadoId:estado.id}
                },
            })
        ]);
        const empleados = await Empleado.findAll({
            attributes:{
                exclude:['departamentoId','cargoId', 'generoId', 'estadoCivilId', 'tipoIdentificacionId', 'estadoId']
            },

            include:[
                {association:'genero'},
                {association:'estado'},
                {association:'estadoCivil'},
                {association:'tipoIdentificacion'},
                {association:'cargo'},
                {association:'departamento'},
                {association:'direccion'},
                {association:'emergencia'},
                {
                    association:'laboral',
                    attributes:{exclude:['tipoContratoId']},
                    include:{association:'tipoContrato'}
                },
                {
                    association:'bancaria',
                    attributes:{exclude:['tipoCuentaId']},
                    include:{association:'tipoCuenta',}
                },
                {association:'documentos', attributes:{exclude:['empleadoId']}},
                {association:'historial'},
                {
                    association:'horariosEmple', through:{attributes:[]},
                    attributes:{exclude:['turnoId']},
                    include:[
                        {association:'turno'},
                        {association:'diasSemana', through:{attributes:[]}},
                    ],
                },
            ]
        });

        res.status(200).json({
            data:empleados,
            total:total,
            emplePag
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener empleados'
            }
        ])
    }
};


const actualizarEmpleado = async(req = request, res = response) => {

    const{id: empleadoId} = req.params;
    const{
        // Info TBL Empleado
        codigo_emple, foto, nombre, fecha_nacimiento, edad, genero, estadoCivil, nacionalidad, email, telefono, tipoIdentificacion, num_identificacion, departamento, cargo, horariosEmple = [], documentos = [],

        // Info TBL Direccion
        provincia, municipio, sector, calle, num_residencia,

        // Info TBL Emergencia
        nombre_contacto1, telefono_contacto1, nombre_contacto2, telefono_contacto2,

        // Info TBL Laboral
        fecha_contrato, tipoContrato, finalizacion_contrato, salario, numero_seguro,

        // Info TBL Bancaria
        nombre_banco, tipoCuenta, numero_cuenta_bancaria,

        // Info TBL Historial
        nombre_empresa_anterior, cargo_anterior, fecha_inicio, fecha_salida, motivo_salida
    } = req.body;

    let existeHorario = false;
    let horarioEmpleInDb = [];

    let existeDocumento = false;
    let documentoInDb = [];

    try {
        const existeEmpleado = await Empleado.findOne({where:{codigo_emple, nombre, fecha_nacimiento, generoId:genero, estadoCivilId:estadoCivil, nacionalidad, tipoIdentificacionId:tipoIdentificacion, departamentoId:departamento, cargoId:cargo, email, telefono, num_identificacion}});
        
            const [horario, documento] = await Promise.all([

                HorarioEmple.findAll({where:{EmpleadoId:empleadoId}}),

                Documento.findAll({where:{empleadoId:empleadoId}}),
            ]);


            const verifyDataMuchtoMuch = (dataInDb, dataRequest) => {
                if(dataInDb.length === dataRequest.length){
                    data = dataRequest.every(dia => {
                        return dataInDb.includes(dia);
                    });
                    return data;
                }
                else false;
            }

            horarioEmpleInDb = horario.map(horario => horario.HorarioId);
            existeHorario = verifyDataMuchtoMuch(horarioEmpleInDb, [...horariosEmple.map(dia => Number(dia))]);

            documentoInDb = documento.map(doc => doc.documento);
            existeDocumento = verifyDataMuchtoMuch(documentoInDb, [...documentos.map(doc => doc.documento)]);

        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
        const{total} = await sequelize.transaction(async(t) => {
            const [total] = await Promise.all([
                Empleado.count({
                    where:{
                        [Op.not]:{estadoId:estado.id}
                    },
                    transaction:t
                }),
                Empleado.update({foto, nombre, fecha_nacimiento, edad, generoId:genero, estadoCivilId:estadoCivil, nacionalidad, email, telefono, tipoIdentificacionId:tipoIdentificacion, num_identificacion, departamentoId:departamento, cargoId:cargo}, {where:{id: empleadoId}, transaction:t}),
    
                Direccion.update({provincia, municipio, sector, calle, num_residencia}, {where:{empleadoId:empleadoId}, transaction:t}),
    
                Emergencia.update({nombre_contacto1, telefono_contacto1, nombre_contacto2, telefono_contacto2}, {where:{empleadoId:empleadoId}, transaction:t}),
    
                Laboral.update({fecha_contrato, tipoContratoId:tipoContrato, finalizacion_contrato, salario, numero_seguro}, {where:{empleadoId:empleadoId}, transaction:t}),
    
                Bancaria.update({nombre_banco, tipoCuentaId:tipoCuenta, numero_cuenta_bancaria}, {where:{empleadoId:empleadoId}, transaction:t}),
    
                Historial.update({nombre_empresa_anterior, cargo_anterior, fecha_inicio, fecha_salida, motivo_salida},{where:{empleadoId:empleadoId}, transaction:t}),
            ]);
    
            const updateDataHorarioEmple = async() => {
                let concatArrays = [...horarioEmpleInDb, ...horariosEmple];
                const dataSinRepetir = [];
                new Set(concatArrays).forEach(data => dataSinRepetir.push(data));
                for (const data of dataSinRepetir) {
                    if(!horarioEmpleInDb.includes(data) && horariosEmple.includes(data)){
                        await HorarioEmple.create({EmpleadoId:empleadoId, HorarioId:data}, {transaction:t});
                    }
                    else if(horarioEmpleInDb.includes(data) && !horariosEmple.includes(data)){
                        await HorarioEmple.destroy({where:{EmpleadoId:empleadoId, HorarioId:data}, transaction:t});
                    }
                }
            }
            if(!existeHorario) await updateDataHorarioEmple();
    
    
            documentoInDb = documento;
            const updateDataDocumento = async() => {
                let concatArrays = [...documentoInDb, ...documentos];
                const dataSinRepetir = [];
                new Set(concatArrays).forEach(data => dataSinRepetir.push(data));
                for (const data of dataSinRepetir) {
                    if(!documentoInDb.includes(data) && documentos.includes(data)){
                        await Documento.create({empleadoId:empleadoId, documento:data.documento, nombre:data.nombre}, {transaction:t});
                    }
                    else if(documentoInDb.includes(data) && !documentos.includes(data)){
                        await Documento.destroy({where:{empleadoId:empleadoId, documento:data.documento, nombre:data.nombre}, transaction:t});
                    }
                }
            }
            if(!existeDocumento) await updateDataDocumento();

            return {
                total
            }
        });

        // Obtener el empleado actualizado
        let empleado = await Empleado.findOne({
            where:{email},
            attributes:{
                exclude:['departamentoId', 'cargoId', 'generoId', 'estadoCivilId', 'tipoIdentificacionId', 'estadoId']
            },

            include:[
                {association:'genero'},
                {association:'estado'},
                {association:'estadoCivil'},
                {association:'tipoIdentificacion'},
                {association:'cargo'},
                {association:'departamento'},
                {association:'direccion'},
                {association:'emergencia'},
                {
                    association:'laboral',
                    attributes:{exclude:['tipoContratoId']},
                    include:{association:'tipoContrato'}
                },
                {
                    association:'bancaria',
                    attributes:{exclude:['tipoCuentaId']},
                    include:{association:'tipoCuenta',}
                },
                {association:'documentos', attributes:{exclude:['empleadoId']}},
                {association:'historial'},
                {
                    association:'horariosEmple', through:{attributes:[]},
                    attributes:{exclude:['turnoId']},
                    include:[
                        {association:'turno'},
                        {association:'diasSemana', through:{attributes:[]}},
                    ],
                },
            ]
        });
        
        res.status(200).json({
            data:empleado,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Actualizar Empleado'
            }
        ])
    }
};


const eliminarEmpleado = async(req = request, res = response) => {

    const{id: empleadoId} = req.params;
    const{limit} = req.query;

    try {
        const existeEmpleado = await Empleado.findByPk(empleadoId);
        if(!existeEmpleado){
            return res.status(400).json([
                {
                    msg:'El empleado no existe'
                }
            ]);
        }

        // Verificar si el empleado tiene algun usuario registrdo
        const existeUsuario = await Usuario.findOne({where:{empleadoId:empleadoId}});
        if(!existeUsuario){
            return res.status(401).json([
                {
                    msg:'El empleado no tiene ningun usuario registrado'
                }
            ])
        }

        // await Empleado.destroy({where:{id}});
        const estado = await Estado.findOne({where:{nombre:'Inactivo'}});

        await Promise.all([
            Empleado.update({estadoId:estado.id}, {where:{id: empleadoId}}),
            Usuario.update({estadoId:estado.id}, {where:{empleadoId:empleadoId}}),
        ])
        
        let[empleados, total] = await Promise.all([
            Empleado.findAll({
                where:{
                    [Op.not]:{estadoId:estado.id}
                },

                limit:Number(limit),
                attributes:{
                    exclude:['departamentoId', 'cargoId', 'generoId', 'estadoCivilId', 'tipoIdentificacionId', 'estadoId']
                },

                include:[
                    {association:'genero'},
                    {association:'estado'},
                    {association:'estadoCivil'},
                    {association:'tipoIdentificacion'},
                    {association:'cargo'},
                    {association:'departamento'},
                    {association:'direccion'},
                    {association:'emergencia'},
                    {
                        association:'laboral',
                        attributes:{exclude:['tipoContratoId']},
                        include:{association:'tipoContrato'}
                    },
                    {
                        association:'bancaria',
                        attributes:{exclude:['tipoCuentaId']},
                        include:{association:'tipoCuenta',}
                    },
                    {association:'documentos', attributes:{exclude:['empleadoId']}},
                    {association:'historial'},
                    {
                        association:'horariosEmple', through:{attributes:[]},
                        attributes:{exclude:['turnoId']},
                        include:[
                            {association:'turno'},
                            {association:'diasSemana', through:{attributes:[]}},
                        ],
                    },
                ]
            }),
            Empleado.count({
                    where:{
                        [Op.not]:{estadoId:estado.id}
                    }
            })
        ]);


        res.status(200).json({
            data:empleados,
            total:total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar Empleado'
            }
        ])
    }
};






// DATOS ESTATICOS

const obtenerGeneros = async(req = request, res = response) => {
    try {
        const {count, rows} = await Genero.findAndCountAll();

        res.status(200).json({
            data:rows
        })
    } catch (error) {
        console.log(error);
        res.status(500),json([
            {
                msg:'Algo sali mal al - Obtener los generos'
            }
        ])
    }
};

const obtenerEstadoCivil = async(req = request, res = response) => {
    try {
        const {count, rows} = await EstadoCivil.findAndCountAll();

        res.status(200).json({
            data:rows
        })
    } catch (error) {
        console.log(error);
        res.status(500),json([
            {
                msg:'Algo sali mal al - Obtener los EstadoCivil'
            }
        ])
    }
}


const obtenerEstados = async(req = request, res = response) => {
    try {
        const {count, rows} = await Estado.findAndCountAll();

        res.status(200).json({
            data:rows
        })
    } catch (error) {
        console.log(error);
        res.status(500),json([
            {
                msg:'Algo sali mal al - Obtener los Estado'
            }
        ])
    }
}

const obtenerTipoidentificacion = async(req = request, res = response) => {
    try {
        const {count, rows} = await TipoIdentificacion.findAndCountAll();

        res.status(200).json({
            data:rows
        })
    } catch (error) {
        console.log(error);
        res.status(500),json([
            {
                msg:'Algo sali mal al - Obtener los tipoidentificacion'
            }
        ])
    }
};

const obtenerTipocuenta = async(req = request, res = response) => {
    try {
        const {count, rows} = await TipoCuenta.findAndCountAll();

        res.status(200).json({
            data:rows
        })
    } catch (error) {
        console.log(error);
        res.status(500),json([
            {
                msg:'Algo sali mal al - Obtener los obtenerTipocuenta'
            }
        ])
    }
}

const obtenerTipocontratos = async(req = request, res = response) => {
    try {
        const {count, rows} = await TipoContrato.findAndCountAll();

        res.status(200).json({
            data:rows
        })
    } catch (error) {
        console.log(error);
        res.status(500),json([
            {
                msg:'Algo sali mal al - Obtener los obtenerTipocontratos'
            }
        ])
    }
}


module.exports = {
    registrarEmpleado,
    obtenerEmpleados,
    actualizarEmpleado,
    eliminarEmpleado,

    obtenerGeneros,
    obtenerEstadoCivil,
    obtenerEstados,
    obtenerTipoidentificacion,
    obtenerTipocuenta,
    obtenerTipocontratos
}