import { Request, Response } from 'express';
import { recurringServiceRepo } from '../repositories/recurringServiceRepository';
import { RecurringServiceCreateInput, RecurringServiceUpdateInput, RecurringServiceFilters } from '../models/RecurringService';
import { pool } from '../config/database';

export class RecurringServiceController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters: RecurringServiceFilters = {
        customer_id: req.query.customer_id as string,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        frequency: req.query.frequency as 'weekly' | 'biweekly' | 'monthly',
      };

      const recurringServices = await recurringServiceRepo.findAll(filters);
      res.json(recurringServices);
    } catch (error) {
      console.error('Error listing recurring services:', error);
      res.status(500).json({ error: 'Failed to list recurring services' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const recurringService = await recurringServiceRepo.findById(id);

      if (!recurringService) {
        res.status(404).json({ error: 'Recurring service not found' });
        return;
      }

      res.json(recurringService);
    } catch (error) {
      console.error('Error getting recurring service:', error);
      res.status(500).json({ error: 'Failed to get recurring service' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: RecurringServiceCreateInput = req.body;
      
      // Validate required fields
      if (!data.customer_id || !data.service_type || !data.frequency || !data.start_date) {
        res.status(400).json({ error: 'customer_id, service_type, frequency, and start_date are required' });
        return;
      }

      // Validate service_type
      if (!['regular', 'repair', 'one_off'].includes(data.service_type)) {
        res.status(400).json({ error: 'service_type must be one of: regular, repair, one_off' });
        return;
      }

      // Validate frequency
      if (!['weekly', 'biweekly', 'monthly'].includes(data.frequency)) {
        res.status(400).json({ error: 'frequency must be one of: weekly, biweekly, monthly' });
        return;
      }

      // Validate day_of_week for weekly/biweekly
      if ((data.frequency === 'weekly' || data.frequency === 'biweekly') && data.day_of_week === undefined) {
        res.status(400).json({ error: 'day_of_week is required for weekly and biweekly frequencies' });
        return;
      }

      if (data.day_of_week !== undefined && (data.day_of_week < 0 || data.day_of_week > 6)) {
        res.status(400).json({ error: 'day_of_week must be between 0 and 6' });
        return;
      }

      // Validate day_of_month for monthly
      if (data.frequency === 'monthly' && data.day_of_month === undefined) {
        res.status(400).json({ error: 'day_of_month is required for monthly frequency' });
        return;
      }

      if (data.day_of_month !== undefined && (data.day_of_month < 1 || data.day_of_month > 31)) {
        res.status(400).json({ error: 'day_of_month must be between 1 and 31' });
        return;
      }

      // Validate end_date is after start_date
      if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
        res.status(400).json({ error: 'end_date must be after start_date' });
        return;
      }

      // Validate customer exists
      const customerCheck = await pool.query('SELECT id FROM customers WHERE id = $1', [data.customer_id]);
      if (customerCheck.rows.length === 0) {
        res.status(400).json({ error: 'Invalid customer_id' });
        return;
      }

      const recurringService = await recurringServiceRepo.create(data);
      res.status(201).json(recurringService);
    } catch (error: any) {
      console.error('Error creating recurring service:', error);
      
      // Check for foreign key constraint violation
      if (error.code === '23503') {
        res.status(400).json({ error: 'Invalid customer_id' });
        return;
      }

      // Check for check constraint violation
      if (error.code === '23514') {
        res.status(400).json({ error: 'Invalid data: constraint violation' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to create recurring service' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const data: RecurringServiceUpdateInput = req.body;

      // Validate frequency if provided
      if (data.frequency && !['weekly', 'biweekly', 'monthly'].includes(data.frequency)) {
        res.status(400).json({ error: 'frequency must be one of: weekly, biweekly, monthly' });
        return;
      }

      // Validate day_of_week if provided
      if (data.day_of_week !== undefined && (data.day_of_week < 0 || data.day_of_week > 6)) {
        res.status(400).json({ error: 'day_of_week must be between 0 and 6' });
        return;
      }

      // Validate day_of_month if provided
      if (data.day_of_month !== undefined && (data.day_of_month < 1 || data.day_of_month > 31)) {
        res.status(400).json({ error: 'day_of_month must be between 1 and 31' });
        return;
      }

      // Validate end_date is after start_date if both provided
      if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) {
        res.status(400).json({ error: 'end_date must be after start_date' });
        return;
      }

      const recurringService = await recurringServiceRepo.update(id, data);

      if (!recurringService) {
        res.status(404).json({ error: 'Recurring service not found' });
        return;
      }

      res.json(recurringService);
    } catch (error: any) {
      console.error('Error updating recurring service:', error);
      
      // Check for check constraint violation
      if (error.code === '23514') {
        res.status(400).json({ error: 'Invalid data: constraint violation' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to update recurring service' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await recurringServiceRepo.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Recurring service not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting recurring service:', error);
      res.status(500).json({ error: 'Failed to delete recurring service' });
    }
  }

  async activate(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const recurringService = await recurringServiceRepo.activate(id);

      if (!recurringService) {
        res.status(404).json({ error: 'Recurring service not found' });
        return;
      }

      res.json(recurringService);
    } catch (error) {
      console.error('Error activating recurring service:', error);
      res.status(500).json({ error: 'Failed to activate recurring service' });
    }
  }

  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const recurringService = await recurringServiceRepo.deactivate(id);

      if (!recurringService) {
        res.status(404).json({ error: 'Recurring service not found' });
        return;
      }

      res.json(recurringService);
    } catch (error) {
      console.error('Error deactivating recurring service:', error);
      res.status(500).json({ error: 'Failed to deactivate recurring service' });
    }
  }
}

export const recurringServiceController = new RecurringServiceController();
