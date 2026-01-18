import request from 'supertest';
import app from '../../app';
import { pool } from '../../config/database';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Service API Integration Tests', () => {
  let testCustomerId: string;
  let testServiceId: string;

  beforeAll(async () => {
    // Run services migration if table doesn't exist
    try {
      await pool.query('SELECT 1 FROM services LIMIT 1');
    } catch (error) {
      // Table doesn't exist, run migration
      const migrationFile = readFileSync(
        join(__dirname, '../../db/migrations/002_create_services_table.sql'),
        'utf-8'
      );
      await pool.query(migrationFile);
    }

    // Create a test customer for services
    const customerResult = await pool.query(
      `INSERT INTO customers (id, name, address)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [randomUUID(), 'Test Customer for Services', '123 Test St']
    );
    testCustomerId = customerResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testServiceId) {
      await pool.query('DELETE FROM services WHERE id = $1', [testServiceId]).catch(() => {});
    }
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]).catch(() => {});
    }
    // Don't close pool here - it's shared with other tests
  });

  describe('GET /api/services', () => {
    it('should return list of services', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter services by customer_id', async () => {
      // First create a service for the test customer
      const serviceResult = await pool.query(
        `INSERT INTO services (id, customer_id, service_type, scheduled_date)
         VALUES ($1, $2, 'regular', '2026-01-20')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const serviceId = serviceResult.rows[0].id;

      const response = await request(app)
        .get('/api/services')
        .query({ customer_id: testCustomerId })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((service: any) => {
        expect(service.customer_id).toBe(testCustomerId);
      });

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
    });

    it('should filter services by status', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ status: 'scheduled' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((service: any) => {
        expect(service.status).toBe('scheduled');
      });
    });

    it('should filter services by date range', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({
          start_date: '2026-01-01',
          end_date: '2026-01-31',
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((service: any) => {
        const serviceDate = new Date(service.scheduled_date);
        expect(serviceDate >= new Date('2026-01-01')).toBe(true);
        expect(serviceDate <= new Date('2026-01-31')).toBe(true);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ limit: 5, offset: 0 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({
          customer_id: testCustomerId,
          status: 'scheduled',
          start_date: '2026-01-01',
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/services', () => {
    it('should create a new service', async () => {
      const serviceData = {
        customer_id: testCustomerId,
        service_type: 'regular',
        scheduled_date: '2026-01-25',
        scheduled_time: '10:00:00',
        service_notes: 'Test service notes',
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customer_id).toBe(serviceData.customer_id);
      expect(response.body.service_type).toBe(serviceData.service_type);
      // scheduled_date may be returned as ISO string or Date, so check it matches
      const responseDate = new Date(response.body.scheduled_date).toISOString().split('T')[0];
      expect(responseDate).toBe(serviceData.scheduled_date);
      expect(response.body.status).toBe('scheduled'); // default
      expect(response.body.service_notes).toBe(serviceData.service_notes);

      testServiceId = response.body.id;
    });

    it('should create service with default status', async () => {
      const serviceData = {
        customer_id: testCustomerId,
        service_type: 'repair',
        scheduled_date: '2026-01-26',
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body.status).toBe('scheduled');

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [response.body.id]);
    });

    it('should create service with specified status', async () => {
      const serviceData = {
        customer_id: testCustomerId,
        service_type: 'one_off',
        scheduled_date: '2026-01-27',
        status: 'in_progress',
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body.status).toBe('in_progress');

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [response.body.id]);
    });

    it('should reject service with missing required fields', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          service_type: 'regular',
          // missing customer_id and scheduled_date
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject service with invalid customer_id', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          customer_id: randomUUID(), // non-existent customer
          service_type: 'regular',
          scheduled_date: '2026-01-25',
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid customer_id');
    });

    it('should reject service with invalid service_type', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          customer_id: testCustomerId,
          service_type: 'invalid_type',
          scheduled_date: '2026-01-25',
        })
        .expect(400);

      expect(response.body.error).toContain('service_type');
    });

    it('should reject service with invalid status', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          customer_id: testCustomerId,
          service_type: 'regular',
          scheduled_date: '2026-01-25',
          status: 'invalid_status',
        })
        .expect(400);

      expect(response.body.error).toContain('status');
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return service by id', async () => {
      if (!testServiceId) {
        // Create a service if one doesn't exist
        const result = await pool.query(
          `INSERT INTO services (id, customer_id, service_type, scheduled_date)
           VALUES ($1, $2, 'regular', '2026-01-25')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testServiceId = result.rows[0].id;
      }

      const response = await request(app)
        .get(`/api/services/${testServiceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testServiceId);
      expect(response.body.customer_id).toBe(testCustomerId);
    });

    it('should return 404 for non-existent service', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .get(`/api/services/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Service not found');
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update service', async () => {
      // Create a service to update
      const result = await pool.query(
        `INSERT INTO services (id, customer_id, service_type, scheduled_date)
         VALUES ($1, $2, 'regular', '2026-01-25')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const serviceId = result.rows[0].id;

      const updateData = {
        status: 'completed',
        service_notes: 'Updated notes',
        completed_at: new Date().toISOString(),
      };

      const response = await request(app)
        .put(`/api/services/${serviceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.service_notes).toBe('Updated notes');
      expect(response.body.completed_at).toBeDefined();

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
    });

    it('should return 404 for non-existent service', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .put(`/api/services/${nonExistentId}`)
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.error).toBe('Service not found');
    });

    it('should reject invalid service_type', async () => {
      if (!testServiceId) {
        const result = await pool.query(
          `INSERT INTO services (id, customer_id, service_type, scheduled_date)
           VALUES ($1, $2, 'regular', '2026-01-25')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testServiceId = result.rows[0].id;
      }

      const response = await request(app)
        .put(`/api/services/${testServiceId}`)
        .send({ service_type: 'invalid_type' })
        .expect(400);

      expect(response.body.error).toContain('service_type');
    });

    it('should reject invalid status', async () => {
      if (!testServiceId) {
        const result = await pool.query(
          `INSERT INTO services (id, customer_id, service_type, scheduled_date)
           VALUES ($1, $2, 'regular', '2026-01-25')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testServiceId = result.rows[0].id;
      }

      const response = await request(app)
        .put(`/api/services/${testServiceId}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.error).toContain('status');
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete service', async () => {
      // Create a service to delete
      const result = await pool.query(
        `INSERT INTO services (id, customer_id, service_type, scheduled_date)
         VALUES ($1, $2, 'regular', '2026-01-25')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      const serviceId = result.rows[0].id;

      await request(app)
        .delete(`/api/services/${serviceId}`)
        .expect(204);

      // Verify it's deleted
      const checkResult = await pool.query(
        'SELECT * FROM services WHERE id = $1',
        [serviceId]
      );
      expect(checkResult.rows.length).toBe(0);
    });

    it('should return 404 for non-existent service', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .delete(`/api/services/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Service not found');
    });
  });

  describe('POST /api/services/:id/complete', () => {
    let completeServiceId: string;

    beforeEach(async () => {
      // Create a service to complete
      const result = await pool.query(
        `INSERT INTO services (id, customer_id, service_type, scheduled_date, status)
         VALUES ($1, $2, 'regular', '2026-01-25', 'scheduled')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      completeServiceId = result.rows[0].id;
    });

    afterEach(async () => {
      if (completeServiceId) {
        await pool.query('DELETE FROM services WHERE id = $1', [completeServiceId]).catch(() => {});
      }
    });

    it('should mark service as completed and set completed_at timestamp', async () => {
      const response = await request(app)
        .post(`/api/services/${completeServiceId}/complete`)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.completed_at).toBeDefined();
      expect(new Date(response.body.completed_at)).toBeInstanceOf(Date);

      // Verify in database
      const dbResult = await pool.query(
        'SELECT status, completed_at FROM services WHERE id = $1',
        [completeServiceId]
      );
      expect(dbResult.rows[0].status).toBe('completed');
      expect(dbResult.rows[0].completed_at).toBeDefined();
    });

    it('should return 404 when service not found', async () => {
      const nonExistentId = randomUUID();
      await request(app)
        .post(`/api/services/${nonExistentId}/complete`)
        .expect(404);
    });
  });

  describe('POST /api/services/:id/skip', () => {
    let skipServiceId: string;

    beforeEach(async () => {
      // Create a service to skip
      const result = await pool.query(
        `INSERT INTO services (id, customer_id, service_type, scheduled_date, status)
         VALUES ($1, $2, 'regular', '2026-01-25', 'scheduled')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      skipServiceId = result.rows[0].id;
    });

    afterEach(async () => {
      if (skipServiceId) {
        await pool.query('DELETE FROM services WHERE id = $1', [skipServiceId]).catch(() => {});
      }
    });

    it('should mark service as skipped without reason', async () => {
      const response = await request(app)
        .post(`/api/services/${skipServiceId}/skip`)
        .expect(200);

      expect(response.body.status).toBe('skipped');

      // Verify in database
      const dbResult = await pool.query(
        'SELECT status FROM services WHERE id = $1',
        [skipServiceId]
      );
      expect(dbResult.rows[0].status).toBe('skipped');
    });

    it('should mark service as skipped with reason', async () => {
      const reason = 'Customer requested to skip this week';
      const response = await request(app)
        .post(`/api/services/${skipServiceId}/skip`)
        .send({ reason })
        .expect(200);

      expect(response.body.status).toBe('skipped');
      expect(response.body.service_notes).toContain(reason);

      // Verify in database
      const dbResult = await pool.query(
        'SELECT status, service_notes FROM services WHERE id = $1',
        [skipServiceId]
      );
      expect(dbResult.rows[0].status).toBe('skipped');
      expect(dbResult.rows[0].service_notes).toContain(reason);
    });

    it('should return 404 when service not found', async () => {
      const nonExistentId = randomUUID();
      await request(app)
        .post(`/api/services/${nonExistentId}/skip`)
        .expect(404);
    });
  });

  describe('POST /api/services/:id/start', () => {
    let startServiceId: string;

    beforeEach(async () => {
      // Create a service to start
      const result = await pool.query(
        `INSERT INTO services (id, customer_id, service_type, scheduled_date, status)
         VALUES ($1, $2, 'regular', '2026-01-25', 'scheduled')
         RETURNING id`,
        [randomUUID(), testCustomerId]
      );
      startServiceId = result.rows[0].id;
    });

    afterEach(async () => {
      if (startServiceId) {
        await pool.query('DELETE FROM services WHERE id = $1', [startServiceId]).catch(() => {});
      }
    });

    it('should mark service as in_progress', async () => {
      const response = await request(app)
        .post(`/api/services/${startServiceId}/start`)
        .expect(200);

      expect(response.body.status).toBe('in_progress');

      // Verify in database
      const dbResult = await pool.query(
        'SELECT status FROM services WHERE id = $1',
        [startServiceId]
      );
      expect(dbResult.rows[0].status).toBe('in_progress');
    });

    it('should return 404 when service not found', async () => {
      const nonExistentId = randomUUID();
      await request(app)
        .post(`/api/services/${nonExistentId}/start`)
        .expect(404);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid limit parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ limit: 'invalid' })
        .expect(200); // Should still work, just ignore invalid limit

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle invalid offset parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ offset: 'invalid' })
        .expect(200); // Should still work, just ignore invalid offset

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle negative limit parameter', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ limit: -5 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle negative offset parameter', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ offset: -10 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle empty string in customer_id filter', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ customer_id: '' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle invalid date format in start_date', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ start_date: 'invalid-date' })
        .expect(200); // Database will handle invalid date

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle invalid date format in end_date', async () => {
      const response = await request(app)
        .get('/api/services')
        .query({ end_date: 'invalid-date' })
        .expect(200); // Database will handle invalid date

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle update with empty body', async () => {
      if (!testServiceId) {
        const result = await pool.query(
          `INSERT INTO services (id, customer_id, service_type, scheduled_date)
           VALUES ($1, $2, 'regular', '2026-01-25')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testServiceId = result.rows[0].id;
      }

      const response = await request(app)
        .put(`/api/services/${testServiceId}`)
        .send({})
        .expect(200); // Should return existing service

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testServiceId);
    });

    it('should handle update with invalid customer_id during update', async () => {
      if (!testServiceId) {
        const result = await pool.query(
          `INSERT INTO services (id, customer_id, service_type, scheduled_date)
           VALUES ($1, $2, 'regular', '2026-01-25')
           RETURNING id`,
          [randomUUID(), testCustomerId]
        );
        testServiceId = result.rows[0].id;
      }

      const invalidCustomerId = randomUUID();
      const response = await request(app)
        .put(`/api/services/${testServiceId}`)
        .send({ customer_id: invalidCustomerId })
        .expect(400);

      expect(response.body.error).toContain('Invalid customer_id');
    });

    it('should handle very long service_notes', async () => {
      const longNotes = 'A'.repeat(10000);
      const serviceData = {
        customer_id: testCustomerId,
        service_type: 'regular',
        scheduled_date: '2026-01-25',
        service_notes: longNotes,
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body.service_notes).toBe(longNotes);

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [response.body.id]);
    });

    it('should handle special characters in service_notes', async () => {
      const specialNotes = 'Test notes with special chars: <>&"\'`\n\t';
      const serviceData = {
        customer_id: testCustomerId,
        service_type: 'regular',
        scheduled_date: '2026-01-25',
        service_notes: specialNotes,
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(201);

      expect(response.body.service_notes).toBe(specialNotes);

      // Clean up
      await pool.query('DELETE FROM services WHERE id = $1', [response.body.id]);
    });
  });
});
