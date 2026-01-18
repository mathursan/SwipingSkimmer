const API_BASE_URL = '/api';

export async function fetchCustomers(filters?: {
  search?: string;
  billing_model?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.billing_model) params.append('billing_model', filters.billing_model);

  const response = await fetch(`${API_BASE_URL}/customers?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
}

export async function fetchCustomer(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer');
  }
  return response.json();
}

export async function createCustomer(data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create customer');
  }
  return response.json();
}

export async function updateCustomer(id: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update customer');
  }
  return response.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete customer');
  }
}

export async function fetchCustomerHistory(id: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}/history`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer history');
  }
  return response.json();
}

// Service API functions
export async function fetchServices(filters?: {
  customer_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.customer_id) params.append('customer_id', filters.customer_id);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await fetch(`${API_BASE_URL}/services?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
}

export async function fetchService(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/services/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch service');
  }
  return response.json();
}

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete service');
  }
}

export async function createService(data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create service' }));
    throw new Error(error.error || 'Failed to create service');
  }
  return response.json();
}

export async function updateService(id: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update service' }));
    throw new Error(error.error || 'Failed to update service');
  }
  return response.json();
}
