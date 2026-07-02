import { pgTable, serial, date, time, integer, text } from 'drizzle-orm/pg-core';

//Tabla para los bloqueos
export const bloqueos = pgTable("bloqueos", {
    id_bloqueo: serial("id_bloqueo").primaryKey(),
    id_espacio: integer("id_espacio").references(() => espaciosComunes.id_espacio).notNull(),
    fecha_inicio: date("fecha_inicio").notNull(),
    fecha_fin: date("fecha_fin").notNull(),
    motivo: text("motivo").notNull() // Criterio 2: Obligatorio
});

//Tabla de espacios del edificio
export const espaciosComunes = pgTable('espacios_comunes', {
    id_espacio: serial('id_espacio').primaryKey(),
    nombre: text('nombre').notNull(),
    capacidad_maxima: integer('capacidad_maxima').default(20).notNull(),
    hora_apertura: time('hora_apertura').default('09:00:00').notNull(),
    hora_cierre: time('hora_cierre').default('23:00:00').notNull(),
    duracion_maxima_horas: integer('duracion_maxima_horas').default(4).notNull(),
});

//Tabla de Reservas para PostgreSQL
export const reservas = pgTable('reservas', {
    id_reserva: serial('id_reserva').primaryKey(),
    fecha: date('fecha').notNull(),
    hora_inicio: time('hora_inicio').notNull(),
    hora_fin: time('hora_fin').notNull(),
    cant_invitados: integer('cant_invitados').notNull(),
    estado: text('estado').default('Pendiente').notNull(), //Pendiente, Aprobada, Rechazada
    nombre_residente: text('nombre_residente').default('Anónimo').notNull(),

    //Llaves foráneas (IDs que conectan c/ otras clases)
    id_usuario: integer('id_usuario').notNull(),
    id_espacio: integer('id_espacio').references(() => espaciosComunes.id_espacio).notNull(),
    nombres_invitados: text('nombres_invitados').array(),

    //nueva columna: guarda la razón por la que el admin. rechazó el bloque
    motivo_rechazo: text('motivo_rechazo'),
});
