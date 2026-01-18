import { pool } from '../../../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

describe('Services Table Migration', () => {
  beforeAll(async () => {
    // Run the migration
    const migrationFile = readFileSync(
      join(__dirname, '../../../db/migrations/002_create_services_table.sql'),
      'utf-8'
    );
    await pool.query(migrationFile);
  });

  afterAll(async () => {
    // Clean up: drop the services table
    await pool.query('DROP TABLE IF EXISTS services CASCADE');
    await pool.end();
  });

  describe('Table Structure', () => {
    it('should create services table with correct structure', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'services'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map((row: any) => row.column_name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('customer_id');
      expect(columns).toContain('route_id');
      expect(columns).toContain('technician_id');
      expect(columns).toContain('service_type');
      expect(columns).toContain('scheduled_date');
      expect(columns).toContain('scheduled_time');
      expect(columns).toContain('status');
      expect(columns).toContain('completed_at');
      expect(columns).toContain('service_notes');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');
    });

    it('should have id as UUID primary key', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'id'
      `);

      expect(result.rows[0].data_type).toBe('uuid');
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have service_type as NOT NULL VARCHAR', async () => {
      const result = await pool.query(`
        SELECT data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'service_type'
      `);

      expect(result.rows[0].data_type).toBe('character varying');
      expect(result.rows[0].character_maximum_length).toBe(50);
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have scheduled_date as NOT NULL DATE', async () => {
      const result = await pool.query(`
        SELECT data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'scheduled_date'
      `);

      expect(result.rows[0].data_type).toBe('date');
      expect(result.rows[0].is_nullable).toBe('NO');
    });

    it('should have status with default value "scheduled"', async () => {
      const result = await pool.query(`
        SELECT column_default
        FROM information_schema.columns
        WHERE table_name = 'services' AND column_name = 'status'
      `);

      expect(result.rows[0].column_default).toContain('scheduled');
    });

    it('should have created_at and updated_at with default NOW()', async () => {
      const result = await pool.query(`
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_name = 'services'
        AND column_name IN ('created_at', 'updated_at')
        ORDER BY column_name
      `);

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
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'services'
          AND kcu.column_name = 'customer_id'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].foreign_table_name).toBe('customers');
      expect(result.rows[0].foreign_column_name).toBe('id');
    });

    it('should prevent creating service with invalid customer_id', async () => {
      const invalidCustomerId = randomUUID();
      
      await expect(
        pool.query(`
          INSERT INTO services (id, customer_id, service_type, scheduled_date)
          VALUES ($1, $2, 'regular', '2026-01-20')
        `, [randomUUID(), invalidCustomerId])
      ).rejects.toThrow();
    });

    it('should allow creating service with valid customer_id', async () => {
      // First create a test customer
      const customerId = randomUUID();
      await pool.query(`
        INSERT INTO customers (id, name, address)
        VALUES ($1, 'Test Customer', '123 Test St')
      `, [customerId]);

      // Then create a service
      const serviceId = randomUUID();
      await pool.query(`
        INSERT INTO services (id, customer_id, service_type, scheduled_date)
        VALUES ($1, $2, 'regular', '2026-01-20')
      `, [serviceId, customerId]);

      // Verify it was created
      const result = await pool.query(
        'SELECT * FROM services WHERE id = $1',
        [serviceId]
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].customer_id).toBe(customerId);

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
      await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    });
  });

  describe('Indexes', () => {
    it('should have index on customer_id', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'services' AND indexname = 'idx_services_customer_id'
      `);

      expect(result.rows.length).toBe(1);
    });

    it('should have index on scheduled_date', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'services' AND indexname = 'idx_services_scheduled_date'
      `);

      expect(result.rows.length).toBe(1);
    });

    it('should have index on status', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'services' AND indexname = 'idx_services_status'
      `);

      expect(result.rows.length).toBe(1);
    });

    it('should have index on route_id', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'services' AND indexname = 'idx_services_route_id'
      `);

      expect(result.rows.length).toBe(1);
    });
  });

  describe('Default Values', () => {
    it('should set status to "scheduled" by default', async () => {
      const customerId = randomUUID();
      await pool.query(`
        INSERT INTO customers (id, name, address)
        VALUES ($1, 'Test Customer', '123 Test St')
      `, [customerId]);

      const serviceId = randomUUID();
      await pool.query(`
        INSERT INTO services (id, customer_id, service_type, scheduled_date)
        VALUES ($1, $2, 'regular', '2026-01-20')
      `, [serviceId, customerId]);

      const result = await pool.query(
        'SELECT status FROM services WHERE id = $1',
        [serviceId]
      );

      expect(result.rows[0].status).toBe('scheduled');

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
      await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    });

    it('should set created_at and updated_at timestamps', async () => {
      const customerId = randomUUID();
      await pool.query(`
        INSERT INTO customers (id, name, address)
        VALUES ($1, 'Test Customer', '123 Test St')
      `, [customerId]);

      const serviceId = randomUUID();
      await pool.query(`
        INSERT INTO services (id, customer_id, service_type, scheduled_date)
        VALUES ($1, $2, 'regular', '2026-01-20')
      `, [serviceId, customerId]);

      const result = await pool.query(
        'SELECT created_at, updated_at FROM services WHERE id = $1',
        [serviceId]
      );

      expect(result.rows[0].created_at).toBeDefined();
      expect(result.rows[0].updated_at).toBeDefined();
      expect(result.rows[0].created_at).not.toBeNull();
      expect(result.rows[0].updated_at).not.toBeNull();

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
      await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    });
  });

  describe('Nullable Fields', () => {
    it('should allow NULL for optional fields', async () => {
      const customerId = randomUUID();
      await pool.query(`
        INSERT INTO customers (id, name, address)
        VALUES ($1, 'Test Customer', '123 Test St')
      `, [customerId]);

      const serviceId = randomUUID();
      // Insert with only required fields
      await pool.query(`
        INSERT INTO services (id, customer_id, service_type, scheduled_date)
        VALUES ($1, $2, 'regular', '2026-01-20')
      `, [serviceId, customerId]);

      const result = await pool.query(
        'SELECT * FROM services WHERE id = $1',
        [serviceId]
      );

      expect(result.rows[0].route_id).toBeNull();
      expect(result.rows[0].technician_id).toBeNull();
      expect(result.rows[0].scheduled_time).toBeNull();
      expect(result.rows[0].completed_at).toBeNull();
      expect(result.rows[0].service_notes).toBeNull();

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
      await pool.query('DELETE FROM customers WHERE id = $1', [customerId]);
    });
  });
});
