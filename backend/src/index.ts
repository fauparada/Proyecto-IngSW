import { db } from './db';
import { reservas } from './db/schema';
import { and, eq, lte, gte, or } from 'drizzle-orm';

console.log("Iniciando el Servidor de Reservas Residenciales...");

Bun.serve({
    port: 4005,
    async fetch(req) {
        const url = new URL(req.url);

        //soporte global para cors
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        //1. Endpoint para crear una reserva digital (IIDS-10)
        if (req.method === "POST" && url.pathname === "/api/reservas") {
            try {
                const body = await req.json();
                const { fecha, hora_inicio, hora_fin, cant_invitados, id_usuario, id_espacio } = body;

                //Validación básica de campos obligatorios
                if (!fecha || !hora_inicio || !hora_fin || !cant_invitados || !id_usuario || !id_espacio) {
                    return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                const reservasConflictivas = await db
                    .select()
                    .from(reservas)
                    .where(
                        and(
                            eq(reservas.fecha, fecha),
                            eq(reservas.id_espacio, Number(id_espacio)),
                            //Lógica de choque de bloques: (InicioNuevo < FinExistente) AND (FinNuevo > InicioExistente)
                            and(
                                lte(reservas.hora_inicio, hora_fin),
                                gte(reservas.hora_fin, hora_inicio)
                            )
                        )
                    );
                //Si la lista tiene elementos, significa que hay tope de horario
                if (reservasConflictivas.length > 0) {
                    return new Response(JSON.stringify({
                        error: "Conflicto de horario: El espacio ya se encuentra reservado en el bloque seleccionado."
                    }), {
                        status: 409, //Código correcto para este caso
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        }
                    });
                }

                //Si no hay conflictos, insertar la reserva en PostgreSQL usando Drizzle
                const nuevaReserva = await db.insert(reservas).values({
                    fecha,
                    hora_inicio,
                    hora_fin,
                    cant_invitados: Number(cant_invitados),
                    id_usuario: Number(id_usuario),
                    id_espacio: Number(id_espacio),
                    estado: "Pendiente" //Estado por defecto según el diseño conceptual
                }).returning();

                //Responder con HTTP 201 Created y los datos de la reserva persistida
                return new Response(JSON.stringify({
                    mensaje: "Reserva creada exitosamente de forma digital",
                    reserva: nuevaReserva[0]
                }), {
                    status: 201,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*" //Habilitamos CORS para que React pueda conectarse
                    }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error interno al procesar la solicitud" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }
        return new Response("Not Found", { status: 404 });
    },
});

console.log("Servidor HTTP escuchando activamente en el puerto 4005");