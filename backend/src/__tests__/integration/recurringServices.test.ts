import request from 'supertest';
import app from '../../app';
import { pool } from '../../config/database';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Recurring Service API Integration Tests', () => {
  let testCustomerId: string;
  let testRecurringServiceId: string;

  beforeAll(async () => {
    // Run migrations if tables don't exist
    try {
      await pool.query('SELECT 1 FROM customers LIMIT 1');
    } catch (error) {
      const customersMigration = readFileSync(
        join(__dirname, '../../db/migrations/001_create_customers_table.sql'),
        'utf-8'
      );
      await pool.query(customersMigration);
    }

    try {
      await pool.query('SELECT 1 FROM recurring_services LIMIT 1');
    } catch (error) {
      const recurringServicesMigration = readFileSync(
        join(__dirname, '../../db/migrations/003_create_recurring_services_table.sql'),
        'utf-8'
      );
      await pool.query(recurringServicesMigration);
    }

    // Create a test customer for recurring services
    const customerResult = await pool.query(
      `INSERT INTO customers (id, name, address)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [randomUUID(), 'Test Customer for Recurring Services', '123 Test St']
    );
    testCustomerId = customerResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testRecurringServiceId) {
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [testRecurringServiceId]).catch(() => {});
    }
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]).catch(() => {});
    }
    // Don't close pool here - it's shared with other tests
  });

  describe('GET /api/recurring-services', () => {
    it('should return list of recurring services', async () => {
      const response = await request(app)
        .get('/api/recurring-services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter recurring services by customer_id', async () => {
      const response = await request(app)
        .get('/api/recurring-services')
        .query({ customer_id: testCustomerId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter recurring services by is_active', async () => {
      const response = await request(app)
        .get('/api/recurring-services')
        .query({ is_active: 'true' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter recurring services by frequency', async () => {
      const response = await request(app)
        .get('/api/recurring-services')
        .query({ frequency: 'weekly' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/recurring-services')
        .query({
          customer_id: testCustomerId,
          is_active: 'true',
          frequency: 'weekly',
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/recurring-services', () => {
    it('should create a new recurring service', async () => {
      const recurringServiceData = {
        customer_id: testCustomerId,
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        start_date: '2026-01-20',
      };

      const response = await request(app)
        .post('/api/recurring-services')
        .send(recurringServiceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customer_id).toBe(testCustomerId);
      expect(response.body.service_type).toBe('regular');
      expect(response.body.frequency).toBe('weekly');
      expect(response.body.day_of_week).toBe(1);
      expect(response.body.is_active).toBe(true);

      testRecurringServiceId = response.body.id;
    });

    it('should create recurring service with all fields', async () => {
      const recurringServiceData = {
        customer_id: testCustomerId,
        service_type: 'repair',
        frequency: 'monthly',
        day_of_month: 15,
        start_date: '2026-01-20',
        end_date: '2026-12-31',
        technician_id: randomUUID(),
        scheduled_time: '10:00',
        service_notes: 'Test notes',
      };

      const response = await request(app)
        .post('/api/recurring-services')
        .send(recurringServiceData)
        .expect(201);

      expect(response.body.service_type).toBe('repair');
      expect(response.body.frequency).toBe('monthly');
      expect(response.body.day_of_month).toBe(15);
      expect(response.body.scheduled_time).toBe('10:00:00');
      expect(response.body.service_notes).toBe('Test notes');

      // Clean up
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [response.body.id]);
    });

    it('should reject recurring service with missing required fields', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          service_type: 'regular',
          // missing customer_id, frequency, start_date
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject recurring service with invalid customer_id', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: randomUUID(), // non-existent customer
          service_type: 'regular',
          frequency: 'weekly',
          day_of_week: 1,
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid customer_id');
    });

    it('should reject recurring service with invalid service_type', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'invalid_type',
          frequency: 'weekly',
          day_of_week: 1,
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('service_type');
    });

    it('should reject recurring service with invalid frequency', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          frequency: 'invalid',
          day_of_week: 1,
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('frequency');
    });

    it('should reject weekly recurring service without day_of_week', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          frequency: 'weekly',
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('day_of_week');
    });

    it('should reject monthly recurring service without day_of_month', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          frequency: 'monthly',
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('day_of_month');
    });

    it('should reject recurring service with invalid day_of_week', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          frequency: 'weekly',
          day_of_week: 7,
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('day_of_week');
    });

    it('should reject recurring service with invalid day_of_month', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          frequency: 'monthly',
          day_of_month: 32,
          start_date: '2026-01-20',
        })
        .expect(400);

      expect(response.body.error).toContain('day_of_month');
    });

    it('should reject recurring service with end_date before start_date', async () => {
      const response = await request(app)
        .post('/api/recurring-services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          frequency: 'weekly',
          day_of_week: 1,
          start_date: '2026-01-20',
          end_date: '2026-01-10',
        })
        .expect(400);

      expect(response.body.error).toContain('end_date');
    });
  });

  describe('GET /api/recurring-services/:id', () => {
    it('should return recurring service by id', async () => {
      if (!testRecurringServiceId) {
        // Create a recurring service if one doesn't exist
        const result = await pool.query(
          `INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
           VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testRecurringServiceId = result.rows[0].id;
      }

      const response = await request(app)
        .get(`/api/recurring-services/${testRecurringServiceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testRecurringServiceId);
      expect(response.body.customer_id).toBe(testCustomerId);
    });

    it('should return 404 for non-existent recurring service', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .get(`/api/recurring-services/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Recurring service not found');
    });
  });

  describe('PUT /api/recurring-services/:id', () => {
    it('should update recurring service', async () => {
      // Create a recurring service to update
      const result = await pool.query(
        `INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
         VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const recurringServiceId = result.rows[0].id;

      const updateData = {
        frequency: 'biweekly',
        day_of_week: 3,
        is_active: false,
      };

      const response = await request(app)
        .put(`/api/recurring-services/${recurringServiceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.frequency).toBe('biweekly');
      expect(response.body.day_of_week).toBe(3);
      expect(response.body.is_active).toBe(false);

      // Clean up
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [recurringServiceId]);
    });

    it('should return 404 for non-existent recurring service', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .put(`/api/recurring-services/${nonExistentId}`)
        .send({ frequency: 'monthly' })
        .expect(404);

      expect(response.body.error).toBe('Recurring service not found');
    });

    it('should reject invalid frequency', async () => {
      if (!testRecurringServiceId) {
        const result = await pool.query(
          `INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
           VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testRecurringServiceId = result.rows[0].id;
      }

      const response = await request(app)
        .put(`/api/recurring-services/${testRecurringServiceId}`)
        .send({ frequency: 'invalid' })
        .expect(400);

      expect(response.body.error).toContain('frequency');
    });
  });

  describe('DELETE /api/recurring-services/:id', () => {
    it('should delete recurring service', async () => {
      // Create a recurring service to delete
      const result = await pool.query(
        `INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date)
         VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const recurringServiceId = result.rows[0].id;

      await request(app)
        .delete(`/api/recurring-services/${recurringServiceId}`)
        .expect(204);

      // Verify it's deleted
      const checkResult = await pool.query(
        'SELECT * FROM recurring_services WHERE id = $1',
        [recurringServiceId]
      );
      expect(checkResult.rows.length).toBe(0);
    });

    it('should return 404 for non-existent recurring service', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .delete(`/api/recurring-services/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Recurring service not found');
    });
  });

  describe('POST /api/recurring-services/:id/activate', () => {
    it('should activate recurring service', async () => {
      // Create an inactive recurring service
      const result = await pool.query(
        `INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date, is_active)
         VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20', FALSE)
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const recurringServiceId = result.rows[0].id;

      const response = await request(app)
        .post(`/api/recurring-services/${recurringServiceId}/activate`)
        .expect(200);

      expect(response.body.is_active).toBe(true);

      // Verify in database
      const dbResult = await pool.query(
        'SELECT is_active FROM recurring_services WHERE id = $1',
        [recurringServiceId]
      );
      expect(dbResult.rows[0].is_active).toBe(true);

      // Clean up
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [recurringServiceId]);
    });

    it('should return 404 when recurring service not found', async () => {
      const nonExistentId = randomUUID();
      await request(app)
        .post(`/api/recurring-services/${nonExistentId}/activate`)
        .expect(404);
    });
  });

  describe('POST /api/recurring-services/:id/deactivate', () => {
    it('should deactivate recurring service', async () => {
      // Create an active recurring service
      const result = await pool.query(
        `INSERT INTO recurring_services (id, customer_id, service_type, frequency, day_of_week, start_date, is_active)
         VALUES ($1, $2, 'regular', 'weekly', 1, '2026-01-20', TRUE)
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const recurringServiceId = result.rows[0].id;

      const response = await request(app)
        .post(`/api/recurring-services/${recurringServiceId}/deactivate`)
        .expect(200);

      expect(response.body.is_active).toBe(false);

      // Verify in database
      const dbResult = await pool.query(
        'SELECT is_active FROM recurring_services WHERE id = $1',
        [recurringServiceId]
      );
      expect(dbResult.rows[0].is_active).toBe(false);

      // Clean up
      await pool.query('DELETE FROM recurring_services WHERE id = $1', [recurringServiceId]);
    });

    it('should return 404 when recurring service not found', async () => {
      const nonExistentId = randomUUID();
      await request(app)
        .post(`/api/recurring-services/${nonExistentId}/deactivate`)
        .expect(404);
    });
  });
});
