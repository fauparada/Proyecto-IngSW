import { pgTable, serial, date, time, integer, text } from 'drizzle-orm/pg-core';

//Tabla de Reservas para PostgreSQL
export const reservas = pgTable('reservas', {
    id_reserva: serial('id_reserva').primaryKey(),
    fecha: date('fecha').notNull(),
    hora_inicio: time('hora_inicio').notNull(),
    hora_fin: time('hora_fin').notNull(),
    cant_invitados: integer('cant_invitados').notNull(),
    estado: text('estado').default('Pendiente').notNull(), //Pendiente, Aprobada, Rechazada

    //Llaves foráneas (IDs que conectan c/ otras clases)
    id_usuario: integer('id_usuario').notNull(),
    id_espacio: integer('id_espacio').notNull(),
    nombres_invitados: text('nombres_invitados').array()
});
