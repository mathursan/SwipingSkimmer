import React, { useState, useEffect, useCallback } from 'react';
import ServiceList from './ServiceList';
import ServiceDetail from './ServiceDetail';
import ServiceForm from './ServiceForm';
import { Service, ServiceFilters } from '../types/service';
import { fetchServices, fetchService, deleteService } from '../services/api';
import { fetchCustomers } from '../services/api';
import './ServiceManagement.css';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServices(filters);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleFilter = (newFilters: ServiceFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handleSelectService = async (service: Service) => {
    try {
      const fullService = await fetchService(service.id);
      setSelectedService(fullService);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service details');
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setSelectedService(null);
    setShowForm(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setSelectedService(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
    setSelectedService(null);
    loadServices(); // Reload services list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
      if (selectedService?.id === id) {
        setSelectedService(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const handleBack = () => {
    setSelectedService(null);
  };

  const handleViewCustomer = (customerId: string) => {
    // TODO: Navigate to customer detail view
    console.log('View customer:', customerId);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Loading...';
  };

  if (error) {
    return (
      <div className="service-management">
        <div className="error-message">{error}</div>
        <button onClick={() => setError(null)} className="btn btn-secondary">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="service-management">
      {showForm ? (
        <ServiceForm
          service={editingService}
          customers={customers}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : selectedService ? (
        <ServiceDetail
          service={selectedService}
          customerName={getCustomerName(selectedService.customer_id)}
          onEdit={() => handleEdit(selectedService)}
          onDelete={() => handleDelete(selectedService.id)}
          onBack={handleBack}
          onViewCustomer={handleViewCustomer}
        />
      ) : (
        <ServiceList
          services={services}
          loading={loading}
          onSelect={handleSelectService}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onFilter={handleFilter}
          filters={filters}
          customers={customers}
        />
      )}
    </div>
  );
};

export default ServiceManagement;
