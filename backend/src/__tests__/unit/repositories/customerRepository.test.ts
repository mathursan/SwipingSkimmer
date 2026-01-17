import { CustomerRepository } from '../../../repositories/customerRepository';
import { pool } from '../../../config/database';
import { CustomerCreateInput } from '../../../models/Customer';

describe('CustomerRepository', () => {
  let repository: CustomerRepository;
  let testCustomerId: string;

  beforeAll(async () => {
    repository = new CustomerRepository();
  });

  afterAll(async () => {
    // Clean up test data
    if (testCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
    }
    await pool.end();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const data: CustomerCreateInput = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '555-0000',
        address: '123 Test St',
        city: 'Test City',
        state: 'TX',
        zip_code: '12345',
        billing_model: 'per_month',
        monthly_rate: 100.00,
        autopay_enabled: false,
      };

      const customer = await repository.create(data);

      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe(data.name);
      expect(customer.email).toBe(data.email);
      expect(customer.phone).toBe(data.phone);
      expect(customer.address).toBe(data.address);
      expect(customer.billing_model).toBe(data.billing_model);
      expect(customer.monthly_rate).toBe(data.monthly_rate);
      expect(customer.autopay_enabled).toBe(false);
      expect(customer.created_at).toBeDefined();
      expect(customer.updated_at).toBeDefined();

      testCustomerId = customer.id;
    });

    it('should create customer with minimal required fields', async () => {
      const data: CustomerCreateInput = {
        name: 'Minimal Customer',
        address: '456 Minimal Ave',
      };

      const customer = await repository.create(data);

      expect(customer).toBeDefined();
      expect(customer.name).toBe(data.name);
      expect(customer.address).toBe(data.address);
      expect(customer.email).toBeNull();
      expect(customer.phone).toBeNull();

      // Clean up
      await repository.delete(customer.id);
    });
  });

  describe('findById', () => {
    it('should find customer by id', async () => {
      if (!testCustomerId) {
        const data: CustomerCreateInput = {
          name: 'Find Test Customer',
          address: '789 Find St',
        };
        const customer = await repository.create(data);
        testCustomerId = customer.id;
      }

      const customer = await repository.findById(testCustomerId);

      expect(customer).toBeDefined();
      expect(customer?.id).toBe(testCustomerId);
      expect(customer?.name).toBe('Test Customer');
    });

    it('should return null for non-existent customer', async () => {
      const customer = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(customer).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const customers = await repository.findAll();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);
    });

    it('should filter by search term', async () => {
      const customers = await repository.findAll({ search: 'Test Customer' });
      expect(customers.length).toBeGreaterThan(0);
      expect(customers.some(c => c.name.includes('Test'))).toBe(true);
    });

    it('should filter by billing model', async () => {
      const customers = await repository.findAll({ billing_model: 'per_month' });
      expect(customers.every(c => c.billing_model === 'per_month' || c.billing_model === null)).toBe(true);
    });

    it('should support pagination', async () => {
      const customers = await repository.findAll({ limit: 1, offset: 0 });
      expect(customers.length).toBeLessThanOrEqual(1);
    });
  });

  describe('update', () => {
    it('should update customer fields', async () => {
      if (!testCustomerId) {
        const data: CustomerCreateInput = {
          name: 'Update Test Customer',
          address: '999 Update St',
        };
        const customer = await repository.create(data);
        testCustomerId = customer.id;
      }

      const updated = await repository.update(testCustomerId, {
        name: 'Updated Customer Name',
        monthly_rate: 150.00,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Customer Name');
      expect(updated?.monthly_rate).toBe(150.00);
      expect(updated?.updated_at.getTime()).toBeGreaterThan(updated?.created_at.getTime() || 0);
    });

    it('should return null for non-existent customer', async () => {
      const updated = await repository.update('00000000-0000-0000-0000-000000000000', {
        name: 'Should Not Update',
      });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete customer', async () => {
      const data: CustomerCreateInput = {
        name: 'Delete Test Customer',
        address: '111 Delete St',
      };
      const customer = await repository.create(data);

      const deleted = await repository.delete(customer.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(customer.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent customer', async () => {
      const deleted = await repository.delete('00000000-0000-0000-0000-000000000000');
      expect(deleted).toBe(false);
    });
  });
});
