import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ['pdfcon_*'],
  verbose: true,
  strict: true,
});
