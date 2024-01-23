const { request, response } = require("express");
const jwt = require("jsonwebtoken");
const { Usuario, Role } = require("../models");


const validarToken = async(req = request, res = response, next) => {

    const {token} = req.headers;
    if(!token){
        return res.status(400).json([
            {
                msg:'La sesión expiro'
            }
        ])
    }

    try {
        const existeRol = await Usuario.findOne({include:{
            association:'role',
            where:{nombre:'Admin'}
        }});
        if(!existeRol){
            return res.status(400).json([
                {
                    msg:'La sesión expiro'
                }
            ])
        }

        const {id} = jwt.verify(token, process.env.SECRET_TOKEN);
        const usuario = await Usuario.findByPk(id, {
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
        });

        if(!usuario){
            return res.status(400).json([
                {
                    msg:'El usuario no existe'
                }
            ])
        }

        req.usuario = usuario;
        next();

    } catch (error) {
        res.status(500).json([
            {
                msg:'La sesión expiro'
            }
        ])
    }
};

module.exports = validarToken;