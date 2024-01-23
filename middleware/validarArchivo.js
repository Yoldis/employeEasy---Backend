const { request, response } = require("express");


const validarArchivo = (req = request, res = response, next) => {

    const filesPermitted = ['FOTO', 'DOCUMENTOS'];

    const file = Object.keys(req.files || {}).map(file => file.toUpperCase()).some(file => filesPermitted.includes(file));
    
    if(!req.files || !file){
        return res.status(400).json([
            {
                msg:'No hay archivo en la peticion, debe ser uno de estos:' + " " + filesPermitted
            }
        ])
    }

    next();
}

module.exports = validarArchivo;