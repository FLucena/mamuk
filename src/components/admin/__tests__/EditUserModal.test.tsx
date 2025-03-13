import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditUserModal from '../EditUserModal';
import '@testing-library/jest-dom';
import { waitForAnimations } from '@/test/setup';

describe('EditUserModal', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['customer']
  };

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    user: mockUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with user data', async () => {
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Check if modal title is present
      expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
      
      // Check if form fields are populated with user data
      expect(screen.getByLabelText('Nombre')).toHaveValue(mockUser.name);
      expect(screen.getByLabelText('Email')).toHaveValue(mockUser.email);
      
      // Check if role toggles are present
      expect(screen.getByRole('button', { name: /cliente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /coach/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /administrador/i })).toBeInTheDocument();
    });

    it('shows correct role descriptions', () => {
      render(<EditUserModal {...mockProps} />);
      
      expect(screen.getByText('Acceso básico a la plataforma')).toBeInTheDocument();
      expect(screen.getByText('Gestión de clientes y rutinas')).toBeInTheDocument();
      expect(screen.getByText('Acceso completo al sistema')).toBeInTheDocument();
    });

    it('shows primary role indicator for current role', async () => {
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();

      const customerRoleSection = screen.getByText('Cliente').closest('div');
      expect(customerRoleSection).toBeInTheDocument();
      const primaryIndicator = customerRoleSection?.querySelector('[title="Rol principal"]');
      expect(primaryIndicator).toBeVisible();
    });
  });

  describe('Form Interactions', () => {
    it('handles form submission correctly', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Modify form fields
      const nameInput = screen.getByLabelText('Nombre');
      const emailInput = screen.getByLabelText('Email');
      
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');
      await user.clear(emailInput);
      await user.type(emailInput, 'jane@example.com');
      
      // Submit form
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      // Wait for onConfirm to be called
      await waitFor(() => {
        expect(mockProps.onConfirm).toHaveBeenCalledWith({
          name: 'Jane Doe',
          email: 'jane@example.com',
          roles: ['customer']
        });
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Clear required fields
      const nameInput = screen.getByLabelText('Nombre');
      const emailInput = screen.getByLabelText('Email');
      
      await user.clear(nameInput);
      await user.clear(emailInput);
      
      // Try to submit form
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      // Check if form validation prevents submission
      expect(mockProps.onConfirm).not.toHaveBeenCalled();
      
      // Check for HTML5 validation
      expect(nameInput).toBeInvalid();
      expect(emailInput).toBeInvalid();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Enter invalid email
      const emailInput = screen.getByLabelText('Email');
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      
      // Try to submit form
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      // Check if form validation prevents submission
      expect(mockProps.onConfirm).not.toHaveBeenCalled();
      expect(emailInput).toBeInvalid();
    });
  });

  describe('Role Management', () => {
    it('handles role changes correctly', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Toggle coach role
      const coachToggle = screen.getByRole('button', { name: /coach/i });
      await user.click(coachToggle);
      
      // Submit form and check if role was updated
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: expect.arrayContaining(['customer', 'coach'])
          })
        );
      });
    });

    it('handles multiple role selection correctly', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Toggle both coach and admin roles
      const coachToggle = screen.getByRole('button', { name: /coach/i });
      const adminToggle = screen.getByRole('button', { name: /administrador/i });
      
      await user.click(coachToggle);
      await user.click(adminToggle);
      
      // Submit form and check if roles were updated correctly
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: expect.arrayContaining(['customer', 'coach', 'admin'])
          })
        );
      });
    });

    it('prevents removing all roles', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Try to toggle off the only role
      const customerRole = screen.getByRole('button', { name: /cliente/i });
      await user.click(customerRole);
      
      // Submit form and check if the original role remains
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      expect(mockProps.onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['customer']
        })
      );
    });

    it('updates primary role based on role hierarchy', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Add coach role
      await user.click(screen.getByRole('button', { name: /coach/i }));
      expect(screen.getByText('Coach').closest('div')?.querySelector('[title="Rol principal"]')).toBeVisible();
      
      // Add admin role
      await user.click(screen.getByRole('button', { name: /administrador/i }));
      expect(screen.getByText('Administrador').closest('div')?.querySelector('[title="Rol principal"]')).toBeVisible();
      
      // Remove admin role
      await user.click(screen.getByRole('button', { name: /administrador/i }));
      expect(screen.getByText('Coach').closest('div')?.querySelector('[title="Rol principal"]')).toBeVisible();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      // Mock onConfirm to be a slow operation
      const slowOnConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<EditUserModal {...mockProps} onConfirm={slowOnConfirm} />);
      await waitForAnimations();
      
      // Submit form
      const submitButton = screen.getByText('Guardar cambios');
      await user.click(submitButton);
      
      // Check if loading state is shown
      expect(await screen.findByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });

    it('disables form controls during submission', async () => {
      const user = userEvent.setup();
      const slowOnConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<EditUserModal {...mockProps} onConfirm={slowOnConfirm} />);
      await waitForAnimations();
      
      // Submit form
      await user.click(screen.getByText('Guardar cambios'));
      
      // Check if form controls are disabled
      expect(screen.getByLabelText('Nombre')).toBeDisabled();
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByRole('button', { name: /cliente/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /coach/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /administrador/i })).toBeDisabled();
    });
  });

  describe('Modal Behavior', () => {
    it('resets form on close', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Modify form fields
      const nameInput = screen.getByLabelText('Nombre');
      const emailInput = screen.getByLabelText('Email');
      
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');
      await user.clear(emailInput);
      await user.type(emailInput, 'jane@example.com');
      
      // Close and reopen modal
      rerender(<EditUserModal {...mockProps} isOpen={false} />);
      rerender(<EditUserModal {...mockProps} isOpen={true} />);
      await waitForAnimations();
      
      // Check if fields are reset to original values
      expect(screen.getByLabelText('Nombre')).toHaveValue(mockUser.name);
      expect(screen.getByLabelText('Email')).toHaveValue(mockUser.email);
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Click cancel button
      await user.click(screen.getByText('Cancelar'));
      
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose after successful submission', async () => {
      const user = userEvent.setup();
      render(<EditUserModal {...mockProps} />);
      await waitForAnimations();
      
      // Submit form
      await user.click(screen.getByText('Guardar cambios'));
      
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });
  });
}); 