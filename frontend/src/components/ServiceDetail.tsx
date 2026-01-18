import React from 'react';
import { Service } from '../types/service';
import './ServiceDetail.css';

interface ServiceDetailProps {
  service: Service;
  customerName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onViewCustomer?: (customerId: string) => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({
  service,
  customerName,
  onEdit,
  onDelete,
  onBack,
  onViewCustomer,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not scheduled';
    return timeString.substring(0, 5); // HH:MM
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-badge status-completed';
      case 'in_progress':
        return 'status-badge status-in-progress';
      case 'skipped':
        return 'status-badge status-skipped';
      default:
        return 'status-badge status-scheduled';
    }
  };

  return (
    <div className="service-detail">
      <div className="service-detail-header">
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

      <div className="service-detail-content">
        <div className="detail-section">
          <h3>Service Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Status:</label>
              <span>
                <span className={getStatusBadgeClass(service.status)}>
                  {service.status.replace('_', ' ')}
                </span>
              </span>
            </div>
            <div className="detail-item">
              <label>Service Type:</label>
              <span>{service.service_type}</span>
            </div>
            <div className="detail-item">
              <label>Scheduled Date:</label>
              <span>{formatDate(service.scheduled_date)}</span>
            </div>
            <div className="detail-item">
              <label>Scheduled Time:</label>
              <span>{formatTime(service.scheduled_time)}</span>
            </div>
            <div className="detail-item">
              <label>Customer:</label>
              <span>
                {customerName || 'Loading...'}
                {onViewCustomer && (
                  <button
                    onClick={() => onViewCustomer(service.customer_id)}
                    className="btn-link"
                  >
                    View Customer
                  </button>
                )}
              </span>
            </div>
            {service.completed_at && (
              <div className="detail-item">
                <label>Completed At:</label>
                <span>{formatDateTime(service.completed_at)}</span>
              </div>
            )}
          </div>
        </div>

        {service.service_notes && (
          <div className="detail-section">
            <h3>Service Notes</h3>
            <p>{service.service_notes}</p>
          </div>
        )}

        <div className="detail-section">
          <h3>Additional Information</h3>
          <div className="detail-grid">
            {service.route_id && (
              <div className="detail-item">
                <label>Route ID:</label>
                <span>{service.route_id}</span>
              </div>
            )}
            {service.technician_id && (
              <div className="detail-item">
                <label>Technician ID:</label>
                <span>{service.technician_id}</span>
              </div>
            )}
            <div className="detail-item">
              <label>Created:</label>
              <span>{formatDateTime(service.created_at)}</span>
            </div>
            <div className="detail-item">
              <label>Last Updated:</label>
              <span>{formatDateTime(service.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
