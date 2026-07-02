import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no se cargó. Revisa backend/.env');
}

console.log(
  'Conectando a:',
  new URL(connectionString).host
);

export const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

await client.connect();

export const db = drizzle(client, { schema });

console.log('Conexión con Supabase establecida correctamente');