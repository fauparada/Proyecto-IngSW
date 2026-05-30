import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada en las variables de entorno');
  }

// Le damos una URL de respaldo para que compile
const dbUrl = process.env.DATABASE_URL || "postgresql://faustinaparada:@localhost:4005/edificio_reservas";

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl, //variable de respaldo
  },
});