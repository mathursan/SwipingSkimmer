import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ServiceList from '../ServiceList';
import { Service } from '../../types/service';

const mockServices: Service[] = [
  {
    id: '1',
    customer_id: 'customer-1',
    service_type: 'regular',
    scheduled_date: '2026-01-20',
    scheduled_time: '10:00:00',
    status: 'scheduled',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    customer_id: 'customer-2',
    service_type: 'repair',
    scheduled_date: '2026-01-21',
    status: 'completed',
    completed_at: '2026-01-21T14:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const mockCustomers = [
  { id: 'customer-1', name: 'John Doe' },
  { id: 'customer-2', name: 'Jane Smith' },
];

describe('ServiceList', () => {
  const mockOnSelect = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnFilter = vi.fn();

  const defaultProps = {
    services: mockServices,
    loading: false,
    onSelect: mockOnSelect,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onFilter: mockOnFilter,
    filters: {},
    customers: mockCustomers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render services list with all services', () => {
    render(<ServiceList {...defaultProps} />);
    
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getByText('regular')).toBeInTheDocument();
    expect(screen.getByText('repair')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<ServiceList {...defaultProps} loading={true} />);
    expect(screen.getByText('Loading services...')).toBeInTheDocument();
  });

  it('should display empty state when no services', () => {
    render(<ServiceList {...defaultProps} services={[]} />);
    expect(screen.getByText('No services found')).toBeInTheDocument();
  });

  it('should render all table columns', () => {
    render(<ServiceList {...defaultProps} />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render status filters', () => {
    render(<ServiceList {...defaultProps} />);
    
    const statusFilter = screen.getByLabelText('Status:');
    expect(statusFilter).toBeInTheDocument();
  });

  it('should render customer filter', () => {
    render(<ServiceList {...defaultProps} />);
    
    const customerFilter = screen.getByLabelText('Customer:');
    expect(customerFilter).toBeInTheDocument();
  });

  it('should render date filters', () => {
    render(<ServiceList {...defaultProps} />);
    
    expect(screen.getByLabelText('Start Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date:')).toBeInTheDocument();
  });

  it('should call onSelect when row is clicked', () => {
    render(<ServiceList {...defaultProps} />);
    
    const rows = screen.getAllByRole('row');
    rows[1].click(); // Click first data row (skip header)
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockServices[0]);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ServiceList {...defaultProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    editButtons[0].click();
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ServiceList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    deleteButtons[0].click();
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should display status badges with correct classes', () => {
    render(<ServiceList {...defaultProps} />);
    
    expect(screen.getByText('scheduled')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });
});
