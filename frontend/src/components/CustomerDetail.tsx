import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { fetchCustomerHistory } from '../services/api';
import './CustomerDetail.css';

interface CustomerDetailProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onViewService?: (serviceId: string) => void;
  onViewAllServices?: (customerId: string) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  onEdit,
  onDelete,
  onBack,
  onViewService,
  onViewAllServices,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const DISPLAY_LIMIT = 10; // Show last 10 services

  useEffect(() => {
    loadHistory();
  }, [customer.id]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchCustomerHistory(customer.id);
      // Limit to last 10 services for display
      setHistory(data.slice(0, DISPLAY_LIMIT));
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'badge-info';
      case 'in_progress': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'skipped': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const truncateNotes = (notes: string | undefined, maxLength: number = 50) => {
    if (!notes) return '-';
    if (notes.length <= maxLength) return notes;
    return notes.substring(0, maxLength) + '...';
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
          <div className="service-history-header">
            <h3>Service History</h3>
            {onViewAllServices && (
              <button
                onClick={() => onViewAllServices(customer.id)}
                className="btn btn-link"
              >
                View All Services
              </button>
            )}
          </div>
          {loadingHistory ? (
            <div className="loading-message">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="empty-message">No service history available</div>
          ) : (
            <>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className={onViewService ? 'clickable-row' : ''}
                      onClick={() => onViewService && onViewService(item.id)}
                    >
                      <td>{new Date(item.scheduled_date).toLocaleDateString()}</td>
                      <td>{item.service_type}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="notes-cell" title={item.service_notes || ''}>
                        {truncateNotes(item.service_notes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {onViewAllServices && (
                <div className="view-all-link">
                  <button
                    onClick={() => onViewAllServices(customer.id)}
                    className="btn btn-link"
                  >
                    View All Services →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
