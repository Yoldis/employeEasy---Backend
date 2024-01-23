const jwt = require('jsonwebtoken');


const generarToken = (id) => {

    return new Promise( (resolve, reject) => {
        try {
            const token = jwt.sign({id}, process.env.SECRET_TOKEN, {expiresIn:'2h'});
            resolve(token);
        } catch (error) {
            console.log(error);
            reject('Algo salio mal con el token');
        }
        
    })

};

module.exports = generarToken;