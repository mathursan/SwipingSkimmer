import { Request, Response } from 'express';
import { serviceRepo } from '../repositories/serviceRepository';
import { ServiceCreateInput, ServiceUpdateInput, ServiceFilters } from '../models/Service';

export class ServiceController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters: ServiceFilters = {
        customer_id: req.query.customer_id as string,
        status: req.query.status as 'scheduled' | 'in_progress' | 'completed' | 'skipped',
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const services = await serviceRepo.findAll(filters);
      res.json(services);
    } catch (error) {
      console.error('Error listing services:', error);
      res.status(500).json({ error: 'Failed to list services' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const service = await serviceRepo.findById(id);

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      res.json(service);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({ error: 'Failed to get service' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: ServiceCreateInput = req.body;
      
      if (!data.customer_id || !data.service_type || !data.scheduled_date) {
        res.status(400).json({ error: 'customer_id, service_type, and scheduled_date are required' });
        return;
      }

      // Validate service_type
      if (!['regular', 'repair', 'one_off'].includes(data.service_type)) {
        res.status(400).json({ error: 'service_type must be one of: regular, repair, one_off' });
        return;
      }

      // Validate status if provided
      if (data.status && !['scheduled', 'in_progress', 'completed', 'skipped'].includes(data.status)) {
        res.status(400).json({ error: 'status must be one of: scheduled, in_progress, completed, skipped' });
        return;
      }

      const service = await serviceRepo.create(data);
      res.status(201).json(service);
    } catch (error: any) {
      console.error('Error creating service:', error);
      
      // Check for foreign key constraint violation
      if (error.code === '23503') {
        res.status(400).json({ error: 'Invalid customer_id' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to create service' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const data: ServiceUpdateInput = req.body;

      // Validate service_type if provided
      if (data.service_type && !['regular', 'repair', 'one_off'].includes(data.service_type)) {
        res.status(400).json({ error: 'service_type must be one of: regular, repair, one_off' });
        return;
      }

      // Validate status if provided
      if (data.status && !['scheduled', 'in_progress', 'completed', 'skipped'].includes(data.status)) {
        res.status(400).json({ error: 'status must be one of: scheduled, in_progress, completed, skipped' });
        return;
      }

      const service = await serviceRepo.update(id, data);

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      res.json(service);
    } catch (error: any) {
      console.error('Error updating service:', error);
      
      // Check for foreign key constraint violation
      if (error.code === '23503') {
        res.status(400).json({ error: 'Invalid customer_id' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to update service' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await serviceRepo.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  }
}

export const serviceController = new ServiceController();
