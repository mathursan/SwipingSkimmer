import { pool } from '../config/database';
import { Customer, CustomerCreateInput, CustomerUpdateInput, CustomerFilters } from '../models/Customer';
import { randomUUID } from 'crypto';

export class CustomerRepository {
  async findAll(filters: CustomerFilters = {}): Promise<Customer[]> {
    let query = `
      SELECT 
        c.*
      FROM customers c
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Search filter (name, address, or phone)
    if (filters.search) {
      conditions.push(`(
        c.name ILIKE $${paramCount} OR 
        c.address ILIKE $${paramCount} OR 
        c.phone ILIKE $${paramCount}
      )`);
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    // Billing model filter
    if (filters.billing_model) {
      conditions.push(`c.billing_model = $${paramCount}`);
      params.push(filters.billing_model);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY c.id ORDER BY c.name';

    // Add pagination
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }
    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows.map(this.mapRowToCustomer);
  }

  async findById(id: string): Promise<Customer | null> {
    const result = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToCustomer(result.rows[0]) : null;
  }

  async create(data: CustomerCreateInput): Promise<Customer> {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO customers (
        id, company_id, name, email, phone, address, city, state, zip_code,
        latitude, longitude, gate_code, service_notes, billing_model,
        monthly_rate, autopay_enabled, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *`,
      [
        id,
        data.company_id || null,
        data.name,
        data.email || null,
        data.phone || null,
        data.address,
        data.city || null,
        data.state || null,
        data.zip_code || null,
        data.latitude || null,
        data.longitude || null,
        data.gate_code || null,
        data.service_notes || null,
        data.billing_model || null,
        data.monthly_rate || null,
        data.autopay_enabled || false,
      ]
    );
    return this.mapRowToCustomer(result.rows[0]);
  }

  async update(id: string, data: CustomerUpdateInput): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? this.mapRowToCustomer(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getServiceHistory(customerId: string, limit?: number): Promise<any[]> {
    let query = `
      SELECT 
        s.*
      FROM services s
      WHERE s.customer_id = $1
      ORDER BY s.scheduled_date DESC, s.created_at DESC
    `;
    const params: any[] = [customerId];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  private mapRowToCustomer(row: any): Customer {
    return {
      id: row.id,
      company_id: row.company_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zip_code: row.zip_code,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      gate_code: row.gate_code,
      service_notes: row.service_notes,
      billing_model: row.billing_model,
      monthly_rate: row.monthly_rate ? parseFloat(row.monthly_rate) : undefined,
      autopay_enabled: row.autopay_enabled,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
