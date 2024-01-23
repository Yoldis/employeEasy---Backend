const { isValid } = require("date-fns");
const { Usuario, Role, DiaSemana, Empleado } = require("../models");


const existeRol = async(id) => {
    
    const rol = await Role.findByPk(id);
        if(!rol){
            throw new Error('El rol no existe')
        }
    
        return true;
};

const existeUsuario = async(id) => {

    const usuario = await Usuario.findOne({where:{empleadoId:id}});
        if(usuario){
            throw new Error('El usuario ya esta registrado')
        }

        return true;
}

const existeEmpleado = async(id) => {

    const empleado = await Empleado.findByPk(id);
        if(!empleado){
            throw new Error('El empleado no existe')
        }

        return true;
}


const existeDias = async(dias = []) => {
    if(dias.length === 0){
        throw new Error('Los dias de semana son obligatorios');
    }

    for (const id of dias) {
        const existeDia = await DiaSemana.findOne({where:{id}});
        if(!existeDia){
            throw new Error(`El dia no existe`);
        }
    }

    return true;
};


const validarFecha = (fecha) => {
    const date = new Date(`${fecha}`);
    const esValido = isValid(date);
    if(!esValido){
        throw new Error('La fecha no es valida');
    }

    return true;
};


const validarColeccion = (coleccion) => {
    const colecciones = ['DEPARTAMENTOS', 'CARGOS', 'HORARIOS', 'EMPLEADOS', 'USUARIOS', 'ASISTENCIAS', 'DEDUCCIONES', 'BENEFICIOS', 'BENEFICIOSEMPLE', 'PAGOS', 'NOMINAS'];
    coleccion = coleccion.split('').map(c => c.toUpperCase()).join('');
    
    if(!colecciones.includes(coleccion)){
        throw new Error(`La coleccion no existe, deben ser ${colecciones}`);
    }

    return true;
}

module.exports = {
    existeRol,
    existeUsuario,
    existeEmpleado,
    existeDias,
    validarFecha,
    validarColeccion
}