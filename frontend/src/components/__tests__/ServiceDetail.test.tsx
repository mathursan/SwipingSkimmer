import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ServiceDetail from '../ServiceDetail';
import { Service } from '../../types/service';

const mockService: Service = {
  id: '1',
  customer_id: 'customer-1',
  service_type: 'regular',
  scheduled_date: '2026-01-20',
  scheduled_time: '10:00:00',
  status: 'scheduled',
  service_notes: 'Test service notes',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('ServiceDetail', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnViewCustomer = vi.fn();

  const defaultProps = {
    service: mockService,
    customerName: 'John Doe',
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onBack: mockOnBack,
    onViewCustomer: mockOnViewCustomer,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render service information', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    expect(screen.getByText('Service Information')).toBeInTheDocument();
    expect(screen.getByText('regular')).toBeInTheDocument();
    expect(screen.getByText('scheduled')).toBeInTheDocument();
  });

  it('should display customer name', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display service notes when present', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    expect(screen.getByText('Service Notes')).toBeInTheDocument();
    expect(screen.getByText('Test service notes')).toBeInTheDocument();
  });

  it('should not display service notes section when notes are empty', () => {
    const serviceWithoutNotes = { ...mockService, service_notes: undefined };
    render(<ServiceDetail {...defaultProps} service={serviceWithoutNotes} />);
    
    expect(screen.queryByText('Service Notes')).not.toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    expect(screen.getByText('← Back to List')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    screen.getByText('← Back to List').click();
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    screen.getByText('Edit').click();
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ServiceDetail {...defaultProps} />);
    
    screen.getByText('Delete').click();
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should display completed_at when service is completed', () => {
    const completedService = {
      ...mockService,
      status: 'completed' as const,
      completed_at: '2026-01-20T14:00:00Z',
    };
    render(<ServiceDetail {...defaultProps} service={completedService} />);
    
    expect(screen.getByText('Completed At:')).toBeInTheDocument();
  });

  it('should handle missing optional fields', () => {
    const minimalService = {
      ...mockService,
      scheduled_time: undefined,
      service_notes: undefined,
      route_id: undefined,
      technician_id: undefined,
    };
    render(<ServiceDetail {...defaultProps} service={minimalService} />);
    
    expect(screen.getByText('Service Information')).toBeInTheDocument();
  });
});
