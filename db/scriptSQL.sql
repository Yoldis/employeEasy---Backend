-- insert into roles (nombre) values ('Admin'), ('RRHH'), ('Gerente'), ('Empleado');
-- insert into usuarios (email, password) VALUES ('adminPrincipal@gmail.com', ('123123'));


-- insert into generos (nombre) values ('Masculino'), ('Femenino');

-- insert into estadocivils (nombre) values ('Soltero'), ('Casado'), ('Divorciado'), ('Viudo');

-- insert into estados (nombre) values ('Activo'), ('Inactivo'), ('Suspendido'), ('Vacaciones'), ('Licencia');

-- insert into tipoidentificacions (nombre) values ('Cedula'), ('Pasaporte');

-- insert into tipocuenta (nombre) values ('Cuenta Corriente'), ('Cuenta Ahorro');

-- insert into tipocontratos (nombre) values ('Indefinido'), ('Temporal');

-- insert into diasemanas (dia) values ('Lunes'), ('Martes'), ('Miercoles'), ('Jueves'), ('Viernes'), ('Sabado'), ('Domingo');
-- insert into turnos (nombre) values ('Diurno'), ('Nocturno'), ('Mixto');

-- insert into departamentos (nombre) values ('Mantenimiento'), ("Tecnologias");
-- insert into cargos (nombre) values ("Gerente"), ("Supervisor");

select * from nominas;
-- delete from usuarios where id = 12;

-- delete from nominas where id between 89 and 94;
-- update usuarios set estadoId = 1 where id = 1;
-- update empleados set estadoId = 3 where id in  (2,5);
-- truncate table asistencia;