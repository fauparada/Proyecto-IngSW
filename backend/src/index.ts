import { db } from './db';
import { espaciosComunes, reservas } from './db/schema';
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

        //1. Endpoint ver disponibilidad (IIDS-17)
        if (req.method === "GET" && url.pathname === "/api/disponibilidad") {
            try {
                //Capturamos los parámetros de la url
                const fecha = url.searchParams.get("fecha");
                const id_espacio = url.searchParams.get("id_espacio");

                if (!fecha || !id_espacio) {
                    return new Response(JSON.stringify({ error: "Faltan parámetros: fecha e  id_espacio son obligatorios" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                //Consultamos a Postgres las reservas existentes para ese día y espacio
                const bloquesOcupados = await db
                    .select({
                        hora_inicio: reservas.hora_inicio,
                        hora_fin: reservas.hora_fin,
                        estado: reservas.estado
                    })
                    .from(reservas) //solo mostramos bloques que no estén rechazados
                    .where(and(eq(reservas.fecha, fecha), eq(reservas.id_espacio, Number(id_espacio)), or(eq(reservas.estado, "Pendiente"), eq(reservas.estado, "Aprobada"))));

                //retornamos la lista de bloques tomados al frontend
                return new Response(JSON.stringify({ bloquesOcupados }), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*" //CORS habilitado
                    }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error al consultar la disponibilidad" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        //2. Endpoint para crear una reserva digital (IIDS-10)
        if (req.method === "POST" && url.pathname === "/api/reservas") {
            try {
                const body = await req.json();
                const { fecha, hora_inicio, hora_fin, cant_invitados, nombres_invitados, id_usuario, id_espacio } = body;

                //Validación básica de campos obligatorios
                if (!fecha || !hora_inicio || !hora_fin || !cant_invitados || !id_usuario || !id_espacio) {
                    return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                //Buscar las reglas del espacio
                const espacioReglas = await db
                    .select()
                    .from(espaciosComunes)
                    .where(eq(espaciosComunes.id_espacio, Number(id_espacio)));

                if (espacioReglas.length === 0) {
                    return new Response(JSON.stringify({ error: "El espacio seleccionado no existe" }), { status: 404 });
                }

                const reglas = espacioReglas[0];

                //Validación aforo máximo
                if(Number(cant_invitados) > reglas.capacidad_maxima) {
                    return new Response(JSON.stringify({
                        error: `Capacidad excedida: El límite máximo para este espacio es de ${reglas.capacidad_maxima} invitados.`
                    }), {
                        status: 400,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                //Validación horario de apertura
                if (hora_inicio < reglas.hora_apertura || hora_fin > reglas.hora_cierre) {
                    return new Response(JSON.stringify({
                        error: `Horario fuera de rango: El espacio opera únicamente entre las ${reglas.hora_apertura.slice(0,5)} y las ${reglas.hora_cierre.slice(0,5)} hrs.`
                    }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
                }

                //Validación duración máxima
                const [hIni, mIni] = hora_inicio.split(':').map(Number);
                const [hFin, mFin] = hora_fin.split(':').map(Number);
                const duracionReserva = (hFin + mFin/60) - (hIni + mIni/60);

                if (duracionReserva > reglas.duracion_maxima_horas) {
                    return new Response(JSON.stringify({
                        error: `Tiempo excedido: La duración máxima permitida por reserva es de ${reglas.duracion_maxima_horas} horas.`
                    }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
                }

                const reservasConflictivas = await db
                    .select()
                    .from(reservas)
                    .where(
                        and(
                            eq(reservas.fecha, fecha),
                            eq(reservas.id_espacio, Number(id_espacio)),
                            or(
                                eq(reservas.estado, "Pendiente"),
                                eq(reservas.estado, "Aprobada")
                            ),
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
                    nombres_invitados: nombres_invitados || [],
                    id_usuario: Number(id_usuario),
                    id_espacio: Number(id_espacio),
                    estado: "Pendiente" //Estado por defecto según el diseño conceptual
                }).returning();

                //Responder con HTTP 201 Created y los datos de la reserva persistida
                return new Response(JSON.stringify({
                    mensaje: "Reserva creada exitosamente.",
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
        

        //3. Endpoint para cancelar reserva
        if (req.method === "POST" && url.pathname === "/api/reservas/cancelar") {
            try {
                const body = await req.json();
                const { id_reserva, id_usuario } = body; //id_usuario es el número de departamento

                if (!id_reserva || !id_usuario) {
                    return new Response(JSON.stringify({ error: "Faltan campos obligatorios: id_reserva e id_usuario."}), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                //Buscar la reserva en PostgreSQL
                const reservaExistente = await db.select().from(reservas).where(eq(reservas.id_reserva, Number(id_reserva)));
                if (reservaExistente.length === 0) {
                    return new Response(JSON.stringify({ error: "La reserva solicitada no existe." }), {
                        status: 404,
                        headers: { "Content_Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                //Validación de seguridad: coincide el depto.?
                if (reservaExistente[0].id_usuario !== Number(id_usuario)) {
                    return new Response(JSON.stringify({
                        error: "Acceso denegado: El número de departamento no coincide con la reserva."
                    }), {
                        status: 403,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                //Restricción de 24 horas antes
                const registro = reservaExistente[0];
                const stringFecha = String(registro.fecha);
                const stringHora = String(registro.hora_inicio).slice(0, 5);

                //objeto de fecha completo en la reserva
                const [anio, mes, dia] = stringFecha.split('-').map(Number);
                const [horas, minutos] = stringHora.split(':').map(Number);
                const momentoReserva = new Date(anio, mes - 1, dia, horas, minutos);
                const momentoActual = new Date();

                //calculamos la diferencia en milisegundos y la pasamos a horas
                const diferenciaMilisegundos = momentoReserva.getTime() - momentoActual.getTime();
                const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);

                console.log(`Datos recuperados de BD -> Fecha: ${stringFecha}, Hora: ${stringHora}`);
                console.log(`Horas de diferencia reales calculadas: ${diferenciaHoras.toFixed(2)}`);

                if (isNaN(diferenciaHoras)) {
                    return new Response(JSON.stringify({ error: "Error de consistencia de tiempos en el servidor." }), {
                        status: 500,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                if (diferenciaHoras < 24) {
                    return new Response(JSON.stringify({
                        error: "Restricción de tiempo: No es posible cancelar una reserva si faltan menos de 24 horas para el evento."
                    }), {
                        status: 400,
                        headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
                    });
                }

                //Eliminación, actualizar estado a 'Cancelada'
                await db.update(reservas).set({ estado: "Cancelada" }).where(eq(reservas.id_reserva, Number(id_reserva)));
                return new Response(JSON.stringify({ mensaje: "La reserva ha sido cancelada con éxito." }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error interno al procesar la cancelación" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        //4. endpoint para obtener reservas pendientes (admin)
        if (req.method === "GET" && url.pathname === "/api/admin/pendientes") {
            try {
                const listaPendientes = await db.select().from(reservas).where(eq(reservas.estado, "Pendiente"));

                return new Response(JSON.stringify({ reservas: listaPendientes }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });

            } catch (error) {
                return new Response(JSON.stringify({ error: "Error al traer solicitudes pendientes" }), { status: 500 });
            }
        }

        //5. endpoint para aprobar o rechazar reserva
        if (req.method === "POST" && url.pathname === "/api/reservas/modificar-estado") {
            try {
                const body = await req.json();
                const { id_reserva, nuevo_estado, motivo_rechazo } = body;

                if (!id_reserva || !nuevo_estado) {
                    return new Response(JSON.stringify({ error: "Faltan parámetros" }), { status: 400 });
                }

                //motivo obligatorio en caso de rechazo
                if (nuevo_estado === "Rechazada" && (!motivo_rechazo || motivo_rechazo.trim() === "")) {
                    return new Response(JSON.stringify({
                        error: "Validación denegada: Es obligatorio indicar un motivo para rehazar la reserva."
                    }), {
                        status: 400,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                //actualizamos la reserva
                await db.update(reservas).set({
                    estado: nuevo_estado,
                    motivo_rechazo: nuevo_estado == "Rechazada" ? motivo_rechazo : null
                }).where(eq(reservas.id_reserva, Number(id_reserva)));

                return new Response(JSON.stringify({
                    mensaje: `La reserva ha sido ${nuevo_estado.toLowerCase()} con éxito.`
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error interno al procesar la decisión." }), { status: 500 });
            }
        }

        //6. endpoint para vista diaria del conserje
        if (req.method === "GET" && url.pathname === "/api/conserje/reservas") {
            try {
                const fecha = url.searchParams.get("fecha");

                if (!fecha) {
                    return new Response(JSON.stringify({ error: "La fecha es obligatoria" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                //consultamos las reservas del día que no estén canceladas
                const reservasDelDia = await db
                    .select({
                        id_reserva: reservas.id_reserva,
                        hora_inicio: reservas.hora_inicio,
                        hora_fin: reservas.hora_fin,
                        departamento: reservas.id_usuario,
                        nombre: reservas.nombre_residente,
                        estado: reservas.estado,
                        invitados: reservas.cant_invitados
                    })
                    .from(reservas)
                    .where(
                        and(
                            eq(reservas.fecha, fecha),
                            or(
                                eq(reservas.estado, "Pendiente"),
                                eq(reservas.estado, "Aprobada")
                            )
                        )
                    );
                return new Response(JSON.stringify({ reservas: reservasDelDia }), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error al obtener la vista del conserje" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        } 

        //endpoint para obtener todos los espacios comunes
        if (req.method === "GET" && url.pathname === "/api/espacios") {
            try {
                const todosLosEspacios = await  db.select().from(espaciosComunes);
                return new Response(JSON.stringify({ espacios: todosLosEspacios }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error al listar espacios" }), { status: 500 });
            }
        }

        //endpoint para crear un nuevo espacio (vista conserje)
        if (req.method === "POST" && url.pathname === "/api/espacios") {
            try {
                const body = await req.json();
                const { nombre, capacidad_maxima } = body;

                if (!nombre) {
                    return new Response(JSON.stringify({ error: "El nombre del espacio es requerido" }), { status: 400 });
                }

                const nuevoEspacio = await db.insert(espaciosComunes).values({
                    nombre,
                    capacidad_maxima: capacidad_maxima ? Number(capacidad_maxima) : 20
                }).returning();

                return new Response(JSON.stringify({ mensaje: "Espacio creado con éxito", espacio: nuevoEspacio[0] }), {
                    status: 201,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error al crear espacio común" }), { status: 500 });
            }
        }

        //endpoint para actualizar reglas
        if (req.method === "POST" && url.pathname === "/api/espacios/configurar") {
            try {
                const body = await req.json();
                const { id_espacio, hora_apertura, hora_cierre, capacidad_maxima, duracion_maxima_horas } = body;

                if (!id_espacio) {
                    return new Response(JSON.stringify({ error: "El ID del espacio es obligatorio." }), { status: 400 });
                }

                await db
                    .update(espaciosComunes)
                    .set({
                        hora_apertura,
                        hora_cierre,
                        capacidad_maxima: Number(capacidad_maxima),
                        duracion_maxima_horas: Number(duracion_maxima_horas)
                    })
                    .where(eq(espaciosComunes.id_espacio, Number(id_espacio)));
                
                return new Response(JSON.stringify({ mensaje: "Reglas de la sala actualizadas con éxito." }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error al actualizar las reglas." }), { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log("Servidor HTTP escuchando activamente en el puerto 4005");