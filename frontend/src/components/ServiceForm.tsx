import React, { useState, useEffect } from 'react';
import { Service } from '../types/service';
import { createService, updateService } from '../services/api';
import './ServiceForm.css';

interface ServiceFormProps {
  service?: Service | null;
  customers: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ServiceFormData {
  customer_id: string;
  service_type: 'regular' | 'repair' | 'one_off';
  scheduled_date: string;
  scheduled_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  service_notes: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  customers,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    customer_id: '',
    service_type: 'regular',
    scheduled_date: '',
    scheduled_time: '',
    status: 'scheduled',
    service_notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      // Pre-populate form when editing
      const scheduledDate = service.scheduled_date.split('T')[0]; // Extract YYYY-MM-DD
      const scheduledTime = service.scheduled_time 
        ? service.scheduled_time.substring(0, 5) // Extract HH:MM
        : '';
      
      setFormData({
        customer_id: service.customer_id,
        service_type: service.service_type,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: service.status,
        service_notes: service.service_notes || '',
      });
    } else {
      // Reset form for new service
      setFormData({
        customer_id: '',
        service_type: 'regular',
        scheduled_date: '',
        scheduled_time: '',
        status: 'scheduled',
        service_notes: '',
      });
    }
    setErrors({});
    setError(null);
  }, [service]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.service_type) {
      newErrors.service_type = 'Service type is required';
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Scheduled date is required';
    } else {
      // Validate date is not in the past (optional business rule)
      const selectedDate = new Date(formData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        // Allow past dates for now, but could add validation if needed
      }
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Validate time format if provided
    if (formData.scheduled_time && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.scheduled_time)) {
      newErrors.scheduled_time = 'Time must be in HH:MM format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData: any = {
        customer_id: formData.customer_id,
        service_type: formData.service_type,
        scheduled_date: formData.scheduled_date,
        status: formData.status,
      };

      // Add optional fields only if they have values
      if (formData.scheduled_time) {
        submitData.scheduled_time = `${formData.scheduled_time}:00`; // Add seconds
      }
      if (formData.service_notes) {
        submitData.service_notes = formData.service_notes;
      }

      if (service) {
        await updateService(service.id, submitData);
      } else {
        await createService(submitData);
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-form">
      <div className="service-form-header">
        <h2>{service ? 'Edit Service' : 'Create New Service'}</h2>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customer_id">
            Customer <span className="required">*</span>
          </label>
          <select
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className={errors.customer_id ? 'error' : ''}
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customer_id && (
            <span className="field-error">{errors.customer_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="service_type">
            Service Type <span className="required">*</span>
          </label>
          <select
            id="service_type"
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            className={errors.service_type ? 'error' : ''}
          >
            <option value="regular">Regular</option>
            <option value="repair">Repair</option>
            <option value="one_off">One Off</option>
          </select>
          {errors.service_type && (
            <span className="field-error">{errors.service_type}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduled_date">
              Scheduled Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className={errors.scheduled_date ? 'error' : ''}
            />
            {errors.scheduled_date && (
              <span className="field-error">{errors.scheduled_date}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="scheduled_time">Scheduled Time</label>
            <input
              type="time"
              id="scheduled_time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className={errors.scheduled_time ? 'error' : ''}
            />
            {errors.scheduled_time && (
              <span className="field-error">{errors.scheduled_time}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">
            Status <span className="required">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={errors.status ? 'error' : ''}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
          {errors.status && (
            <span className="field-error">{errors.status}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="service_notes">Service Notes</label>
          <textarea
            id="service_notes"
            name="service_notes"
            value={formData.service_notes}
            onChange={handleChange}
            rows={4}
            placeholder="Enter any notes about this service..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
