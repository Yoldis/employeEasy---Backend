const { request, response } = require("express");
const { format, isAfter, addDays } = require("date-fns");
const esLocale = require("date-fns/locale/es");

const validarHorario = async(req = request, res = response, next) => {
    const usuario = req.usuario;

    try {
        if(usuario?.empleado){

            // Verificar si el usuario - empleado tiene algun horario asignado para entrar al sistema
            if(!usuario.empleado.horariosEmple.length){
                return res.status(400).json([
                    {
                        msg:"El Usuario no tiene horarios asignados para ingresar"
                    }
                ])
            }

            // Verificar si el dia actual conincide con uno de los dias del horario del usuario - empleado
            const diaDeHoy = format(new Date(), "EEEE", {locale: esLocale});
            const quitarAcentos = (str) => {
                return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            };
            
            const diaEsIgual = usuario.empleado.horariosEmple.map(h => h.diasSemana.some(d => quitarAcentos(d.dia).toUpperCase() === quitarAcentos(diaDeHoy).toUpperCase()));

            if(!diaEsIgual.includes(true)){
                return res.status(400).json({
                    msg:"Usuario fuera de horario laboral"
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
                return res.status(400).json([
                    {
                        msg:"Usuario fuera de horario laboral"
                    }
                ])
            }
        }
        
        next();

    } catch (error) {
        console.log(error)
        res.status(500).json([
            {
                msg:'Algo salio mal - Al validar Horario'
            }
        ])
    }
}

module.exports = validarHorario;