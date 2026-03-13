// backend/src/database/schema/controle/import-jobs.schema.ts

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const importJobs = sqliteTable('import_jobs', {
  id:          text('id').primaryKey(),
  dominio:     text('dominio').notNull(),
  label:       text('label').notNull(),
  status:      text('status', { enum: ['pending', 'running', 'completed', 'error', 'cancelled'] })
                 .notNull()
                 .default('pending'),
  stepsJson:   text('steps_json').notNull().default('[]'),
  retryCount:  integer('retry_count').default(0),
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:   text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at'),
  errorMsg:    text('error_msg'),
});

export type ImportJob    = typeof importJobs.$inferSelect;
export type NovoImportJob = typeof importJobs.$inferInsert;
