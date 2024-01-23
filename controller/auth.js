const { request, response } = require("express");
const bcrypt = require('bcrypt');
const { Usuario, Role, Genero, EstadoCivil, Estado, TipoIdentificacion, TipoCuenta, TipoContrato, DiaSemana, Turno, Empleado, Direccion, ArchivoTemporal, Asistencia } = require("../models");
const generarToken = require("../helpers/generarToken");
const { format, isEqual, isAfter, addDays } = require("date-fns");
const esLocale = require("date-fns/locale/es");


const loginController = async(req = request, res = response) => {

    const{password} = req.body;
    const usuario = req.usuario;

    try {
        
        if(usuario?.estadoUser?.nombre === 'Inactivo'){
            return res.status(400).json({
                msg:"Usuario Inactivo - Por favor hablar con el Administrador"
            })
        }

        if(usuario.empleado){

            // Verificar si el usuario - empleado tiene algun horario asignado para entrar al sistema
            if(!usuario.empleado.horariosEmple.length){
                return res.status(400).json({
                    msg:"El Usuario no tiene horarios asignados para ingresar"
                })
            }

            // Verificar si el dia actual conincide con uno de los dias del horario del usuario - empleado
            const diaDeHoy = format(new Date(), "iiii", {locale: esLocale});
            const quitarAcentos = (str) => {
                return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            };
            
            const diaEsIgual = usuario.empleado.horariosEmple.map(h => h.diasSemana.some(d => quitarAcentos(d.dia).toUpperCase() === quitarAcentos(diaDeHoy).toUpperCase()));

            if(!diaEsIgual.includes(true)){
                return res.status(400).json({
                    msg:"Usuario Fuera de Horario Laboral"
                })
            }

            // Verificar que la hora actual este en el rango de hora del horario del usuario - empleado
            const horaEnRango = usuario.empleado.horariosEmple.map(h => h.diasSemana.some(d => {
                if(quitarAcentos(d.dia.toUpperCase()) === quitarAcentos(diaDeHoy.toUpperCase())){
                    const [horaEntrada, minutosEntrada] = h.hora_entrada.split(':');
                    const [horaSalida, minutosSalida] = h.hora_salida.split(':');

                    const verificarHoraEntrada = isAfter(new Date(`${format(new Date(), 'yyyy-MM-dd')} ${horaEntrada}:${minutosEntrada}`), +horaEntrada > +horaSalida ? addDays(new Date(), 1) : new Date());

                    const verificarHoraSalida = isAfter(new Date(), new Date(`${format(new Date(), 'yyyy-MM-dd')} ${horaSalida}:${minutosSalida}`));
    
                    return !verificarHoraEntrada && !verificarHoraSalida;
                }
            }));

            if(!horaEnRango.includes(true)){
                return res.status(400).json({
                    msg:"Usuario Fuera de Horario Laboral"
                })
            }
        }
        

        // Verificar el password que sea correcto
        const verifyPassword = bcrypt.compareSync(password, usuario.password);
        if(!verifyPassword){
            return res.status(400).json({
                msg:'Credenciales incorrectas'
            })
        }

        const token = await generarToken(usuario.id);

        // Registrar la hora de entrada del usuario y la fecha en el sistema
        const fechaActual = format(new Date(), 'yyyy-MM-dd', {locale:esLocale});
        const horaActual = format(new Date(), 'HH:mm:ss', {locale:esLocale});
        const asistenciaHoy = await Asistencia.findOne({where:{usuarioId:usuario.id, fecha:new Date(fechaActual)}});
        const fechasIguales = isEqual(new Date(asistenciaHoy?.fecha), new Date(fechaActual));
        
        if(asistenciaHoy && fechasIguales){
            await Asistencia.update({horaUltimaVezIniciado:horaActual}, {where:{usuarioId:usuario.id, fecha:new Date(fechaActual)}});
        }
        else await Asistencia.create({horaIncioSesion:horaActual, horaUltimaVezIniciado:horaActual, fecha:fechaActual, usuarioId:usuario.id});

        const asistencia = await Asistencia.findOne({where:{usuarioId:usuario.id, fecha:new Date(fechaActual)}});
        
        res.status(200).json({
            data:usuario,
            asistencia,
            token
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al - Iniciar sesion'
        })
    }
}


const tokenController = async(req = request, res = response) => {
    const usuario = req.usuario;
    
    try {
        const fechaActual = format(new Date(), 'yyyy-MM-dd', {locale:esLocale});
        const asistencia = await Asistencia.findOne({where:{usuarioId:usuario.id, fecha:new Date(fechaActual)}});

        res.status(200).json({
            data:usuario,
            asistencia
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal - TokenController'
        })
    }
};


