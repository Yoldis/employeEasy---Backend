const { request, response } = require("express");
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);
const {v4: uuidv4 } = require('uuid');

const { Departamento, Cargo, Horario, Empleado, Usuario, Role, Estado, Documento, Asistencia, Empresa, Deduccione, Beneficio, Nomina } = require("../models");
const subirArchivo = require("../helpers/subirArchivo");
const { Op } = require("sequelize");
const sequelize = require("../db/config");



const paginacion = async(req = request, res = response) => {

    let{coleccion, pagina, limit} = req.params;
    const{role, fecha} = req.query;

    coleccion = coleccion.split('').map(c => c.toUpperCase()).join('');
    let data = [];

    try {

        if(coleccion === 'DEPARTAMENTOS'){
            data = await Departamento.findAll({limit:Number(limit), offset:Number(pagina)});
        }

        else if(coleccion === 'CARGOS'){
            data = await Cargo.findAll({limit:Number(limit), offset:Number(pagina)});
        }

        else if(coleccion === 'HORARIOS'){
            data = await Horario.findAll({
                limit:Number(limit), offset:Number(pagina),
                include:{
                    association:'diasSemana',
                    through:{attributes:[]}
                },
            });
        }

        else if(coleccion === 'EMPLEADOS'){
            const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
            data = await Empleado.findAll({
                where:{
                    [Op.not]:{estadoId:estado.id}
                },
                
                limit:Number(limit), offset:Number(pagina),
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
        }

        else if(coleccion === 'USUARIOS'){
            const adminRol = await Role.findOne({where:{nombre:'Admin'}});
            const rrhhRol = await Role.findOne({where:{nombre:'RRHH'}});
            data = await Usuario.findAll({
                where:role === 'Admin' ? {[Op.not]:{empleadoId:null}} : {[Op.not]:{[Op.or]:[{roleId:adminRol.id}, {roleId:rrhhRol.id}, {empleadoId:null}]}},
                limit:Number(limit), offset:Number(pagina),
                attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
                include:[
                    {association:'role'},
                    {association:'estadoUser'},
                    {association:'empleado', attributes:['id', 'nombre', 'codigo_emple', 'foto'], include:[
                        {association:'cargo'},
                        {association:'departamento'},
                        {
                            association:'horariosEmple', through:{attributes:[]},
                            attributes:{exclude:['turnoId']},
                            include:[
                                {association:'turno'},
                                {association:'diasSemana', through:{attributes:[]}},
                            ],
                        },
                    ]},
                ]
            });
        }

        else if(coleccion === 'ASISTENCIAS'){
            data = await Asistencia.findAll({
                limit:Number(limit), offset:Number(pagina),
                where:{fecha:new Date(fecha)},
                attributes:{exclude:['usuarioId', 'empleadoId']},
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
        }


        else if(coleccion === 'DEDUCCIONES'){
            data = await Deduccione.findAll({limit:Number(limit), offset:Number(pagina)});
        }

        else if(coleccion === 'BENEFICIOS'){
            data = await Beneficio.findAll({limit:Number(limit), offset:Number(pagina)});
        }

        else if(coleccion === 'NOMINAS'){
            const[ano, mes] = fecha.split('-');

            data = await Nomina.findAll({
                limit:Number(limit),
                offset:Number(pagina),
                where:{
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
        }
        
        res.status(200).json({
            limit,
            data
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Paginar'
            }
        ])
    }
};



const cargarFotoClodinary = async(req = request, res = response) => {

    const{img, coleccion} = req.body;
    const {foto} = req.files;

    try {
        const pathPermitted = [{path:'FotoUsuario', coleccion:'USUARIO'}, {path:'FotoEmpleado', coleccion:'EMPLEADO'}, {path:'FotoEmpresa', coleccion:'EMPRESA'}];
        const coleccionUpperCase = coleccion.split(' ').map(n => n.toUpperCase())[0];
        const existeColeccion = pathPermitted.find(c => c.coleccion === coleccionUpperCase);

        if(!existeColeccion){
            return res.status(400).json([
                {
                    msg:'Paths permitidos' + " " + pathPermitted.map(n => n.coleccion)
                }
            ])
        }

        if(img){
            const imgCortada = img.split('/');
            const [idFile] = imgCortada[imgCortada.length - 1].split('.');
            const path = `EmployeEasy/${existeColeccion.path}/${idFile}`;
            await cloudinary.uploader.destroy(path);
        }

        const file = foto.tempFilePath;
        const secure_url = await subirArchivo(file, existeColeccion.path);
        
        res.status(200).json({
            data:secure_url
        });

    } catch(error){
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal al - Cargar la foto'
            }
        ])
    }
};



const cargarDocumentosCloudinary = async(req = request, res = response) => {

    const{documentos} = req.files;
    let files = [];
    const path = 'DocumentosEmpleado';

    try {
        const docsIsArray = Array.isArray(documentos);
        if(docsIsArray){
            const promiseDoc = documentos.map(async(doc) => {
                const file = doc.tempFilePath;
                const secure_url = await subirArchivo(file, path);
                return {
                    nombre:doc.name,
                    documento:secure_url
                }
            })

            files = await Promise.all(promiseDoc);
        }
        else{
            const file = documentos.tempFilePath;
            const secure_url = await subirArchivo(file, path);
            files.push({nombre:documentos.name, documento:secure_url});
        }

        res.status(201).json({
            data:files
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Cargar documentos'
            }
        ])
    }
}

const deleteFotoOnCloudinary = async(req = request, res = response) => {

    const{foto, coleccion} = req.body;
    
    const pathPermitted = [{path:'FotoUsuario', coleccion:'USUARIO'}, {path:'FotoEmpleado', coleccion:'EMPLEADO'}];

    const coleccionUpperCase = coleccion.split(' ').map(n => n.toUpperCase())[0];
    const existeColeccion = pathPermitted.find(c => c.coleccion === coleccionUpperCase);

    if(!existeColeccion){
        return res.status(400).json([
            {
                msg:'Paths permitidos' + " " + pathPermitted.map(n => n.coleccion)
            }
        ])
    }

    try {
        if(foto) {
            const imgCortada = foto.split('/');
            const [idFile] = imgCortada[imgCortada.length - 1].split('.');
            const path = `EmployeEasy/${existeColeccion.path}/${idFile}`;
            await cloudinary.uploader.destroy(path);
        };
        
        res.status(200).json({
            msg:'ok Eliminado'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal - Al eliminar Foto'
            }
        ])
    }
};


const deleteDocsOnCloudinary = async(req = request, res = response) => {

    const{documentos} = req.body;

    if(!documentos.length) return;
    
    try {
        documentos.forEach(async(doc) => {
            const imgCortada = doc.split('/');
            const [idFile] = imgCortada[imgCortada.length - 1].split('.');
            const path = `EmployeEasy/DocumentosEmpleado/${idFile}`;
            await cloudinary.uploader.destroy(path);
        });

        res.status(200).json({
            msg:'ok Eliminado'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal - Al eliminar Documentos'
            }
        ])
    }
};


