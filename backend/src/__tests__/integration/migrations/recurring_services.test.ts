import { pool } from '../../../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

describe('Recurring Services Table Migration', () => {
  let testCustomerId: string;

  beforeAll(async () => {
    // Ensure customers table exists
    try {
      await pool.query('SELECT 1 FROM customers LIMIT 1');
    } catch (error) {
      // Create customers table if it doesn't exist
      const customersMigration = readFileSync(
        join(__dirname, '../../../db/migrations/001_create_customers_table.sql'),
        'utf-8'
      );
      await pool.query(customersMigration);
    }

    // Create a test customer for foreign key tests
    const customerResult = await pool.query(
      `INSERT INTO customers (id, name, address)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [randomUUID(), 'Test Customer for Recurring Services', '123 Test St']
    );
    testCustomerId = customerResult.rows[0].id;

    // Run the migration
    const migrationFile = readFileSync(
      join(__dirname, '../../../db/migrations/003_create_recurring_services_table.sql'),
      'utf-8'
    );
    await pool.query(migrationFile);
  });

  afterAll(async () => {
    // Clean up: drop the recurring_services table and test customer
    await pool.query('DROP TABLE IF EXISTS recurring_services CASCADE');
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
    }
    // Don't close pool here - it's shared with other tests
  });

  describe('Table Structure', () => {
    it('should create recurring_services table with correct structure', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'recurring_services'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map((row: any) => row.column_name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('customer_id');
      expect(columns).toContain('service_type');
      expect(columns).toContain('frequency');
      expect(columns).toContain('day_of_week');
      expect(columns).toContain('day_of_month');
      expect(columns).toContain('start_date');
      expect(columns).toContain('end_date');
      expect(columns).toContain('is_active');
      expect(columns).toContain('technician_id');
      expect(columns).toContain('scheduled_time');
      expect(columns).toContain('service_notes');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');
    });

    it('should have id as UUID primary key', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'id'
      `);

      expect(result.rows[0].data_type).toBe('uuid');
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have customer_id as UUID foreign key', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'customer_id'
      `);

      expect(result.rows[0].data_type).toBe('uuid');
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have service_type as VARCHAR(50) NOT NULL', async () => {
      const result = await pool.query(`
        SELECT data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'service_type'
      `);

      expect(result.rows[0].data_type).toBe('character varying');
      expect(result.rows[0].character_maximum_length).toBe(50);
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have frequency as VARCHAR(50) NOT NULL', async () => {
      const result = await pool.query(`
        SELECT data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'frequency'
      `);

      expect(result.rows[0].data_type).toBe('character varying');
      expect(result.rows[0].character_maximum_length).toBe(50);
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have day_of_week as INTEGER nullable', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'day_of_week'
      `);

      expect(result.rows[0].data_type).toBe('integer');
      expect(result.rows[0].is_nullable).toBe('YES');
    });

    it('should have day_of_month as INTEGER nullable', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'day_of_month'
      `);

      expect(result.rows[0].data_type).toBe('integer');
      expect(result.rows[0].is_nullable).toBe('YES');
    });

    it('should have start_date as DATE NOT NULL', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'start_date'
      `);

      expect(result.rows[0].data_type).toBe('date');
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have end_date as DATE nullable', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'end_date'
      `);

      expect(result.rows[0].data_type).toBe('date');
      expect(result.rows[0].is_nullable).toBe('YES');
    });

    it('should have is_active as BOOLEAN with default TRUE', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' AND column_name = 'is_active'
      `);

      expect(result.rows[0].data_type).toBe('boolean');
      expect(result.rows[0].is_nullable).toBe('YES');
      expect(result.rows[0].column_default).toBe('true');
    });

    it('should have created_at and updated_at with default NOW()', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_name = 'recurring_services' 
        AND column_name IN ('created_at', 'updated_at')
        ORDER BY column_name
      `);

      expect(result.rows.length).toBe(2);
      expect(result.rows[0].column_default).toContain('now()');
      expect(result.rows[1].column_default).toContain('now()');
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should have foreign key constraint on customer_id', async () => {
      const result = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'recurring_services'
          AND kcu.column_name = 'customer_id'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].foreign_table_name).toBe('customers');
      expect(result.rows[0].foreign_column_name).toBe('id');
      expect(result.rows[0].delete_rule).toBe('CASCADE');
    });

    it('should prevent creating recurring service with invalid customer_id', async () => {
      const invalidCustomerId = randomUUID();
      
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
          VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
        `, [randomUUID(), invalidCustomerId])
      ).rejects.toThrow();
    });

    it('should allow creating recurring service with valid customer_id', async () => {
      const recurringServiceId = randomUUID();
      const result = await pool.query(`
        INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
        VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
        RETURNING id
      `, [recurringServiceId, testCustomerId]);

      expect(result.rows[0].id).toBe(recurringServiceId);

      // Clean up
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [recurringServiceId]);
    });

    it('should cascade delete when customer is deleted', async () => {
      // Create a customer and recurring service
      const customerId = randomUUID();
      await pool.query(
        `INSERT INTO customers (id, name, address) VALUES ($1, $2, $3)`,
        [customerId, 'Cascade Test Customer', '456 Test St']
      );

      const recurringServiceId = randomUUID();
      await pool.query(`
        INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
        VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
      `, [recurringServiceId, customerId]);

      // Delete customer
      await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);

      // Verify recurring service was deleted
      const result = await pool.query(
        'SELECT * FROM recurring_services WHERE id = $1',
        [recurringServiceId]
      );
      expect(result.rows.length).toBe(0);
    });
  });

  describe('Check Constraints', () => {
    it('should enforce frequency constraint (weekly, biweekly, monthly)', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
          VALUES ($1, $2, 'regular', 'invalid', 1, '2026-01-20')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should enforce service_type constraint (regular, repair, one_off)', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
          VALUES ($1, $2, 'invalid', 'weekly', 1, '2026-01-20')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should enforce day_of_week range (0-6)', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
          VALUES ($1, $2, 'regular', 'weekly', 7, '2026-01-20')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should enforce day_of_month range (1-31)', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_month, start_date)
          VALUES ($1, $2, 'regular', 'monthly', 32, '2026-01-20')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should enforce end_date after start_date', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date, end_date)
          VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20', '2026-01-10')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should require day_of_week for weekly frequency', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, start_date)
          VALUES ($1, $2, 'regular', 'weekly', '2026-01-20')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should require day_of_month for monthly frequency', async () => {
      await expect(
        pool.query(`
          INSERT INTO recurring_services (id, customer_id, service_type, frequency, start_date)
          VALUES ($1, $2, 'regular', 'monthly', '2026-01-20')
        `, [randomUUID(), testCustomerId])
      ).rejects.toThrow();
    });

    it('should allow valid weekly recurring service', async () => {
      const id = randomUUID();
      const result = await pool.query(`
        INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
        VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
        RETURNING id
      `, [id, testCustomerId]);

      expect(result.rows[0].id).toBe(id);
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [id]);
    });

    it('should allow valid biweekly recurring service', async () => {
      const id = randomUUID();
      const result = await pool.query(`
        INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
        VALUES ($1, $2, 'repair', 'biweekly', 3, '2026-01-20')
        RETURNING id
      `, [id, testCustomerId]);

      expect(result.rows[0].id).toBe(id);
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [id]);
    });

    it('should allow valid monthly recurring service', async () => {
      const id = randomUUID();
      const result = await pool.query(`
        INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_month, start_date)
        VALUES ($1, $2, 'regular', 'monthly', 15, '2026-01-20')
        RETURNING id
      `, [id, testCustomerId]);

      expect(result.rows[0].id).toBe(id);
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [id]);
    });
  });

  describe('Indexes', () => {
    it('should have index on customer_id', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'recurring_services'
        AND indexname = 'idx_recurring_services_customer'
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].indexdef).toContain('customer_id');
    });

    it('should have partial index on is_active', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'recurring_services'
        AND indexname = 'idx_recurring_services_active'
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].indexdef).toContain('is_active');
      expect(result.rows[0].indexdef).toContain('WHERE');
    });

    it('should have index on frequency', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'recurring_services'
        AND indexname = 'idx_recurring_services_frequency'
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].indexdef).toContain('frequency');
    });

    it('should have index on start_date', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'recurring_services'
        AND indexname = 'idx_recurring_services_start_date'
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].indexdef).toContain('start_date');
    });
  });
});
