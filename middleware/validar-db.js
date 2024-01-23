const { request, response } = require("express");
const { Usuario, Role, Departamento, Cargo, Horario } = require("../models");


const noExisteUsuario = async(req = request, res = response, next) => {
    const{email} = req.body;

    const usuario = await Usuario.findOne({
        where:{ email },
        attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
            include:[
                {association:'role'},
                {association:'estadoUser'},
                {association:'empleado', attributes:['id', 'nombre', 'codigo_emple', 'email', 'telefono', 'foto'], include:[
                    {association:'cargo'},
                    {association:'departamento'},
                    {association:'direccion'},
                    {association:'horariosEmple', through:{attributes:[]}, 
                    attributes:{exclude:['turnoId']},
                    include:[
                        {association:'turno'},
                        {association:'diasSemana', through:{attributes:[]}},
                    ]},
                ]},
            ]
    })

    if(!usuario){
        return res.status(401).json({
            msg:'El usuario no existe.'
        })
    }

    req.usuario = usuario;
    
    next();
};


const isAdminOrRrhh = async(req = request, res = response, next) => {

    const roles = ['Admin', 'RRHH']
    const usuario = req.usuario;
    if(!roles.includes(usuario.role.nombre)){
        return res.status(401).json({
            msg:'Acceso denegado'
        })
    }

    next();
};


const isAdmin = async(req = request, res = response, next) => {

    const roles = ['Admin']
    const usuario = req.usuario;
    if(!roles.includes(usuario.role.nombre)){
        return res.status(401).json([
            {
                msg:'Acceso denegado'
            }
        ])
    }

    next();
};


const eXisDepartCargoHorario = async(req = request, res = response, next) => {
    try {
        const{departamentoId, cargoId, horariosEmple = []} = req.body;

        let [departamento, cargo, horario] = await Promise.all([
            Departamento.findAll(),
            Cargo.findAll(),
            Horario.findAll(),
        ]);

        if(!departamento.length){
            return res.status(401).json([
              {
                msg: "No hay departamentos registrados",
              },
            ]);
        }
        
        if(!cargo.length) {
            return res.status(401).json([
              {
                msg: "No hay cargos registrados",
              },
            ]);
        }
        
        horario = horario.map(h => h.id);
        const esIgualHorario = horariosEmple.every(h => {
            return horario.includes(Number(h));
        });

        if(!esIgualHorario) {
            return res.status(401).json([
              {
                msg: "No hay horarios registrados",
              },
            ]);
        }
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal - Al verificar si existe Dep. Carg. Horar.'
            }
        ])
    }
}


module.exports = {
    noExisteUsuario,
    isAdminOrRrhh,
    isAdmin,
    eXisDepartCargoHorario
}