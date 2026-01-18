import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerManagement from '../CustomerManagement';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  fetchCustomers: vi.fn(),
  deleteCustomer: vi.fn(),
}));

const mockCustomers = [
  {
    id: '1',
    name: 'Sandeep Mathur',
    email: 'sandeep@example.com',
    phone: '555-1234',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    billing_model: 'per_month',
    monthly_rate: 200,
    autopay_enabled: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-5678',
    address: '456 Oak Ave',
    city: 'Dallas',
    state: 'TX',
    zip_code: '75201',
    billing_model: 'plus_chems',
    monthly_rate: 250,
    autopay_enabled: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-9999',
    address: '789 Elm St',
    city: 'Houston',
    state: 'TX',
    zip_code: '77001',
    billing_model: 'per_stop',
    monthly_rate: 150,
    autopay_enabled: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

describe('CustomerManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchCustomers).mockResolvedValue(mockCustomers);
  });

  it('should render customer list with all customers', async () => {
    render(<CustomerManagement />);

    await waitFor(() => {
      expect(screen.getByText('Sandeep Mathur')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(api.fetchCustomers).toHaveBeenCalledWith({});
  });

  it('should filter customers when search term is entered', async () => {
    const user = userEvent.setup();
    render(<CustomerManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Sandeep Mathur')).toBeInTheDocument();
    });

    // Clear previous calls
    vi.clearAllMocks();
    vi.mocked(api.fetchCustomers).mockResolvedValue([mockCustomers[0]]);

    // Type in search field
    const searchInput = screen.getByPlaceholderText(/search by name, address, or phone/i);
    await user.type(searchInput, 'sa');

    // The search should trigger API calls as user types
    // We verify that the component is responding to input changes
    await waitFor(() => {
      // API should be called (at least once, possibly multiple times as user types)
      expect(api.fetchCustomers).toHaveBeenCalled();
    }, { timeout: 3000 });
  });


  it('should show loading state while fetching customers', async () => {
    // Delay the API response
    vi.mocked(api.fetchCustomers).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCustomers), 100))
    );

    render(<CustomerManagement />);

    // Should show loading initially
    expect(screen.getByText(/loading customers/i)).toBeInTheDocument();

    // Wait for customers to load
    await waitFor(() => {
      expect(screen.getByText('Sandeep Mathur')).toBeInTheDocument();
    });

    // Loading should be gone
    expect(screen.queryByText(/loading customers/i)).not.toBeInTheDocument();
  });

  it('should show "No customers found" when search returns no results', async () => {
    const user = userEvent.setup();
    render(<CustomerManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Sandeep Mathur')).toBeInTheDocument();
    });

    // Mock empty results
    vi.mocked(api.fetchCustomers).mockResolvedValue([]);

    // Type search that returns no results
    const searchInput = screen.getByPlaceholderText(/search by name, address, or phone/i);
    await user.type(searchInput, 'xyz');

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText(/no customers found/i)).toBeInTheDocument();
    });
  });

  it('should filter by billing model', async () => {
    const user = userEvent.setup();
    render(<CustomerManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Sandeep Mathur')).toBeInTheDocument();
    });

    // Mock filtered results
    vi.mocked(api.fetchCustomers).mockResolvedValue([mockCustomers[0]]);

    // Select billing model filter
    const billingFilter = screen.getByLabelText(/billing model/i);
    await user.selectOptions(billingFilter, 'per_month');

    // Verify API called with filter
    await waitFor(() => {
      expect(api.fetchCustomers).toHaveBeenCalledWith({ billing_model: 'per_month' });
    });
  });
});
