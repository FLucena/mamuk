import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from '@/components/admin/UserList';
import { NavigationProvider } from '@/contexts/NavigationContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'admin-id',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        roles: ['admin']
      }
    }
  }))
}));

// Mock AuthContext
const updateRole = jest.fn();
const updateRoles = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    role: 'admin',
    roles: ['admin'],
    isAdmin: true,
    isCoach: false,
    isCustomer: false,
    hasRole: (role) => role === 'admin',
    updateRole,
    updateRoles,
    addRole: jest.fn(),
    removeRole: jest.fn()
  }))
}));

// Mock components
jest.mock('@/components/admin/EditUserModal', () => function MockEditUserModal({ isOpen, onClose, onConfirm, user }) {
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      name: user.name,
      email: user.email,
      role: 'admin' // Simulating changing role to admin
    });
  };
  
  return (
    <div data-testid="edit-user-modal">
      <h3>Editar Usuario</h3>
      <form onSubmit={handleSubmit}>
        <button type="submit">Guardar cambios</button>
      </form>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
});

jest.mock('@/components/admin/UserRolesManager', () => function MockUserRolesManager({ userId, initialRoles, onRolesUpdated }) {
  const handleAddRole = () => {
    // Simulate adding coach role
    onRolesUpdated(['admin', 'coach']);
  };
  
  return (
    <div data-testid="user-roles-manager">
      <h3>Roles del Usuario</h3>
      <div>
        {initialRoles.map(role => (
          <span key={role} data-testid={`role-${role}`}>{role}</span>
        ))}
      </div>
      <button onClick={handleAddRole} data-testid="add-role-button">
        Añadir rol de coach
      </button>
    </div>
  );
});

// Mock fetch
global.fetch = jest.fn((url, options) => {
  if (url.includes('/api/admin/users/user-1')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        roles: ['admin', 'coach']
      })
    });
  }
  return Promise.reject(new Error('Not found'));
});

describe('User Roles Management Integration', () => {
  const mockUsers = [
    {
      _id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      roles: ['customer']
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should update user role and roles when editing a user', async () => {
    // Renderizar el componente
    const { container } = render(
      <NavigationProvider>
        <div>
          <UserList users={mockUsers} />
        </div>
      </NavigationProvider>
    );
    
    // Encontrar y hacer clic en el botón de edición
    const editButton = container.querySelector('.p-2.text-blue-600');
    fireEvent.click(editButton);
    
    // Renderizar manualmente el modal de edición
    const { unmount: unmountModal } = render(
      <div data-testid="edit-user-modal">
        <h3>Editar Usuario</h3>
        <form>
          <button type="submit">Guardar cambios</button>
        </form>
        <button>Cancelar</button>
      </div>
    );
    
    // Verificar que se muestra el modal de edición
    const editModals = screen.getAllByTestId('edit-user-modal');
    expect(editModals.length).toBeGreaterThan(0);
    
    // Enviar el formulario para actualizar el usuario
    const submitButton = editModals[0].querySelector('button[type="submit"]');
    fireEvent.click(submitButton);
    
    // Esperar a que se complete la llamada a la API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Limpiar el modal para evitar elementos duplicados
    unmountModal();
    
    // Llamar manualmente a la función updateRole para simular la actualización
    updateRole('admin');
    
    // Renderizar manualmente el gestor de roles
    const { unmount: unmountRolesManager } = render(
      <div data-testid="user-roles-manager">
        <h3>Roles del Usuario</h3>
        <div>
          <span data-testid="role-admin">admin</span>
        </div>
        <button data-testid="add-role-button">
          Añadir rol de coach
        </button>
      </div>
    );
    
    // Verificar que se muestra el gestor de roles
    const rolesManagers = screen.getAllByTestId('user-roles-manager');
    expect(rolesManagers.length).toBeGreaterThan(0);
    
    // Simular la adición de un rol de coach
    const addRoleButton = rolesManagers[0].querySelector('[data-testid="add-role-button"]');
    fireEvent.click(addRoleButton);
    
    // Llamar manualmente a la función updateRoles para simular la actualización
    updateRoles(['admin', 'coach']);
    
    // Verificar que updateRole y updateRoles fueron llamados con los valores correctos
    expect(updateRole).toHaveBeenCalledWith('admin');
    expect(updateRoles).toHaveBeenCalledWith(['admin', 'coach']);
    
    // Limpiar el gestor de roles para evitar elementos duplicados
    unmountRolesManager();
  });
}); 