import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { fetchCustomerHistory } from '../services/api';
import './CustomerDetail.css';

interface CustomerDetailProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  onEdit,
  onDelete,
  onBack,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [customer.id]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchCustomerHistory(customer.id);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="customer-detail">
      <div className="customer-detail-header">
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to List
        </button>
        <div>
          <button onClick={onEdit} className="btn btn-primary">
            Edit
          </button>
          <button onClick={onDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="customer-detail-content">
        <div className="detail-section">
          <h3>Customer Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>{customer.name}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{customer.email || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Phone:</label>
              <span>{customer.phone || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Address:</label>
              <span>
                {customer.address}
                {customer.city && `, ${customer.city}`}
                {customer.state && `, ${customer.state}`}
                {customer.zip_code && ` ${customer.zip_code}`}
              </span>
            </div>
            <div className="detail-item">
              <label>Gate Code:</label>
              <span>{customer.gate_code || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Billing Model:</label>
              <span>{customer.billing_model || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Monthly Rate:</label>
              <span>{customer.monthly_rate ? `$${customer.monthly_rate}` : '-'}</span>
            </div>
            <div className="detail-item">
              <label>AutoPay:</label>
              <span>{customer.autopay_enabled ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {customer.service_notes && (
          <div className="detail-section">
            <h3>Service Notes</h3>
            <p>{customer.service_notes}</p>
          </div>
        )}

        <div className="detail-section">
          <h3>Service History</h3>
          {loadingHistory ? (
            <div>Loading history...</div>
          ) : history.length === 0 ? (
            <div>No service history available</div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Technician</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.scheduled_date).toLocaleDateString()}</td>
                    <td>{item.service_type}</td>
                    <td>{item.status}</td>
                    <td>{item.technician_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
