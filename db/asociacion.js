const { Usuario, Role, DiaSemana, Horario, HorarioDia, Direccion, Empleado, Emergencia, Laboral, Departamento, Cargo, HorarioEmple, Bancaria, Documento, Historial, Genero, EstadoCivil, Estado, TipoIdentificacion, TipoCuenta, TipoContrato, Turno, Asistencia, Beneficio, PagoAdelantado, Deduccione, Nomina, BeneficioEmple, NominaDeduccione, NominaBeneficio, NominaPagoAdelantado } = require("../models/index");

// USUARIOS
// Relacion uno a muchos - Role con Usuario
Role.hasMany(Usuario, {foreignKey: "roleId", as:'role'});
Usuario.belongsTo(Role, {foreignKey: "roleId", as:'role'});


// Relalcion uno a muchos - Estado con Usuario
Estado.hasMany(Usuario, {foreignKey:'estadoId', as:'estadoUser'});
Usuario.belongsTo(Estado, {foreignKey:'estadoId', as:'estadoUser'});


// Relacion uno a uno - Empleado con Usuario
Empleado.hasOne(Usuario, {foreignKey:'empleadoId', as:'empleado', onDelete:'CASCADE'});
Usuario.belongsTo(Empleado, {foreignKey:'empleadoId', as:'empleado', onDelete:'CASCADE'});


// Relacion uno a muchos - Usuario con Asistencia
Usuario.hasMany(Asistencia, {foreignKey:'usuarioId', as:'usuario', onDelete:'CASCADE'});
Asistencia.belongsTo(Usuario, {foreignKey:'usuarioId', as:'usuario', onDelete:'CASCADE'});



// HORARIO
// Relacion uno a muchos con Horario y Turno
Turno.hasOne(Horario, {as:'turno', foreignKey:'turnoId'});
Horario.belongsTo(Turno, {as:'turno', foreignKey:'turnoId'});

// Relacion muchos a muchos con Horario y Dia
Horario.belongsToMany(DiaSemana, { through: HorarioDia, as:'diasSemana' });
DiaSemana.belongsToMany(Horario, { through: HorarioDia, as:'diasSemana' });



// EMPLEADO
// Relacion uno a uno con Empleado y Direccion
Empleado.hasOne(Direccion, {as:'direccion', foreignKey:'empleadoId', onDelete:'CASCADE'});
Direccion.belongsTo(Empleado, {as:'direccion', foreignKey:'empleadoId', onDelete:'CASCADE'});


// Relacion uno a uno con Empleado y Emergencia
Empleado.hasOne(Emergencia, {as:'emergencia', foreignKey:'empleadoId', onDelete:'CASCADE'});
Emergencia.belongsTo(Empleado, {as:'emergencia', foreignKey:'empleadoId', onDelete:'CASCADE'});


// Relacion uno a uno con Empleado y Laboral
Empleado.hasOne(Laboral, {as:'laboral', foreignKey:'empleadoId', onDelete:'CASCADE'});
Laboral.belongsTo(Empleado, {as:'laboral', foreignKey:'empleadoId', onDelete:'CASCADE'});


// Relacion uno a muchos con Empleado y Horario
Horario.belongsToMany(Empleado, {through:HorarioEmple, as:'horariosEmple'});
Empleado.belongsToMany(Horario, {through:HorarioEmple, as:'horariosEmple'});


// Relacion uno a uno con Empleado y Bancaria
Empleado.hasOne(Bancaria, {as:'bancaria', foreignKey:'empleadoId', onDelete:'CASCADE'});
Bancaria.belongsTo(Empleado, {as:'bancaria', foreignKey:'empleadoId', onDelete:'CASCADE'});


// Relacion uno a muchos con Empleado y Documento
Empleado.hasMany(Documento, {as:'documentos', foreignKey:'empleadoId', onDelete:'CASCADE'});
Documento.belongsTo(Empleado, {as:'documentos', foreignKey:'empleadoId', onDelete:'CASCADE'});


// Relacion uno a uno con Empleado y Historial
Empleado.hasOne(Historial, {as:'historial', foreignKey:'empleadoId', onDelete:'CASCADE'});
Historial.belongsTo(Empleado, {as:'historial', foreignKey:'empleadoId', onDelete:'CASCADE'});


