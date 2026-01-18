import request from 'supertest';
import app from '../../app';
import { pool } from '../../config/database';
import { randomUUID } from 'crypto';

describe('Customer API Integration Tests', () => {
  let testCustomerId: string;

  afterAll(async () => {
    // Clean up test data
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
    }
    await pool.end();
  });

  describe('GET /api/customers', () => {
    it('should return list of customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter customers by search term', async () => {
      const response = await request(app)
        .get('/api/customers')
        .query({ search: 'John' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body.some((c: any) => 
          c.name.toLowerCase().includes('john') ||
          c.address.toLowerCase().includes('john') ||
          c.phone?.includes('john')
        )).toBe(true);
      }
    });

    it('should filter customers by billing model', async () => {
      const response = await request(app)
        .get('/api/customers')
        .query({ billing_model: 'per_month' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((customer: any) => {
        expect(customer.billing_model === 'per_month' || customer.billing_model === null).toBe(true);
      });
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'Integration Test Customer',
        email: 'integration@test.com',
        phone: '555-9999',
        address: '999 Integration St',
        city: 'Test City',
        state: 'TX',
        zip_code: '99999',
        billing_model: 'per_month',
        monthly_rate: 125.00,
        autopay_enabled: true,
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(customerData.name);
      expect(response.body.email).toBe(customerData.email);
      expect(response.body.billing_model).toBe(customerData.billing_model);
      expect(response.body.monthly_rate).toBe(customerData.monthly_rate);
      expect(response.body.autopay_enabled).toBe(true);

      testCustomerId = response.body.id;
    });

    it('should require name and address', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({
          email: 'incomplete@test.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return customer by id', async () => {
      if (!testCustomerId) {
        // Create a test customer if one doesn't exist
        const createResponse = await request(app)
          .post('/api/customers')
          .send({
            name: 'Get Test Customer',
            address: '888 Get St',
          })
          .expect(201);
        testCustomerId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/customers/${testCustomerId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testCustomerId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('address');
    });

    it('should return 404 for non-existent customer', async () => {
      const fakeId = randomUUID();
      const response = await request(app)
        .get(`/api/customers/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update customer', async () => {
      if (!testCustomerId) {
        const createResponse = await request(app)
          .post('/api/customers')
          .send({
            name: 'Update Test Customer',
            address: '777 Update St',
          })
          .expect(201);
        testCustomerId = createResponse.body.id;
      }

      const updateData = {
        name: 'Updated Integration Customer',
        monthly_rate: 200.00,
        service_notes: 'Test service notes',
      };

      const response = await request(app)
        .put(`/api/customers/${testCustomerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.monthly_rate).toBe(updateData.monthly_rate);
      expect(response.body.service_notes).toBe(updateData.service_notes);
    });

    it('should return 404 for non-existent customer', async () => {
      const fakeId = randomUUID();
      const response = await request(app)
        .put(`/api/customers/${fakeId}`)
        .send({ name: 'Should Not Update' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete customer', async () => {
      // Create a customer to delete
      const createResponse = await request(app)
        .post('/api/customers')
        .send({
          name: 'Delete Test Customer',
          address: '666 Delete St',
        })
        .expect(201);

      const deleteId = createResponse.body.id;

      await request(app)
        .delete(`/api/customers/${deleteId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/customers/${deleteId}`)
        .expect(404);
    });

    it('should return 404 for non-existent customer', async () => {
      const fakeId = randomUUID();
      const response = await request(app)
        .delete(`/api/customers/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/customers/:id/history', () => {
    let historyTestCustomerId: string;
    let testServiceIds: string[] = [];

    beforeAll(async () => {
      // Create a test customer for history tests
      const createResponse = await request(app)
        .post('/api/customers')
        .send({
          name: 'History Test Customer',
          address: '555 History St',
        })
        .expect(201);
      historyTestCustomerId = createResponse.body.id;

      // Create test services for this customer
      const service1 = await request(app)
        .post('/api/services')
        .send({
          customer_id: historyTestCustomerId,
          service_type: 'regular',
          scheduled_date: '2026-01-20',
          status: 'completed',
          service_notes: 'Pool cleaned and chemicals balanced',
        })
        .expect(201);
      testServiceIds.push(service1.body.id);

      const service2 = await request(app)
        .post('/api/services')
        .send({
          customer_id: historyTestCustomerId,
          service_type: 'repair',
          scheduled_date: '2026-01-15',
          status: 'completed',
          service_notes: 'Fixed pump issue',
        })
        .expect(201);
      testServiceIds.push(service2.body.id);

      const service3 = await request(app)
        .post('/api/services')
        .send({
          customer_id: historyTestCustomerId,
          service_type: 'regular',
          scheduled_date: '2026-01-10',
          status: 'scheduled',
        })
        .expect(201);
      testServiceIds.push(service3.body.id);
    });

    afterAll(async () => {
      // Clean up test services
      for (const serviceId of testServiceIds) {
        await request(app)
          .delete(`/api/services/${serviceId}`)
          .catch(() => {});
      }
      if (historyTestCustomerId) {
        await pool.query('DELETE FROM customers WHERE id = $1', [historyTestCustomerId]).catch(() => {});
      }
    });

    it('should return service history for customer', async () => {
      const response = await request(app)
        .get(`/api/customers/${historyTestCustomerId}/history`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Verify services belong to the customer
      response.body.forEach((service: any) => {
        expect(service.customer_id).toBe(historyTestCustomerId);
      });
    });

    it('should return services sorted by date (newest first)', async () => {
      const response = await request(app)
        .get(`/api/customers/${historyTestCustomerId}/history`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Check that dates are in descending order
      for (let i = 0; i < response.body.length - 1; i++) {
        const currentDate = new Date(response.body[i].scheduled_date);
        const nextDate = new Date(response.body[i + 1].scheduled_date);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    it('should return empty array when customer has no services', async () => {
      // Create a customer with no services
      const createResponse = await request(app)
        .post('/api/customers')
        .send({
          name: 'No Services Customer',
          address: '999 No Services St',
        })
        .expect(201);
      const noServicesCustomerId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/customers/${noServicesCustomerId}/history`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      // Clean up
      await request(app)
        .delete(`/api/customers/${noServicesCustomerId}`)
        .expect(204);
    });

    it('should return 404 when customer does not exist', async () => {
      const nonExistentId = randomUUID();
      const response = await request(app)
        .get(`/api/customers/${nonExistentId}/history`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Customer not found');
    });
  });
});
