import React, { useState, useEffect } from 'react';
import { Customer, CustomerCreateInput } from '../types/customer';
import { createCustomer, updateCustomer } from '../services/api';
import './CustomerForm.css';

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CustomerCreateInput>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    gate_code: '',
    service_notes: '',
    billing_model: 'per_month',
    monthly_rate: 0,
    autopay_enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address,
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        gate_code: customer.gate_code || '',
        service_notes: customer.service_notes || '',
        billing_model: customer.billing_model || 'per_month',
        monthly_rate: customer.monthly_rate || 0,
        autopay_enabled: customer.autopay_enabled,
      });
    }
  }, [customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (customer) {
        await updateCustomer(customer.id, formData);
      } else {
        await createCustomer(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-form">
      <div className="customer-form-header">
        <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Address</h3>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="zip_code">Zip Code</label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gate_code">Gate Code</label>
              <input
                type="text"
                id="gate_code"
                name="gate_code"
                value={formData.gate_code}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Billing Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="billing_model">Billing Model</label>
              <select
                id="billing_model"
                name="billing_model"
                value={formData.billing_model}
                onChange={handleChange}
              >
                <option value="per_month">Per Month</option>
                <option value="plus_chems">Plus Chemicals</option>
                <option value="per_stop">Per Stop</option>
                <option value="with_chems">With Chemicals</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="monthly_rate">Monthly Rate</label>
              <input
                type="number"
                id="monthly_rate"
                name="monthly_rate"
                value={formData.monthly_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="autopay_enabled" className="checkbox-label">
                <input
                  type="checkbox"
                  id="autopay_enabled"
                  name="autopay_enabled"
                  checked={formData.autopay_enabled}
                  onChange={handleChange}
                />
                Enable AutoPay
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Service Notes</h3>
          <div className="form-group form-group-full">
            <textarea
              id="service_notes"
              name="service_notes"
              value={formData.service_notes}
              onChange={handleChange}
              rows={4}
              placeholder="Enter any special service instructions or notes..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
