const { request, response } = require("express");
const bcrypt = require('bcrypt');
const { Usuario, Empleado, Role, Estado } = require("../models");
const { Op } = require("sequelize");


const registerUsuario = async(req = request, res = response) => {

    const{roleId, empleadoId, password} = req.body;

    try {
        const empleado = await Empleado.findByPk(empleadoId);
        const [, codigo1, codigo2] = empleado.codigo_emple.split('-');

        const email = 'employeEasy' + codigo1 + "-" + codigo2 + '@gmail.com'
        const salt = bcrypt.genSaltSync();
        const passwordHash = bcrypt.hashSync(password, salt);
        
        const estado = await Estado.findOne({where:{nombre:'Activo'}});

        await Usuario.create({email, password:passwordHash, roleId, empleadoId, estadoId:estado.id});

        const usuario = await Usuario.findOne({where:{empleadoId},
            include:[
                {association:'role'},
                {association:'estadoUser'},
                {association:'empleado', attributes:['id','nombre', 'codigo_emple'], include:[
                    {association:'cargo'},
                    {association:'departamento'},
                ]},
            ], attributes:{exclude:['roleId', 'estadoId', 'empleadoId']}});
        const total = await Usuario.count({
            where:{empleadoId:{[Op.not]:null}}
        });

        res.status(200).json({
            data:usuario,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:'Algo salio mal al - Registrar usuario'
        });
    }
};


const obtenerUsuarios = async(req = request, res = response) => {
    const {limit, role} = req.query;
    
    try {
        const adminRol = await Role.findOne({where:{nombre:'Admin'}});
        const rrhhRol = await Role.findOne({where:{nombre:'RRHH'}});
        const {count, rows} = await Usuario.findAndCountAll({
            where:role === 'Admin' ? {[Op.not]:{empleadoId:null}} : {[Op.not]:{[Op.or]:[{roleId:adminRol.id}, {roleId:rrhhRol.id}, {empleadoId:null}]}},
            limit:Number(limit),
            attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
            include:[
                {association:'role'},
                {association:'estadoUser'},
                {association:'empleado', attributes:['id', 'nombre', 'codigo_emple', 'foto'], include:[
                    {association:'cargo'},
                    {association:'departamento'},
                ]},
            ]
        });

        const usuarios = await Usuario.findAll({
            where:{[Op.not]:{empleadoId:null}},
            attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
            include:[
                {association:'role'},
                {association:'estadoUser'},
                {association:'empleado', attributes:['id', 'nombre', 'codigo_emple', 'foto'], include:[
                    {association:'cargo'},
                    {association:'departamento'},
                ]},
            ]
        });

        res.status(200).json({
            data:usuarios,
            total:count,
            usuariosPag:rows
        })

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal - Obtener usuarios'
            }
        ]);
    }
}


const updateUser = async(req = request, res = response) => {
    const {id} = req.params;
    const{roleId, estadoId, empleadoId, password} = req.body;

    try {
        const usuario = await Usuario.findByPk(id);
        if(!usuario){
            return res.status(400).json([
                {
                    msg:'El usuario no existe'
                }
            ])
        }

        if(password.length <= 13){
            const hash = bcrypt.hashSync(password, 10);
            await Usuario.update({password:hash, cambioPassword:false}, {where:{id}});
        }
        
        await Promise.all([
            Usuario.update({roleId, estadoId}, {where:{id}}),
            Empleado.update({estadoId}, {where:{id:empleadoId}}),
        ]);

        const usuarioUpdate = await Usuario.findOne({
            where:{id},
            attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
            include:[
                {association:'role'},
                {association:'estadoUser'},
                {association:'empleado', attributes:['id', 'nombre', 'codigo_emple', 'foto'], include:[
                    {association:'cargo'},
                    {association:'departamento'},
                ]},
            ]
        });

        res.status(200).json({
            data:usuarioUpdate
        });
    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al -Obtener password'
            }
        ])
    }
};


const getRoles = async(req = request, res = response) => {
    const{role} = req.query;

    try {
        const roles = await Role.findAll({
            where:role === 'Admin' ? null : {[Op.not]:{[Op.or]:[{nombre:'Admin'}, {nombre:'RRHH'}]}}
        });

        res.status(200).json({
            data:roles
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal - Al obtener roles'
            }
        ])
    }
};


module.exports = {
    registerUsuario,
    obtenerUsuarios,
    updateUser,
    getRoles
}
