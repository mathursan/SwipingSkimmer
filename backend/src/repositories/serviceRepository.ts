import { pool } from '../config/database';
import { Service, ServiceCreateInput, ServiceUpdateInput, ServiceFilters } from '../models/Service';
import { randomUUID } from 'crypto';

export class ServiceRepository {
  async findAll(filters: ServiceFilters = {}): Promise<Service[]> {
    let query = `SELECT * FROM services s`;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Customer filter
    if (filters.customer_id) {
      conditions.push(`s.customer_id = $${paramCount}`);
      params.push(filters.customer_id);
      paramCount++;
    }

    // Status filter
    if (filters.status) {
      conditions.push(`s.status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    // Date range filters
    if (filters.start_date) {
      conditions.push(`s.scheduled_date >= $${paramCount}`);
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      conditions.push(`s.scheduled_date <= $${paramCount}`);
      params.push(filters.end_date);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.scheduled_date DESC, s.scheduled_time';

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
    return result.rows.map(this.mapRowToService);
  }

  async findById(id: string): Promise<Service | null> {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToService(result.rows[0]);
  }

  async create(input: ServiceCreateInput): Promise<Service> {
    const id = randomUUID();
    const status = input.status || 'scheduled';
    
    const query = `
      INSERT INTO services (
        id, customer_id, route_id, technician_id, service_type,
        scheduled_date, scheduled_time, status, service_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      id,
      input.customer_id,
      input.route_id || null,
      input.technician_id || null,
      input.service_type,
      input.scheduled_date,
      input.scheduled_time || null,
      status,
      input.service_notes || null,
    ];

    const result = await pool.query(query, values);
    return this.mapRowToService(result.rows[0]);
  }

  async update(id: string, input: ServiceUpdateInput): Promise<Service | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.customer_id !== undefined) {
      updates.push(`customer_id = $${paramCount}`);
      values.push(input.customer_id);
      paramCount++;
    }

    if (input.route_id !== undefined) {
      updates.push(`route_id = $${paramCount}`);
      values.push(input.route_id || null);
      paramCount++;
    }

    if (input.technician_id !== undefined) {
      updates.push(`technician_id = $${paramCount}`);
      values.push(input.technician_id || null);
      paramCount++;
    }

    if (input.service_type !== undefined) {
      updates.push(`service_type = $${paramCount}`);
      values.push(input.service_type);
      paramCount++;
    }

    if (input.scheduled_date !== undefined) {
      updates.push(`scheduled_date = $${paramCount}`);
      values.push(input.scheduled_date);
      paramCount++;
    }

    if (input.scheduled_time !== undefined) {
      updates.push(`scheduled_time = $${paramCount}`);
      values.push(input.scheduled_time || null);
      paramCount++;
    }

    if (input.status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(input.status);
      paramCount++;
    }

    if (input.completed_at !== undefined) {
      updates.push(`completed_at = $${paramCount}`);
      values.push(input.completed_at || null);
      paramCount++;
    }

    if (input.service_notes !== undefined) {
      updates.push(`service_notes = $${paramCount}`);
      values.push(input.service_notes || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE services
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToService(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM services WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markComplete(id: string): Promise<Service | null> {
    const query = `
      UPDATE services
      SET status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToService(result.rows[0]);
  }

  async markSkipped(id: string, reason?: string): Promise<Service | null> {
    const updates: string[] = [
      "status = 'skipped'",
      'updated_at = NOW()',
    ];
    const values: any[] = [];
    let paramCount = 1;

    if (reason) {
      updates.push(`service_notes = COALESCE(service_notes || E'\\n', '') || $${paramCount}`);
      values.push(`Skipped: ${reason}`);
      paramCount++;
    }

    values.push(id);

    const query = `
      UPDATE services
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToService(result.rows[0]);
  }

  async markInProgress(id: string): Promise<Service | null> {
    const query = `
      UPDATE services
      SET status = 'in_progress',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToService(result.rows[0]);
  }

  private mapRowToService(row: any): Service {
    return {
      id: row.id,
      customer_id: row.customer_id,
      route_id: row.route_id || undefined,
      technician_id: row.technician_id || undefined,
      service_type: row.service_type,
      scheduled_date: row.scheduled_date,
      scheduled_time: row.scheduled_time || undefined,
      status: row.status,
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
      service_notes: row.service_notes || undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

export const serviceRepo = new ServiceRepository();
