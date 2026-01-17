import { pool } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  try {
    const migrationFile = readFileSync(
      join(__dirname, 'migrations', '001_create_customers_table.sql'),
      'utf-8'
    );

    await pool.query(migrationFile);
    console.log('Migration completed successfully');
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
