import React, { useState, useEffect } from 'react';
import { Customer, CustomerFilters } from '../types/customer';
import './CustomerList.css';

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onSearch: (searchTerm: string) => void;
  onFilter: (filters: CustomerFilters) => void;
  filters: CustomerFilters;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  onSelect,
  onEdit,
  onDelete,
  onSearch,
  onFilter,
  filters,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Sync local searchTerm with filters from parent
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleBillingModelFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilter({ billing_model: e.target.value || undefined });
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customer-list">
      <div className="customer-list-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, address, or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <label htmlFor="billing-model">Billing Model:</label>
          <select
            id="billing-model"
            value={filters.billing_model || ''}
            onChange={handleBillingModelFilter}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="per_month">Per Month</option>
            <option value="plus_chems">Plus Chemicals</option>
            <option value="per_stop">Per Stop</option>
            <option value="with_chems">With Chemicals</option>
          </select>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="no-customers">No customers found</div>
      ) : (
        <table className="customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Billing Model</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} onClick={() => onSelect(customer)}>
                <td>{customer.name}</td>
                <td>{customer.address}</td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.email || '-'}</td>
                <td>{customer.billing_model || '-'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(customer)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(customer.id)}
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

export default CustomerList;