const updateProcfile = async(req = request, res = response) => {
    const{foto, userId, empleadoId, email, telefono, provincia, municipio, sector, calle, num_residencia} = req.body;

    try {
        await Promise.all([
            Usuario.update({foto}, {where:{id:userId}}),
            Empleado.update({email, telefono}, {where:{id:empleadoId}}),
            Direccion.update({provincia, municipio, sector, calle, num_residencia:num_residencia || null}, {where:{empleadoId}}),
        ]);

        const usuario = await Usuario.findByPk(userId, {
            attributes:{exclude:['roleId', 'estadoId', 'empleadoId']},
            include:[
                {association:'role'},
                {association:'estadoUser'},
                {association:'empleado', attributes:['id', 'nombre', 'codigo_emple', 'email', 'telefono', 'foto'], include:[
                    {association:'cargo'},
                    {association:'departamento'},
                    {association:'direccion'},
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

        res.status(200).json({
            data:usuario
        })

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:"Algo salio mal al - Actualizar Perfil"
            }
        ])
    }
};


const cambioPassowrd = async(req = request, res = response) => {
    const{id} = req.params;
    const{password} = req.body;

    try {
        const hashPassword = bcrypt.hashSync(password, 10);
        await Usuario.update({password:hashPassword, cambioPassword:true}, {where:{id}});

        res.status(200).json({
            msg:'Contrasena cambiada con exito!'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json([
            {
                msg:'Algo salio mal al - Cambiar la contrasena'
            }
        ])
    }
}

const registerAdmin = async(req = request, res = response) => {

    const roles = [{nombre:'Admin'}, {nombre:'RRHH'}, {nombre:'Gerente'}, {nombre:'Empleado'},];
    const generos = [{nombre:'Masculino'}, {nombre:'Femenino'}];
    const estadoCivil = [{nombre:'Soltero'}, {nombre:'Casado'}, {nombre:'Divorciado'}, {nombre:'Viudo'},];
    const estados = [{nombre:'Activo'}, {nombre:'Inactivo'}, {nombre:'Suspendido'}, {nombre:'Vacaciones'}, {nombre:'Licencia'},];
    const tipoIdentif = [{nombre:'Cedula'}, {nombre:'Pasaporte'}];
    const tipoCuenta = [{nombre:'Cuenta Corriente'}, {nombre:'Cuenta Ahorro'}];
    const tipoContrato = [{nombre:'Indefinido'}, {nombre:'Temporal'}];

    const dias = [{dia:'Lunes'}, {dia:'Martes'}, {dia:'Miércoles'}, {dia:'Jueves'}, {dia:'Viernes'},{dia:'Sábado'}, {dia:'Domingo'},];
    const turnos = [{nombre:'Diurno'}, {nombre:'Nocturno'}, {nombre:'Mixto'}];


    try {
        const existeAdmin = await Usuario.findOne({
            include:{
                association:'role',
                where:{
                    nombre:"Admin"
                }
            }
        });
        

        if(existeAdmin){
            console.log('existe')
            return;
        };

        const promesasCreacion = [
            ...roles.map(rol => Role.create(rol)),
            ...generos.map(genero => Genero.create(genero)),
            ...estadoCivil.map(estadoCivil => EstadoCivil.create(estadoCivil)),
            ...estados.map(estado => Estado.create(estado)),
            ...tipoIdentif.map(tipoIdentif => TipoIdentificacion.create(tipoIdentif)),
            ...tipoCuenta.map(tipoCuenta => TipoCuenta.create(tipoCuenta)),
            ...tipoContrato.map(tipoContrato => TipoContrato.create(tipoContrato)),
            ...dias.map(dia => DiaSemana.create(dia)),
            ...turnos.map(turno => Turno.create(turno)),
        ];
        
        await Promise.all(promesasCreacion);

        const role = await Role.findOne({where:{nombre:'Admin'}});
        const estado = await Estado.findOne({where:{nombre:'Activo'}});
        const salt = bcrypt.genSaltSync();
        const admin = {
            email:'adminPrincipal@gmail.com',
            password:bcrypt.hashSync('123123', salt),
            roleId:role.id,
            estadoId:estado.id
        }

        await Usuario.create(admin),
        res.status(200).json({
            msg:'Adminstrador registrado'
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:'Algo salio mal al crear - Administrador'
        })
    }
}

module.exports = {
    loginController,
    tokenController,
    updateProcfile,
    cambioPassowrd,
    registerAdmin
}
