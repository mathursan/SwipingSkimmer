import { pool } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  try {
    // Run migrations in order
    const migrations = [
      '001_create_customers_table.sql',
      '002_create_services_table.sql',
      '003_create_recurring_services_table.sql',
    ];

    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      const migrationFile = readFileSync(
        join(__dirname, 'migrations', migration),
        'utf-8'
      );
      await pool.query(migrationFile);
      console.log(`✓ ${migration} completed`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigrations };
