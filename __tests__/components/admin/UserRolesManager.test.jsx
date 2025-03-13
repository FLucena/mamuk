import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserRolesManager from '@/components/admin/UserRolesManager';

// Mock the toast function
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('UserRolesManager Component', () => {
  // Mock props
  const mockOnRolesUpdated = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, roles: ['customer', 'admin'] }),
    });
  });
  
  it('should render correctly with a user having a single role', () => {
    render(
      <UserRolesManager 
        userId="user-123" 
        initialRoles={['customer']} 
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // Check if the component renders the title
    expect(screen.getByText('Roles del Usuario')).toBeInTheDocument();
    
    // Check if the component renders the role buttons
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Entrenador')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    
    // Check that only the customer role is active (has a checkmark)
    const customerButton = screen.getByText('Cliente');
    expect(customerButton.textContent).toContain('✓');
    
    // Check that other roles don't have checkmarks
    const adminButton = screen.getByText('Administrador');
    const coachButton = screen.getByText('Entrenador');
    expect(adminButton.textContent).not.toContain('✓');
    expect(coachButton.textContent).not.toContain('✓');
  });
  
  it('should render correctly with a user having multiple roles', () => {
    render(
      <UserRolesManager 
        userId="user-456" 
        initialRoles={['admin', 'coach', 'customer']} 
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // Check that all roles are active (have checkmarks)
    const adminButton = screen.getByText('Administrador');
    const coachButton = screen.getByText('Entrenador');
    const customerButton = screen.getByText('Cliente');
    
    expect(adminButton.textContent).toContain('✓');
    expect(coachButton.textContent).toContain('✓');
    expect(customerButton.textContent).toContain('✓');
  });
  
  it('should call onRolesUpdated when a role is toggled', async () => {
    render(
      <UserRolesManager 
        userId="user-123" 
        initialRoles={['customer']} 
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // Toggle the admin role by clicking the button
    fireEvent.click(screen.getByText('Administrador'));
    
    // Check if fetch was called with the correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/admin/users/user-123/roles`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ roles: ['customer', 'admin'] }),
        })
      );
    });
    
    // Check if onRolesUpdated was called with the updated roles
    expect(mockOnRolesUpdated).toHaveBeenCalledWith(['customer', 'admin']);
  });
  
  it('should call onRolesUpdated when a role is removed', async () => {
    render(
      <UserRolesManager 
        userId="user-456" 
        initialRoles={['admin', 'coach', 'customer']} 
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // Mock the response for removing a role
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, roles: ['admin', 'customer'] }),
    });
    
    // Toggle off the coach role by clicking the button
    fireEvent.click(screen.getByText('Entrenador'));
    
    // Check if onRolesUpdated was called with the updated roles
    await waitFor(() => {
      expect(mockOnRolesUpdated).toHaveBeenCalledWith(['admin', 'customer']);
    });
  });
  
  it('should not allow removing the last role', async () => {
    const { toast } = require('react-hot-toast');
    
    render(
      <UserRolesManager 
        userId="user-123" 
        initialRoles={['customer']} 
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // Try to toggle off the only role
    fireEvent.click(screen.getByText('Cliente'));
    
    // Check that error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('El usuario debe tener al menos un rol');
    });
    
    // Check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
    
    // onRolesUpdated should not be called
    expect(mockOnRolesUpdated).not.toHaveBeenCalled();
  });
  
  it('should handle API errors when updating roles', async () => {
    // Mock a failed fetch response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Error al actualizar los roles' }),
    });
    
    const { toast } = require('react-hot-toast');
    
    render(
      <UserRolesManager 
        userId="user-123" 
        initialRoles={['customer']} 
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // Toggle the admin role
    fireEvent.click(screen.getByText('Administrador'));
    
    // Check if fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // The toast.error should have been called
    expect(toast.error).toHaveBeenCalledWith('Error al actualizar los roles');
    
    // onRolesUpdated should not be called on error
    expect(mockOnRolesUpdated).not.toHaveBeenCalled();
  });
  
  it('should handle backward compatibility with legacy role data', async () => {
    render(
      <UserRolesManager 
        userId="user-789" 
        initialRoles={['coach']} // This would come from a user with role: 'coach' converted to roles: ['coach']
        onRolesUpdated={mockOnRolesUpdated}
      />
    );
    
    // The coach role should be active (have a checkmark)
    const coachButton = screen.getByText('Entrenador');
    expect(coachButton.textContent).toContain('✓');
    
    // Other roles should not be active
    const adminButton = screen.getByText('Administrador');
    const customerButton = screen.getByText('Cliente');
    expect(adminButton.textContent).not.toContain('✓');
    expect(customerButton.textContent).not.toContain('✓');
    
    // Mock the response for adding a role
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, roles: ['coach', 'customer'] }),
    });
    
    // Toggle the customer role
    fireEvent.click(screen.getByText('Cliente'));
    
    // Check if onRolesUpdated was called with the updated roles
    await waitFor(() => {
      expect(mockOnRolesUpdated).toHaveBeenCalledWith(['coach', 'customer']);
    });
  });
}); 