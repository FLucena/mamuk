import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserRolesManager from '@/components/admin/UserRolesManager';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('UserRolesManager', () => {
  const mockProps = {
    userId: '123',
    initialRoles: ['customer'],
    onRolesUpdated: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  it('renders correctly with initial roles', () => {
    render(<UserRolesManager {...mockProps} />);
    
    // Check title
    expect(screen.getByText('Roles del Usuario')).toBeInTheDocument();
    
    // Check role buttons
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Entrenador')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    
    // Check that customer role is active (has a checkmark)
    const customerButton = screen.getByText('Cliente');
    expect(customerButton.textContent).toContain('✓');
  });

  it('toggles role when clicked', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ roles: ['customer', 'coach'] })
    });

    render(<UserRolesManager {...mockProps} />);
    
    // Click on coach role
    fireEvent.click(screen.getByText('Entrenador'));
    
    // Check that fetch was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/admin/users/123/roles`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roles: ['customer', 'coach'] }),
        })
      );
    });
    
    // Check that onRolesUpdated was called with updated roles
    expect(mockProps.onRolesUpdated).toHaveBeenCalledWith(['customer', 'coach']);
    
    // Check that success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Roles actualizados correctamente');
  });

  it('removes role when clicked again', async () => {
    // Start with both customer and coach roles
    const propsWithMultipleRoles = {
      ...mockProps,
      initialRoles: ['customer', 'coach']
    };
    
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ roles: ['customer'] })
    });

    render(<UserRolesManager {...propsWithMultipleRoles} />);
    
    // Click on coach role to remove it
    fireEvent.click(screen.getByText('Entrenador'));
    
    // Check that fetch was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/admin/users/123/roles`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roles: ['customer'] }),
        })
      );
    });
    
    // Check that onRolesUpdated was called with updated roles
    expect(mockProps.onRolesUpdated).toHaveBeenCalledWith(['customer']);
  });

  it('shows error toast when API call fails', async () => {
    // Mock failed API response
    global.fetch.mockRejectedValueOnce(new Error('API error'));

    render(<UserRolesManager {...mockProps} />);
    
    // Click on admin role
    fireEvent.click(screen.getByText('Administrador'));
    
    // Check that error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar los roles');
    });
  });

  it('prevents removing the last role', async () => {
    render(<UserRolesManager {...mockProps} />);
    
    // Try to remove the only role (customer)
    fireEvent.click(screen.getByText('Cliente'));
    
    // Check that error toast was shown
    expect(toast.error).toHaveBeenCalledWith('El usuario debe tener al menos un rol');
    
    // Check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });
}); 