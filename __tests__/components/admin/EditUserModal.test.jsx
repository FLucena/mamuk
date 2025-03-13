/**
 * Test for EditUserModal component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditUserModal from '@/components/admin/EditUserModal';

// No need to mock the component since we're importing it directly
// and we'll use the actual component for testing

describe('EditUserModal Component', () => {
  // Test data
  const singleRoleUser = {
    id: 'user-1',
    name: 'Single Role User',
    email: 'single@example.com',
    roles: ['customer'],
  };

  const multiRoleUser = {
    id: 'user-2',
    name: 'Multi Role User',
    email: 'multi@example.com',
    roles: ['admin', 'coach', 'customer'],
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with single role user data', () => {
    render(
      <EditUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={singleRoleUser}
      />
    );
    
    // Check if user data is displayed in form
    expect(screen.getByLabelText('Nombre')).toHaveValue(singleRoleUser.name);
    expect(screen.getByLabelText('Email')).toHaveValue(singleRoleUser.email);
    
    // Check if customer role is toggled on
    const customerToggle = screen.getByRole('button', { name: /cliente/i });
    expect(customerToggle.className).toContain('bg-blue-600');
  });

  it('should initialize with multi-role user data', () => {
    render(
      <EditUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={multiRoleUser}
      />
    );
    
    // Check if user data is displayed in form
    expect(screen.getByLabelText('Nombre')).toHaveValue(multiRoleUser.name);
    expect(screen.getByLabelText('Email')).toHaveValue(multiRoleUser.email);
    
    // Check if all roles are toggled on with their respective colors
    const customerToggle = screen.getByRole('button', { name: /cliente/i });
    expect(customerToggle.className).toContain('bg-blue-600');
    
    const coachToggle = screen.getByRole('button', { name: /coach/i });
    expect(coachToggle.className).toContain('bg-green-600');
    
    const adminToggle = screen.getByRole('button', { name: /administrador/i });
    expect(adminToggle.className).toContain('bg-purple-600');
  });

  it('should submit form with correct data for single role user', async () => {
    render(
      <EditUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={singleRoleUser}
      />
    );
    
    // Submit form
    const submitButton = screen.getByText('Guardar cambios');
    fireEvent.click(submitButton);
    
    // Check if onConfirm was called with correct data
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(expect.objectContaining({
        name: singleRoleUser.name,
        email: singleRoleUser.email,
        roles: ['customer'],
      }));
    });
  });

  it('should submit form with correct data for multi-role user', async () => {
    render(
      <EditUserModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        user={multiRoleUser}
      />
    );
    
    // Submit form
    const submitButton = screen.getByText('Guardar cambios');
    fireEvent.click(submitButton);
    
    // Check if onConfirm was called with correct data
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(expect.objectContaining({
        name: multiRoleUser.name,
        email: multiRoleUser.email,
        roles: ['admin', 'coach', 'customer'],
      }));
    });
  });
}); 