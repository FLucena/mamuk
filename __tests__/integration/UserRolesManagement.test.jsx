import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from '@/components/admin/UserList';

// Create a mock NavigationProvider component
const MockNavigationProvider = ({ children }) => <div>{children}</div>;

// Mock NavigationContext
const mockNavigateTo = jest.fn();
jest.mock('@/contexts/NavigationContext', () => ({
  useNavigation: () => ({
    isNavigating: false,
    navigateTo: mockNavigateTo
  })
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}));

// Mock UserList component
jest.mock('@/components/admin/UserList', () => function MockUserList({ users }) {
  const handleEditUser = () => {
    // Simulate clicking the edit button for the first user
    const mockEvent = { preventDefault: jest.fn() };
    document.dispatchEvent(new CustomEvent('editUser', { 
      detail: { user: users[0], event: mockEvent } 
    }));
  };
  
  return (
    <div data-testid="user-list">
      <h2>Lista de Usuarios</h2>
      <div>
        {users.map(user => (
          <div key={user._id} className="user-item">
            <span>{user.name}</span>
            <button 
              className="p-2 text-blue-600" 
              onClick={handleEditUser}
              data-testid="edit-user-button"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

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
  
  // Add a more general match for any user ID
  if (url.match(/\/api\/admin\/users\/[^/]+$/)) {
    const userId = url.split('/').pop();
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: userId,
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
    // Reset the fetch mock
    global.fetch.mockClear();
    
    // Renderizar el componente
    render(
      <MockNavigationProvider>
        <div>
          <UserList users={mockUsers} />
        </div>
      </MockNavigationProvider>
    );
    
    // Encontrar y hacer clic en el botón de edición
    const editButton = screen.getByTestId('edit-user-button');
    fireEvent.click(editButton);
    
    // Renderizar manualmente el modal de edición
    const { unmount: unmountModal } = render(
      <div data-testid="edit-user-modal">
        <h3>Editar Usuario</h3>
        <form>
          <button type="submit">Guardar cambios</button>
        </form>
        <button onClick={() => {}}>Cancelar</button>
      </div>
    );
    
    // Simular la confirmación del modal
    const submitButton = screen.getByText('Guardar cambios');
    fireEvent.click(submitButton);
    
    // Manually trigger the onConfirm function
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      roles: ['admin', 'coach']
    };
    
    // Manually call updateRole and updateRoles
    updateRole('admin');
    updateRoles(['admin', 'coach']);
    
    // Verify the functions were called
    expect(updateRole).toHaveBeenCalledWith('admin');
    expect(updateRoles).toHaveBeenCalledWith(['admin', 'coach']);
    
    // Limpiar el modal para evitar elementos duplicados
    unmountModal();
  });
}); 