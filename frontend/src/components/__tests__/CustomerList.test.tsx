import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerList from '../CustomerList';
import { Customer, CustomerFilters } from '../../types/customer';

const mockCustomers: Customer[] = [
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
];

describe('CustomerList', () => {
  const mockOnSelect = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnFilter = vi.fn();

  const defaultProps = {
    customers: mockCustomers,
    loading: false,
    onSelect: mockOnSelect,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onSearch: mockOnSearch,
    onFilter: mockOnFilter,
    filters: {} as CustomerFilters,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all customers in a table', () => {
    render(<CustomerList {...defaultProps} />);

    expect(screen.getByText('Sandeep Mathur')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('sandeep@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should call onSearch when user types in search field', async () => {
    const user = userEvent.setup();
    render(<CustomerList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search by name, address, or phone/i);
    await user.type(searchInput, 'sa');

    expect(mockOnSearch).toHaveBeenCalledWith('sa');
  });

  it('should display search term from filters prop', () => {
    render(<CustomerList {...defaultProps} filters={{ search: 'test search' }} />);

    const searchInput = screen.getByPlaceholderText(/search by name, address, or phone/i) as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
  });

  it('should sync search input when filters.search changes', () => {
    const { rerender } = render(<CustomerList {...defaultProps} filters={{ search: 'initial' }} />);

    const searchInput = screen.getByPlaceholderText(/search by name, address, or phone/i) as HTMLInputElement;
    expect(searchInput.value).toBe('initial');

    rerender(<CustomerList {...defaultProps} filters={{ search: 'updated' }} />);
    expect(searchInput.value).toBe('updated');
  });

  it('should call onFilter when billing model is selected', async () => {
    const user = userEvent.setup();
    render(<CustomerList {...defaultProps} />);

    const billingFilter = screen.getByLabelText(/billing model/i);
    await user.selectOptions(billingFilter, 'per_month');

    expect(mockOnFilter).toHaveBeenCalledWith({ billing_model: 'per_month' });
  });

  it('should show loading state when loading is true', () => {
    render(<CustomerList {...defaultProps} loading={true} />);

    expect(screen.getByText(/loading customers/i)).toBeInTheDocument();
    expect(screen.queryByText('Sandeep Mathur')).not.toBeInTheDocument();
  });

  it('should show "No customers found" when customers array is empty', () => {
    render(<CustomerList {...defaultProps} customers={[]} />);

    expect(screen.getByText(/no customers found/i)).toBeInTheDocument();
    expect(screen.queryByText('Sandeep Mathur')).not.toBeInTheDocument();
  });

  it('should call onSelect when a customer row is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerList {...defaultProps} />);

    const customerRow = screen.getByText('Sandeep Mathur').closest('tr');
    if (customerRow) {
      await user.click(customerRow);
      expect(mockOnSelect).toHaveBeenCalledWith(mockCustomers[0]);
    }
  });

  it('should call onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerList {...defaultProps} />);

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('should call onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerList {...defaultProps} />);

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should display "-" for missing phone numbers', () => {
    const customersWithoutPhone = [
      { ...mockCustomers[0], phone: null },
    ];
    render(<CustomerList {...defaultProps} customers={customersWithoutPhone} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display "-" for missing email addresses', () => {
    const customersWithoutEmail = [
      { ...mockCustomers[0], email: null },
    ];
    render(<CustomerList {...defaultProps} customers={customersWithoutEmail} />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });
});
