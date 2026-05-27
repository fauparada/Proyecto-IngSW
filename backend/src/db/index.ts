import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

//Validamos que exista la variable de entorno
if (!process.env.DATABASE_URL) {
    throw new Error('La variable de entorno DATABASE_URL no está configurada');
}

//Configuramos el cliente nativo de Postgres
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

//Nos conectamos de forma asíncrona
await client.connect();

//Inicializamos Drizzle pasando el cliente y el esquema conceptual
export const db = drizzle(client, { schema });
console.log('Conexión con PostgreSQL establecida exitosamente usando Drizzle')