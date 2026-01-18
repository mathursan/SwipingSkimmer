import { RecurringServiceRepository } from '../../../repositories/recurringServiceRepository';
import { RecurringService, RecurringServiceCreateInput, RecurringServiceUpdateInput, RecurringServiceFilters } from '../../../models/RecurringService';
import { pool } from '../../../config/database';
import { randomUUID } from 'crypto';

// Mock the database pool
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('RecurringServiceRepository', () => {
  let recurringServiceRepo: RecurringServiceRepository;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    recurringServiceRepo = new RecurringServiceRepository();
    mockQuery = pool.query as jest.Mock;
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all recurring services when no filters provided', async () => {
      const mockRecurringServices = [
        {
          id: '1',
          customer_id: 'customer-1',
          service_type: 'regular',
          frequency: 'weekly',
          day_of_week: 1,
          day_of_month: null,
          start_date: '2026-01-20',
          end_date: null,
          is_active: true,
          technician_id: null,
          scheduled_time: null,
          service_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockRecurringServices });

      const result = await recurringServiceRepo.findAll({});

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recurring_services'),
        []
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by customer_id', async () => {
      const customerId = randomUUID();
      mockQuery.mockResolvedValue({ rows: [] });

      await recurringServiceRepo.findAll({ customer_id: customerId });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('customer_id = $1'),
        [customerId]
      );
    });

    it('should filter by is_active', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await recurringServiceRepo.findAll({ is_active: true });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_active = $1'),
        [true]
      );
    });

    it('should filter by frequency', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await recurringServiceRepo.findAll({ frequency: 'weekly' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('frequency = $1'),
        ['weekly']
      );
    });

    it('should combine multiple filters', async () => {
      const customerId = randomUUID();
      mockQuery.mockResolvedValue({ rows: [] });

      await recurringServiceRepo.findAll({
        customer_id: customerId,
        is_active: true,
        frequency: 'weekly',
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining([customerId, true, 'weekly'])
      );
    });
  });

  describe('findById', () => {
    it('should return recurring service when found', async () => {
      const recurringServiceId = randomUUID();
      const mockRecurringService = {
        id: recurringServiceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: null,
        start_date: '2026-01-20',
        end_date: null,
        is_active: true,
        technician_id: null,
        scheduled_time: null,
        service_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockRecurringService] });

      const result = await recurringServiceRepo.findById(recurringServiceId);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM recurring_services WHERE id = $1',
        [recurringServiceId]
      );
      expect(result).toBeDefined();
      expect(result?.id).toBe(recurringServiceId);
    });

    it('should return null when recurring service not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await recurringServiceRepo.findById(randomUUID());

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new recurring service with required fields', async () => {
      const recurringServiceId = randomUUID();
      const customerId = randomUUID();
      const input: RecurringServiceCreateInput = {
        customer_id: customerId,
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        start_date: '2026-01-20',
      };

      const mockCreated = {
        id: recurringServiceId,
        customer_id: customerId,
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: null,
        start_date: '2026-01-20',
        end_date: null,
        is_active: true,
        technician_id: null,
        scheduled_time: null,
        service_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockCreated] });

      const result = await recurringServiceRepo.create(input);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recurring_services'),
        expect.arrayContaining([
          expect.any(String), // id
          customerId,
          'regular',
          'weekly',
          1,
          null,
          '2026-01-20',
          null,
          null,
          null,
          null,
        ])
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(recurringServiceId);
    });

    it('should create recurring service with all optional fields', async () => {
      const recurringServiceId = randomUUID();
      const customerId = randomUUID();
      const input: RecurringServiceCreateInput = {
        customer_id: customerId,
        service_type: 'repair',
        frequency: 'monthly',
        day_of_month: 15,
        start_date: '2026-01-20',
        end_date: '2026-12-31',
        technician_id: 'tech-1',
        scheduled_time: '10:00',
        service_notes: 'Test notes',
      };

      const mockCreated = {
        id: recurringServiceId,
        ...input,
        day_of_week: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockCreated] });

      const result = await recurringServiceRepo.create(input);

      expect(result).toBeDefined();
      expect(result.service_type).toBe('repair');
      expect(result.frequency).toBe('monthly');
      expect(result.day_of_month).toBe(15);
    });
  });

  describe('update', () => {
    it('should update recurring service with provided fields', async () => {
      const recurringServiceId = randomUUID();
      const updateData: RecurringServiceUpdateInput = {
        frequency: 'biweekly',
        day_of_week: 3,
        is_active: false,
      };

      const mockUpdated = {
        id: recurringServiceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        frequency: 'biweekly',
        day_of_week: 3,
        day_of_month: null,
        start_date: '2026-01-20',
        end_date: null,
        is_active: false,
        technician_id: null,
        scheduled_time: null,
        service_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock findById call
      mockQuery.mockResolvedValueOnce({ rows: [{ id: recurringServiceId }] });
      // Mock update call
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] });

      const result = await recurringServiceRepo.update(recurringServiceId, updateData);

      expect(result).toBeDefined();
      expect(result?.frequency).toBe('biweekly');
      expect(result?.day_of_week).toBe(3);
      expect(result?.is_active).toBe(false);
    });

    it('should return null when recurring service not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await recurringServiceRepo.update(randomUUID(), { frequency: 'weekly' });

      expect(result).toBeNull();
    });

    it('should return existing recurring service when no updates provided', async () => {
      const recurringServiceId = randomUUID();
      const mockRecurringService = {
        id: recurringServiceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: null,
        start_date: '2026-01-20',
        end_date: null,
        is_active: true,
        technician_id: null,
        scheduled_time: null,
        service_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockRecurringService] }); // findById call

      const result = await recurringServiceRepo.update(recurringServiceId, {});

      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalledTimes(1); // Only findById
    });
  });

  describe('delete', () => {
    it('should delete recurring service and return true', async () => {
      const recurringServiceId = randomUUID();
      mockQuery.mockResolvedValue({ rowCount: 1 } as any);

      const result = await recurringServiceRepo.delete(recurringServiceId);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM recurring_services WHERE id = $1',
        [recurringServiceId]
      );
      expect(result).toBe(true);
    });

    it('should return false when recurring service not found', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 } as any);

      const result = await recurringServiceRepo.delete(randomUUID());

      expect(result).toBe(false);
    });
  });

  describe('activate', () => {
    it('should update recurring service is_active to true', async () => {
      const recurringServiceId = randomUUID();
      const mockUpdated = {
        id: recurringServiceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: null,
        start_date: '2026-01-20',
        end_date: null,
        is_active: true,
        technician_id: null,
        scheduled_time: null,
        service_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockUpdated] });

      const result = await recurringServiceRepo.activate(recurringServiceId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE recurring_services'),
        [recurringServiceId]
      );
      expect(result).toBeDefined();
      expect(result?.is_active).toBe(true);
    });

    it('should return null when recurring service not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await recurringServiceRepo.activate(randomUUID());

      expect(result).toBeNull();
    });
  });

  describe('deactivate', () => {
    it('should update recurring service is_active to false', async () => {
      const recurringServiceId = randomUUID();
      const mockUpdated = {
        id: recurringServiceId,
        customer_id: 'customer-1',
        service_type: 'regular',
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: null,
        start_date: '2026-01-20',
        end_date: null,
        is_active: false,
        technician_id: null,
        scheduled_time: null,
        service_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQuery.mockResolvedValue({ rows: [mockUpdated] });

      const result = await recurringServiceRepo.deactivate(recurringServiceId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE recurring_services'),
        [recurringServiceId]
      );
      expect(result).toBeDefined();
      expect(result?.is_active).toBe(false);
    });

    it('should return null when recurring service not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await recurringServiceRepo.deactivate(randomUUID());

      expect(result).toBeNull();
    });
  });
});
