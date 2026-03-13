// backend/drizzle.config.ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path   from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

export default {
  schema:  './backend/src/database/schema/index.ts',
  out:     './backend/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH
      ?? path.join(__dirname, 'database', 'integrador.db'),
  },
  verbose: true,
  strict:  false,
} satisfies Config;