import { ServiceRepository } from '../../../repositories/serviceRepository';
import { Service, ServiceCreateInput, ServiceUpdateInput, ServiceFilters } from '../../../models/Service';
import { pool } from '../../../config/database';
import { randomUUID } from 'crypto';

// Mock the database pool
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('ServiceRepository', () => {
  let serviceRepo: ServiceRepository;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    serviceRepo = new ServiceRepository();
    mockQuery = pool.query as jest.Mock;
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all services when no filters provided', async () => {
      const mockServices = [
        {
          id: '1',
          customer_id: 'customer-1',
          service_type: 'regular',
          scheduled_date: '2026-01-20',
          status: 'scheduled',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockServices });

      const result = await serviceRepo.findAll({});

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM services'),
        []
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by customer_id', async () => {
      const customerId = randomUUID();
      mockQuery.mockResolvedValue({ rows: [] });

      await serviceRepo.findAll({ customer_id: customerId });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('customer_id = $1'),
        [customerId]
      );
    });

    it('should filter by status', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await serviceRepo.findAll({ status: 'completed' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('status = $1'),
        ['completed']
      );
    });

    it('should filter by date range', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await serviceRepo.findAll({
        start_date: '2026-01-01',
        end_date: '2026-01-31',
      });

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('scheduled_date >= $1');
      expect(callArgs[0]).toContain('scheduled_date <= $2');
      expect(callArgs[1]).toContain('2026-01-01');
      expect(callArgs[1]).toContain('2026-01-31');
    });

    it('should support pagination with limit and offset', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await serviceRepo.findAll({ limit: 10, offset: 20 });

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('LIMIT');
      expect(callArgs[0]).toContain('OFFSET');
      expect(callArgs[1]).toContain(10);
      expect(callArgs[1]).toContain(20);
    });

    it('should combine multiple filters', async () => {
      const customerId = randomUUID();
      mockQuery.mockResolvedValue({ rows: [] });

      await serviceRepo.findAll({
        customer_id: customerId,
        status: 'scheduled',
        start_date: '2026-01-01',
      });

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('customer_id');
      expect(callArgs[0]).toContain('status');
      expect(callArgs[0]).toContain('scheduled_date');
    });
  });

  describe('findById', () => {
    it('should return service when found', async () => {
      const serviceId = randomUUID();
      const mockService = {
        id: serviceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        scheduled_date: '2026-01-20',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockService] });

      const result = await serviceRepo.findById(serviceId);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM services WHERE id = $1',
        [serviceId]
      );
      expect(result).toBeDefined();
      expect(result?.id).toBe(serviceId);
    });

    it('should return null when service not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await serviceRepo.findById(randomUUID());

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new service with required fields', async () => {
      const customerId = randomUUID();
      const serviceId = randomUUID();
      const input: ServiceCreateInput = {
        customer_id: customerId,
        service_type: 'regular',
        scheduled_date: '2026-01-20',
      };

      const mockCreated = {
        id: serviceId,
        customer_id: customerId,
        service_type: 'regular',
        scheduled_date: '2026-01-20',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockCreated] });

      const result = await serviceRepo.create(input);

      expect(mockQuery).toHaveBeenCalled();
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO services');
      expect(callArgs[1]).toContain(customerId);
      expect(callArgs[1]).toContain('regular');
      expect(callArgs[1]).toContain('2026-01-20');
      expect(result).toBeDefined();
    });

    it('should set default status to scheduled if not provided', async () => {
      const customerId = randomUUID();
      const input: ServiceCreateInput = {
        customer_id: customerId,
        service_type: 'regular',
        scheduled_date: '2026-01-20',
      };

      const mockCreated = {
        id: randomUUID(),
        customer_id: customerId,
        service_type: 'regular',
        scheduled_date: '2026-01-20',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockCreated] });

      await serviceRepo.create(input);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[1]).toContain('scheduled');
    });

    it('should handle optional fields', async () => {
      const customerId = randomUUID();
      const input: ServiceCreateInput = {
        customer_id: customerId,
        service_type: 'repair',
        scheduled_date: '2026-01-20',
        scheduled_time: '10:00:00',
        service_notes: 'Test notes',
        status: 'in_progress',
      };

      const mockCreated = {
        id: randomUUID(),
        ...input,
        status: 'in_progress',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockCreated] });

      await serviceRepo.create(input);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[1]).toContain('10:00:00');
      expect(callArgs[1]).toContain('Test notes');
      expect(callArgs[1]).toContain('in_progress');
    });
  });

  describe('update', () => {
    it('should update service with provided fields', async () => {
      const serviceId = randomUUID();
      const update: ServiceUpdateInput = {
        status: 'completed',
        service_notes: 'Updated notes',
      };

      const mockUpdated = {
        id: serviceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        scheduled_date: '2026-01-20',
        status: 'completed',
        service_notes: 'Updated notes',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockUpdated] });

      const result = await serviceRepo.update(serviceId, update);

      expect(mockQuery).toHaveBeenCalled();
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('UPDATE services');
      expect(callArgs[0]).toContain('status =');
      expect(callArgs[0]).toContain('service_notes =');
      expect(callArgs[0]).toContain('updated_at = NOW()');
      expect(callArgs[1]).toContain('completed');
      expect(callArgs[1]).toContain('Updated notes');
      expect(result).toBeDefined();
    });

    it('should return null when service not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await serviceRepo.update(randomUUID(), { status: 'completed' });

      expect(result).toBeNull();
    });

    it('should return existing service when no updates provided', async () => {
      const serviceId = randomUUID();
      const mockService = {
        id: serviceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        scheduled_date: '2026-01-20',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockService] }); // findById call

      const result = await serviceRepo.update(serviceId, {});

      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalledTimes(1); // Only findById
    });
  });

  describe('delete', () => {
    it('should delete service and return true', async () => {
      const serviceId = randomUUID();
      mockQuery.mockResolvedValue({ rowCount: 1 } as any);

      const result = await serviceRepo.delete(serviceId);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM services WHERE id = $1',
        [serviceId]
      );
      expect(result).toBe(true);
    });

    it('should return false when service not found', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 } as any);

      const result = await serviceRepo.delete(randomUUID());

      expect(result).toBe(false);
    });
  });
});