const eliminarArchivosSinDestino = async(req = request, res = response) => {

    try {
        const {resources} = await cloudinary.api.resources({ type: 'upload', prefix: 'EmployeEasy' });

        resources.forEach(async(r) => {
            const data = await Promise.all([
                Usuario.findOne({where:{foto:r.secure_url}}),
                Empleado.findOne({where:{foto:r.secure_url}}),
                Empresa.findOne({where:{logo:r.secure_url}}),
                Documento.findOne({where:{documento:r.secure_url}}),
            ]);

            if(data.every(d => !d) && r.folder !== 'EmployeEasy'){
                await cloudinary.uploader.destroy(r.public_id);
            }

        });
        
        res.status(200).json({
            msg:'Archivos Eliminados',
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Eliminar archivo sin destinos'
            }
        ])
    }
}


const buscarController = async(req = request, res = response) => {

    let {coleccion} = req.params;
    const{termino, role, fecha} = req.query;
    
    coleccion = coleccion.split('').map(c => c.toUpperCase()).join('');

    let data = [];
    
    if(termino === undefined){
        return res.status(400).json([
            {
                msg:'No hay termino en la peticion'
            }
        ])
    }

   
    try {
        if(coleccion === 'EMPLEADOS'){
            const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
            data = await Empleado.findAll({
                
                where:
                termino ? {
                    [Op.or]:[
                        {nombre:{[Op.regexp]:termino}},
                        {codigo_emple:{[Op.regexp]:termino}}
                    ],
                    [Op.not]:{estadoId:estado.id}
                    
                } : {
                    codigo_emple:{[Op.regexp]:'EMP'},
                    [Op.not]:{estadoId:estado.id}
                },

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
        }
        
        else if(coleccion === 'USUARIOS'){
            const adminRol = await Role.findOne({where:{nombre:'Admin'}});
            const rrhhRol = await Role.findOne({where:{nombre:'RRHH'}});
            
            data = await Usuario.findAll({
                where:role === 'Admin' ? {[Op.not]:{empleadoId:null}} : {[Op.not]:{[Op.or]:[{roleId:adminRol.id}, {roleId:rrhhRol.id}, {empleadoId:null}]}},
                attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
                include:[
                    {association:'role'},
                    {association:'estadoUser'},

                    termino ? {association:'empleado', where:{
                        [Op.or]:[
                            {nombre:{[Op.regexp]:termino}},
                            {codigo_emple:{[Op.regexp]:termino}}
                        ],

                    },  attributes:['id', 'nombre', 'codigo_emple', 'foto'], include:[
                        {association:'cargo'},
                        {association:'departamento'},
                    ]} : {association:'empleado',  attributes:['id', 'nombre', 'codigo_emple', 'foto'], include:[
                        {association:'cargo'},
                        {association:'departamento'},
                        {
                            association:'horariosEmple', through:{attributes:[]},
                            attributes:{exclude:['turnoId']},
                            include:[
                                {association:'turno'},
                                {association:'diasSemana', through:{attributes:[]}},
                            ],
                        },
                    ]}
                    
                ]
            });
        }

        else if(coleccion === 'ASISTENCIAS'){
            const estado = await Estado.findOne({where:{nombre:'Inactivo'}});

            data = await Asistencia.findAll({
              where: { fecha: new Date(fecha) },
              attributes:{exclude:['usuarioId', 'empleadoId']},
                include:{
                    association:'usuario',
                    where:{[Op.not]:{empleadoId:null}},
                    attributes:['id'],
                    include:[
                        {association:'role'},
                        {
                            association:'empleado',
                            where: termino
                            ? {
                                [Op.or]: [
                                  { nombre: { [Op.regexp]: termino } },
                                  { codigo_emple: { [Op.regexp]: termino } },
                                ],
                                [Op.not]: { estadoId: estado.id },
                              }
                            : {
                                codigo_emple: { [Op.regexp]: "EMP" },
                                [Op.not]: { estadoId: estado.id },
                              },
                            attributes:['id', 'nombre', 'foto', 'codigo_emple'],
                            include:[
                                {association:'cargo'},
                                {association:'departamento'},
                            ]
                        }
                    ]
                },
            });
        }

        else if(coleccion === 'BENEFICIOSEMPLE'){
            const estado = await Estado.findOne({where:{nombre:'Inactivo'}});

            const empleados = await Empleado.findAll({
                attributes:['id', 'nombre', 'codigo_emple'],
                    where: termino
                  ? {
                      [Op.or]: [
                        { nombre: { [Op.regexp]: termino } },

                        { codigo_emple: { [Op.regexp]: termino } },
                      ],
                      [Op.not]: { estadoId: estado.id },
                    }
                  : {
                      codigo_emple: { [Op.regexp]: "EMP" },
                      [Op.not]: { estadoId: estado.id },
                    },
                include:{
                    where:{beneficiosEmple:{[Op.not]: []}},
                    association:'beneficiosEmple',
                    through:{attributes:[]}
                }
            })
    
            data = empleados.map(e => {
                const{beneficiosEmple, ...values} = e.dataValues;
                return {...values, data:e.beneficiosEmple}
            });
        }

        else if(coleccion === 'PAGOS'){
            const estado = await Estado.findOne({where:{nombre:'Inactivo'}});

            const empleados = await Empleado.findAll({
              attributes: ["id", "nombre", "codigo_emple"],
              where: termino
                ? {
                    [Op.or]: [
                      { nombre: { [Op.regexp]: termino } },
                      { codigo_emple: { [Op.regexp]: termino } },
                    ],
                    [Op.not]: { estadoId: estado.id },
                  }
                : {
                    codigo_emple: { [Op.regexp]: "EMP" },
                    [Op.not]: { estadoId: estado.id },
                  },
              include: {
                where: { empleadoPago: { [Op.not]: [] } },
                association: "empleadoPago",
              },
            });
    
            data = empleados.map(e => {
                const{empleadoPago, ...data} = e.dataValues;
                return{...data, data:e.empleadoPago};
            });
        }

        else if(coleccion === 'NOMINAS'){
            const estado = await Estado.findOne({where:{nombre:'Inactivo'}});
            const[ano, mes] = fecha.split('-');

            data = await Nomina.findAll({
                where:{
                    fecha:{
                        [Op.and]:[
                            sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), ano),
                            sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha')), mes),
                        ]
                    }
                },
                include:[
                    {
                        association:'empleadoNomina', attributes:['id', 'nombre', 'codigo_emple'],
                        where: termino
                        ? {
                            [Op.or]: [
                              { nombre: { [Op.regexp]: termino } },
                              { codigo_emple: { [Op.regexp]: termino } },
                            ],
                            [Op.not]: { estadoId: estado.id },
                          }
                        : {
                            codigo_emple: { [Op.regexp]: "EMP" },
                            [Op.not]: { estadoId: estado.id },
                          },
                    },
                    {association:'nominaDeducciones', attributes:{exclude:['nombre', 'monto', 'tipo']}},
                    {association:'nominaBeneficios', attributes:{exclude:['nombre', 'monto']}},
                    {association:'nominaPagoAdelantado', attributes:{exclude:['nombre', 'monto']}},
                ]
            });
        }
        // Else...

        res.status(200).json({
            data,
            total:data.length
        });

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal al - Hacer la busqueda'
            }
        ])
    }
};



module.exports = {
    paginacion,
    cargarFotoClodinary,
    cargarDocumentosCloudinary,
    deleteFotoOnCloudinary,
    deleteDocsOnCloudinary,
    buscarController,
    eliminarArchivosSinDestino
}