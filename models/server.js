const express = require('express');
const cors = require('cors');
const connection = require('../db/connection');
const fileUpload = require('express-fileupload');


class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT
        this.path = {
            auth:'/api/auth/',
            departamento:'/api/departamento/',
            cargo:'/api/cargo/',
            horario:'/api/horario/',
            empleado:'/api/empleado/',
            usuario:'/api/usuario/',
            ui:'/api/ui/',
            asistencia:'/api/asistencia/',
            empresa:'/api/empresa/',
            deduccione:'/api/deduccione/',
            beneficio:'/api/beneficio/',
            beneficiosEmple:'/api/beneficiosEmple/',
            pagoAdelantado:'/api/pagoAdelantado/',
            nomina:'/api/nomina/',
        }

        this.connectionDB();
        this.middleware();
        this.routes();
    }

    async connectionDB(){
        await connection()
    }

    middleware(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/'
        }));
        
    };

    routes(){
        this.app.use(this.path.auth, require('../routes/auth'));
        this.app.use(this.path.departamento, require('../routes/departamento'));
        this.app.use(this.path.cargo, require('../routes/cargo'));
        this.app.use(this.path.horario, require('../routes/horario'));
        this.app.use(this.path.empleado, require('../routes/empleado'));
        this.app.use(this.path.usuario, require('../routes/usuario'));
        this.app.use(this.path.ui, require('../routes/ui'));
        this.app.use(this.path.asistencia, require('../routes/asistencia'));
        this.app.use(this.path.empresa, require('../routes/empresa'));
        this.app.use(this.path.deduccione, require('../routes/deduccione'));
        this.app.use(this.path.beneficio, require('../routes/beneficio'));
        this.app.use(this.path.beneficiosEmple, require('../routes/beneficiosEmple'));
        this.app.use(this.path.pagoAdelantado, require('../routes/pagoAdelantado'));
        this.app.use(this.path.nomina, require('../routes/nomina'));
    }

    listen(){
        this.app.listen(this.port, () => console.log(`Servidor levantado en el puerto ${this.port}`));
    }
}

module.exports = Server;