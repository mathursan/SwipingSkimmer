import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerDetail from '../CustomerDetail';
import * as api from '../../services/api';
import { Customer } from '../../types/customer';

// Mock the API module
vi.mock('../../services/api', () => ({
  fetchCustomerHistory: vi.fn(),
}));

const mockCustomer: Customer = {
  id: 'customer-1',
  name: 'John Doe',
  email: 'john@example.com',
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
};

const mockServiceHistory = [
  {
    id: 'service-1',
    customer_id: 'customer-1',
    service_type: 'regular',
    scheduled_date: '2026-01-20',
    scheduled_time: '10:00:00',
    status: 'completed',
    service_notes: 'Pool cleaned and chemicals balanced',
    created_at: '2026-01-19T10:00:00Z',
    updated_at: '2026-01-20T10:30:00Z',
  },
  {
    id: 'service-2',
    customer_id: 'customer-1',
    service_type: 'repair',
    scheduled_date: '2026-01-15',
    scheduled_time: '14:00:00',
    status: 'completed',
    service_notes: 'Fixed pump issue',
    created_at: '2026-01-14T10:00:00Z',
    updated_at: '2026-01-15T14:30:00Z',
  },
  {
    id: 'service-3',
    customer_id: 'customer-1',
    service_type: 'regular',
    scheduled_date: '2026-01-10',
    status: 'scheduled',
    created_at: '2026-01-09T10:00:00Z',
    updated_at: '2026-01-09T10:00:00Z',
  },
];

describe('CustomerDetail', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnViewService = vi.fn();
  const mockOnViewAllServices = vi.fn();

  const defaultProps = {
    customer: mockCustomer,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchCustomerHistory as any).mockResolvedValue(mockServiceHistory);
  });

  it('should render customer information', () => {
    render(<CustomerDetail {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
  });

  it('should load and display service history', async () => {
    render(<CustomerDetail {...defaultProps} />);

    await waitFor(() => {
      expect(api.fetchCustomerHistory).toHaveBeenCalledWith('customer-1');
    });

    await waitFor(() => {
      expect(screen.getAllByText('regular').length).toBeGreaterThan(0);
      expect(screen.getByText('repair')).toBeInTheDocument();
      expect(screen.getAllByText('completed').length).toBeGreaterThan(0);
      expect(screen.getByText('scheduled')).toBeInTheDocument();
    });
  });

  it('should display empty state when no service history', async () => {
    (api.fetchCustomerHistory as any).mockResolvedValueOnce([]);
    render(<CustomerDetail {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No service history available')).toBeInTheDocument();
    });
  });

  it('should display loading message while loading history', () => {
    (api.fetchCustomerHistory as any).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<CustomerDetail {...defaultProps} />);

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('should display service notes preview in history table', async () => {
    render(<CustomerDetail {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Pool cleaned and chemicals balanced/)).toBeInTheDocument();
      expect(screen.getByText(/Fixed pump issue/)).toBeInTheDocument();
    });
  });

  it('should truncate long service notes', async () => {
    const longNotes = 'A'.repeat(100);
    (api.fetchCustomerHistory as any).mockResolvedValueOnce([
      {
        ...mockServiceHistory[0],
        service_notes: longNotes,
      },
    ]);

    render(<CustomerDetail {...defaultProps} />);

    await waitFor(() => {
      const notesCell = screen.getByTitle(longNotes);
      expect(notesCell.textContent).toMatch(/\.\.\.$/);
    });
  });

  it('should display status badges with correct classes', async () => {
    render(<CustomerDetail {...defaultProps} />);

    await waitFor(() => {
      const completedBadges = screen.getAllByText('completed');
      expect(completedBadges.length).toBeGreaterThan(0);
      expect(completedBadges[0]).toHaveClass('badge-success');
      
      const scheduledBadge = screen.getByText('scheduled');
      expect(scheduledBadge).toHaveClass('badge-info');
    });
  });

  it('should call onViewService when service row is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerDetail {...defaultProps} onViewService={mockOnViewService} />);

    await waitFor(() => {
      expect(screen.getByText('Pool cleaned and chemicals balanced')).toBeInTheDocument();
    });

    const serviceRow = screen.getByText('Pool cleaned and chemicals balanced').closest('tr');
    if (serviceRow) {
      await user.click(serviceRow);
      expect(mockOnViewService).toHaveBeenCalledWith('service-1');
    }
  });

  it('should call onViewAllServices when "View All Services" button is clicked', async () => {
    render(<CustomerDetail {...defaultProps} onViewAllServices={mockOnViewAllServices} />);

    await waitFor(() => {
      expect(screen.getByText('View All Services')).toBeInTheDocument();
    });

    const viewAllButton = screen.getByText('View All Services');
    await userEvent.click(viewAllButton);

    expect(mockOnViewAllServices).toHaveBeenCalledWith('customer-1');
  });

  it('should display "View All Services" link at bottom of table', async () => {
    render(<CustomerDetail {...defaultProps} onViewAllServices={mockOnViewAllServices} />);

    await waitFor(() => {
      const viewAllLinks = screen.getAllByText(/View All Services/);
      expect(viewAllLinks.length).toBeGreaterThan(0);
    });
  });

  it('should limit displayed services to 10', async () => {
    const manyServices = Array.from({ length: 15 }, (_, i) => ({
      ...mockServiceHistory[0],
      id: `service-${i}`,
      scheduled_date: `2026-01-${20 + i}`,
    }));

    (api.fetchCustomerHistory as any).mockResolvedValueOnce(manyServices);
    render(<CustomerDetail {...defaultProps} />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Header row + 10 service rows = 11 rows
      expect(rows.length).toBe(11);
    });
  });

  it('should call onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerDetail {...defaultProps} />);

    const backButton = screen.getByText(/Back to List/i);
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerDetail {...defaultProps} />);

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<CustomerDetail {...defaultProps} />);

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });
});
