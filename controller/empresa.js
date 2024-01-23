const { request, response } = require("express");
const { Empresa } = require("../models");


const registerEmpresaOrUpdate = async(req = request, res = response) => {

    const{id, logo, nombre, contacto, direccion, identificacion, descripcion} = req.body;
    let empresa = {};

    try {
        const existeEmpresa = await Empresa.findByPk(id);
        if(existeEmpresa){
            await Empresa.update({logo, nombre, contacto, direccion, identificacion, descripcion}, {where:{id}});
            empresa = await Empresa.findOne({where:{nombre}});
        }
        else {
            empresa = await Empresa.create({logo, nombre, contacto, direccion, identificacion, descripcion});
        }

        res.status(200).json({
            data:empresa,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
          {
            msg: "Algo salio mal al - Registrar empresa",
          },
        ]);
    }
};

const obtenerEmpresaData = async(req = request, res = response) => {

    try {
        const empresa = await Empresa.findAll();
        const data = empresa[0];

        res.status(200).json({
            data
        });

    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Obtener empresas'
            }
        ])
    }
};

module.exports = {
    registerEmpresaOrUpdate,
    obtenerEmpresaData
}