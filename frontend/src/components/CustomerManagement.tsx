import React, { useState, useEffect, useCallback } from 'react';
import CustomerList from './CustomerList';
import CustomerDetail from './CustomerDetail';
import CustomerForm from './CustomerForm';
import { Customer, CustomerFilters } from '../types/customer';
import { fetchCustomers, deleteCustomer } from '../services/api';
import './CustomerManagement.css';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers(filters);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);


  const handleSearch = (searchTerm: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, search: searchTerm || undefined }));
  };

  const handleFilter = (newFilters: CustomerFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(false);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    try {
      await deleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    loadCustomers();
  };

  const handleBack = () => {
    setSelectedCustomer(null);
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleViewService = (serviceId: string) => {
    // Navigate to services tab and show service detail
    // This will be handled by the parent App component
    // For now, we'll dispatch a custom event that App can listen to
    window.dispatchEvent(new CustomEvent('navigate-to-service', { detail: { serviceId } }));
  };

  const handleViewAllServices = (customerId: string) => {
    // Navigate to services tab with customer filter
    window.dispatchEvent(new CustomEvent('navigate-to-services', { detail: { customerId } }));
  };

  return (
    <div className="customer-management">
      <div className="customer-management-header">
        <h2>Customer Management</h2>
        <button onClick={handleCreate} className="btn btn-primary">
          Add New Customer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm ? (
        <CustomerForm
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
          onCancel={handleBack}
        />
      ) : selectedCustomer ? (
        <CustomerDetail
          customer={selectedCustomer}
          onEdit={() => handleEdit(selectedCustomer)}
          onDelete={() => handleDelete(selectedCustomer.id)}
          onBack={handleBack}
          onViewService={handleViewService}
          onViewAllServices={handleViewAllServices}
        />
      ) : (
        <CustomerList
          customers={customers}
          loading={loading}
          onSelect={handleSelectCustomer}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