// Relacion uno a muchos con Genero y Empleado
Genero.hasMany(Empleado, {as:'genero', foreignKey:'generoId'});
Empleado.belongsTo(Genero, {as:'genero', foreignKey:'generoId'});


// Relacion uno a muchos con Estado Civil y Empleado
EstadoCivil.hasMany(Empleado, {as:'estadoCivil', foreignKey:'estadoCivilId'});
Empleado.belongsTo(EstadoCivil, {as:'estadoCivil', foreignKey:'estadoCivilId'});


// Relacion uno a muchos con Estado y Empleado
Estado.hasMany(Empleado, {as:'estado', foreignKey:'estadoId'});
Empleado.belongsTo(Estado, {as:'estado', foreignKey:'estadoId'});


// Relacion uno a muchos con Tipo Identificacion y Empleado
TipoIdentificacion.hasMany(Empleado, {as:'tipoIdentificacion', foreignKey:'tipoIdentificacionId'});
Empleado.belongsTo(TipoIdentificacion, {as:'tipoIdentificacion', foreignKey:'tipoIdentificacionId'});


// Relacion uno a muchos con Tipo Cuenta y Empleado
TipoCuenta.hasMany(Bancaria, {as:'tipoCuenta', foreignKey:'tipoCuentaId'});
Bancaria.belongsTo(TipoCuenta, {as:'tipoCuenta', foreignKey:'tipoCuentaId'});


// Relacion uno a muchos con Tipo Contrato y Laboral
TipoContrato.hasMany(Laboral, {as:'tipoContrato', foreignKey:'tipoContratoId'});
Laboral.belongsTo(TipoContrato, {as:'tipoContrato', foreignKey:'tipoContratoId'});


// Relacion uno a muchos con Empleado y Departamento
Departamento.hasMany(Empleado, {foreignKey:'departamentoId', as:'departamento'});
Empleado.belongsTo(Departamento, {foreignKey:'departamentoId', as:'departamento'});


// Relacion uno a muchos con Empleado y Cargo
Cargo.hasMany(Empleado, {as:'cargo', foreignKey:'cargoId'});
Empleado.belongsTo(Cargo, {as:'cargo', foreignKey:'cargoId'});


// NOMINA
// Relacion muchos a muchos entre Beneficio y Empleado
Beneficio.belongsToMany(Empleado, {through:BeneficioEmple, as:'beneficiosEmple'});
Empleado.belongsToMany(Beneficio, {through:BeneficioEmple, as:'beneficiosEmple'});


// Relacion muchos a muchos entre Nomina y Deduccione
Nomina.belongsToMany(Deduccione, {through:NominaDeduccione, as:'nominaDeducciones'});
Deduccione.belongsToMany(Nomina, {through:NominaDeduccione, as:'nominaDeducciones'});


// Relacion muchos a muchos entre Nomina y Beneficio
Nomina.belongsToMany(Beneficio, {through:NominaBeneficio, as:'nominaBeneficios'});
Beneficio.belongsToMany(Nomina, {through:NominaBeneficio, as:'nominaBeneficios'});

// Relacion muchos a muchos entre Nomina y PagoAdelantado
Nomina.belongsToMany(PagoAdelantado, {through:NominaPagoAdelantado, as:'nominaPagoAdelantado'});
PagoAdelantado.belongsToMany(Nomina, {through:NominaPagoAdelantado, as:'nominaPagoAdelantado'});


// Relacion uno a muchos entre Empleado y PagoAdelantado
Empleado.hasMany(PagoAdelantado, {foreignKey:'empleadoId', as:'empleadoPago', onDelete:'CASCADE'});
PagoAdelantado.belongsTo(Empleado, {foreignKey:'empleadoId', as:'empleadoPago', onDelete:'CASCADE'});


// Relacion uno a muchos entre Empleado y Nomina
Empleado.hasMany(Nomina, {foreignKey:'empleadoId', as:'empleadoNomina', onDelete:'CASCADE'});
Nomina.belongsTo(Empleado, {foreignKey:'empleadoId', as:'empleadoNomina', onDelete:'CASCADE'});

