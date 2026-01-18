import { Request, Response } from 'express';
import { CustomerRepository } from '../repositories/customerRepository';
import { CustomerCreateInput, CustomerUpdateInput, CustomerFilters } from '../models/Customer';

const customerRepo = new CustomerRepository();

export class CustomerController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters: CustomerFilters = {
        search: req.query.search as string,
        billing_model: req.query.billing_model as string,
        service_type: req.query.service_type as string,
        payment_status: req.query.payment_status as string,
        route_assignment: req.query.route_assignment as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const customers = await customerRepo.findAll(filters);
      res.json(customers);
    } catch (error) {
      console.error('Error listing customers:', error);
      res.status(500).json({ error: 'Failed to list customers' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customer = await customerRepo.findById(id);

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error) {
      console.error('Error getting customer:', error);
      res.status(500).json({ error: 'Failed to get customer' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CustomerCreateInput = req.body;
      
      if (!data.name || !data.address) {
        res.status(400).json({ error: 'Name and address are required' });
        return;
      }

      const customer = await customerRepo.create(data);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data: CustomerUpdateInput = req.body;

      const customer = await customerRepo.update(id, data);

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const deleted = await customerRepo.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  }

  async getServiceHistory(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      // Check if customer exists
      const customer = await customerRepo.findById(id);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await customerRepo.getServiceHistory(id, limit);
      res.json(history);
    } catch (error) {
      console.error('Error getting service history:', error);
      res.status(500).json({ error: 'Failed to get service history' });
    }
  }
}
