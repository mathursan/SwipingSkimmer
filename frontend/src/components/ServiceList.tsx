import React from 'react';
import { Service, ServiceFilters } from '../types/service';
import './ServiceList.css';

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  onSelect: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onFilter: (filters: ServiceFilters) => void;
  filters: ServiceFilters;
  customers: Array<{ id: string; name: string }>; // For customer filter dropdown
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
  onFilter,
  filters,
  customers,
}) => {
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilter({ status: e.target.value as ServiceFilters['status'] || undefined });
  };

  const handleCustomerFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilter({ customer_id: e.target.value || undefined });
  };

  const handleStartDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter({ start_date: e.target.value || undefined });
  };

  const handleEndDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter({ end_date: e.target.value || undefined });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
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

  if (loading) {
    return <div className="loading">Loading services...</div>;
  }

  return (
    <div className="service-list">
      <div className="service-list-header">
        <button onClick={onCreate} className="btn btn-primary">
          + Create New Service
        </button>
      </div>
      <div className="service-list-filters">
        <div className="filter-box">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={handleStatusFilter}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
        <div className="filter-box">
          <label htmlFor="customer-filter">Customer:</label>
          <select
            id="customer-filter"
            value={filters.customer_id || ''}
            onChange={handleCustomerFilter}
            className="filter-select"
          >
            <option value="">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={filters.start_date || ''}
            onChange={handleStartDateFilter}
            className="filter-input"
          />
        </div>
        <div className="filter-box">
          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            value={filters.end_date || ''}
            onChange={handleEndDateFilter}
            className="filter-input"
          />
        </div>
      </div>

      {services.length === 0 ? (
        <div className="no-services">No services found</div>
      ) : (
        <table className="service-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} onClick={() => onSelect(service)}>
                <td>{formatDate(service.scheduled_date)}</td>
                <td>{formatTime(service.scheduled_time) || '-'}</td>
                <td>{getCustomerName(service.customer_id)}</td>
                <td>{service.service_type}</td>
                <td>
                  <span className={getStatusBadgeClass(service.status)}>
                    {service.status.replace('_', ' ')}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(service)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(service.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ServiceList;
