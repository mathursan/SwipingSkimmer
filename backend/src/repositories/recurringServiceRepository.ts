import { pool } from '../config/database';
import { RecurringService, RecurringServiceCreateInput, RecurringServiceUpdateInput, RecurringServiceFilters } from '../models/RecurringService';
import { randomUUID } from 'crypto';

export class RecurringServiceRepository {
  async findAll(filters: RecurringServiceFilters = {}): Promise<RecurringService[]> {
    let query = `SELECT * FROM recurring_services`;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Customer filter
    if (filters.customer_id) {
      conditions.push(`customer_id = $${paramCount}`);
      params.push(filters.customer_id);
      paramCount++;
    }

    // Active status filter
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${paramCount}`);
      params.push(filters.is_active);
      paramCount++;
    }

    // Frequency filter
    if (filters.frequency) {
      conditions.push(`frequency = $${paramCount}`);
      params.push(filters.frequency);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map(row => this.mapRowToRecurringService(row));
  }

  async findById(id: string): Promise<RecurringService | null> {
    const result = await pool.query(
      'SELECT * FROM recurring_services WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToRecurringService(result.rows[0]);
  }

  async create(data: RecurringServiceCreateInput): Promise<RecurringService> {
    const id = randomUUID();
    const query = `
      INSERT INTO recurring_services (
        id, customer_id, service_type, frequency, day_of_week, day_of_month,
        start_date, end_date, technician_id, scheduled_time, service_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const params = [
      id,
      data.customer_id,
      data.service_type,
      data.frequency,
      data.day_of_week ?? null,
      data.day_of_month ?? null,
      data.start_date,
      data.end_date ?? null,
      data.technician_id ?? null,
      data.scheduled_time ?? null,
      data.service_notes ?? null,
    ];

    const result = await pool.query(query, params);
    return this.mapRowToRecurringService(result.rows[0]);
  }

  async update(id: string, data: RecurringServiceUpdateInput): Promise<RecurringService | null> {
    // First check if exists
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (data.frequency !== undefined) {
      updates.push(`frequency = $${paramCount}`);
      params.push(data.frequency);
      paramCount++;
    }

    if (data.day_of_week !== undefined) {
      updates.push(`day_of_week = $${paramCount}`);
      params.push(data.day_of_week ?? null);
      paramCount++;
    }

    if (data.day_of_month !== undefined) {
      updates.push(`day_of_month = $${paramCount}`);
      params.push(data.day_of_month ?? null);
      paramCount++;
    }

    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      params.push(data.start_date);
      paramCount++;
    }

    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      params.push(data.end_date === null ? null : data.end_date);
      paramCount++;
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      params.push(data.is_active);
      paramCount++;
    }

    if (data.technician_id !== undefined) {
      updates.push(`technician_id = $${paramCount}`);
      params.push(data.technician_id ?? null);
      paramCount++;
    }

    if (data.scheduled_time !== undefined) {
      updates.push(`scheduled_time = $${paramCount}`);
      params.push(data.scheduled_time ?? null);
      paramCount++;
    }

    if (data.service_notes !== undefined) {
      updates.push(`service_notes = $${paramCount}`);
      params.push(data.service_notes ?? null);
      paramCount++;
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE recurring_services
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return this.mapRowToRecurringService(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM recurring_services WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  async activate(id: string): Promise<RecurringService | null> {
    const query = `
      UPDATE recurring_services
      SET is_active = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToRecurringService(result.rows[0]);
  }

  async deactivate(id: string): Promise<RecurringService | null> {
    const query = `
      UPDATE recurring_services
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToRecurringService(result.rows[0]);
  }

  private mapRowToRecurringService(row: any): RecurringService {
    return {
      id: row.id,
      customer_id: row.customer_id,
      service_type: row.service_type,
      frequency: row.frequency,
      day_of_week: row.day_of_week ?? undefined,
      day_of_month: row.day_of_month ?? undefined,
      start_date: new Date(row.start_date),
      end_date: row.end_date ? new Date(row.end_date) : undefined,
      is_active: row.is_active,
      technician_id: row.technician_id ?? undefined,
      scheduled_time: row.scheduled_time ?? undefined,
      service_notes: row.service_notes ?? undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

export const recurringServiceRepo = new RecurringServiceRepository();
