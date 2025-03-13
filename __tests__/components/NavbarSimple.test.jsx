import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavbarSimple from '@/components/NavbarSimple';

// Mocks para los hooks
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/contexts/NavigationContext', () => ({
  useNavigation: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

// Mock para los componentes UI
jest.mock('@/components/ui/Icon', () => function MockIcon({ icon, className }) {
  return <span data-testid={`icon-${icon}`} className={className}></span>;
});

jest.mock('@/components/ui/LoadingSpinner', () => function MockLoadingSpinner({ size, className }) {
  return <div data-testid="loading-spinner" className={className}></div>;
});

describe('NavbarSimple', () => {
  // Valores por defecto para los mocks
  const navigateTo = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar los mocks por defecto para cada test
    require('@/contexts/AuthContext').useAuth.mockReturnValue({
      isAdmin: false,
      isCoach: false
    });
    
    require('@/contexts/NavigationContext').useNavigation.mockReturnValue({
      isNavigating: false,
      navigateTo
    });
    
    require('next-auth/react').useSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    });
    
    require('next/navigation').usePathname.mockReturnValue('/');
  });

  it('renders the navbar with home link', () => {
    render(<NavbarSimple />);
    
    // Verificar el logo
    expect(screen.getByText('MAMUK')).toBeInTheDocument();
    
    // Verificar el enlace de inicio en la vista de escritorio
    const desktopButtons = screen.getAllByText('Inicio');
    expect(desktopButtons[0]).toBeInTheDocument();
    
    // Verificar el icono de inicio - usar getAllByTestId en lugar de getByTestId
    expect(screen.getAllByTestId('icon-FiHome')[0]).toBeInTheDocument();
  });

  it('shows admin link when user is admin', () => {
    // Configurar el mock para este test específico
    require('@/contexts/AuthContext').useAuth.mockReturnValue({
      isAdmin: true,
      isCoach: false
    });
    
    render(<NavbarSimple />);
    
    // Verificar el enlace de admin en la vista de escritorio
    const desktopButtons = screen.getAllByText('Admin');
    expect(desktopButtons[0]).toBeInTheDocument();
    
    // Verificar el icono de admin
    expect(screen.getAllByTestId('icon-FiUsers')[0]).toBeInTheDocument();
  });

  it('shows coach link when user is coach', () => {
    // Configurar el mock para este test específico
    require('@/contexts/AuthContext').useAuth.mockReturnValue({
      isAdmin: false,
      isCoach: true
    });
    
    render(<NavbarSimple />);
    
    // Verificar el enlace de coach en la vista de escritorio
    const desktopButtons = screen.getAllByText('Coach');
    expect(desktopButtons[0]).toBeInTheDocument();
    
    // Verificar el icono de coach
    expect(screen.getAllByTestId('icon-FiAward')[0]).toBeInTheDocument();
  });

  it('calls navigateTo when a link is clicked', () => {
    render(<NavbarSimple />);
    
    // Hacer clic en el enlace de inicio en la vista de escritorio
    const desktopButtons = screen.getAllByText('Inicio');
    fireEvent.click(desktopButtons[0]);
    
    // Verificar que navigateTo fue llamado con la ruta correcta
    expect(navigateTo).toHaveBeenCalledWith('/');
  });

  it('shows loading spinner when navigating', () => {
    // Configurar los mocks para este test específico
    require('@/contexts/AuthContext').useAuth.mockReturnValue({
      isAdmin: true,
      isCoach: false
    });
    
    require('@/contexts/NavigationContext').useNavigation.mockReturnValue({
      isNavigating: true,
      navigateTo
    });
    
    require('next/navigation').usePathname.mockReturnValue('/admin');
    
    render(<NavbarSimple />);
    
    // Verificar que se muestra el spinner de carga
    const spinners = screen.getAllByTestId('loading-spinner');
    expect(spinners.length).toBeGreaterThan(0);
    expect(spinners[0]).toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', () => {
    const { container } = render(<NavbarSimple />);
    
    // Obtener el botón del menú móvil y el contenedor del menú
    const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
    const mobileMenu = container.querySelector('.md\\:hidden > div');
    
    // Verificar que el menú móvil está inicialmente oculto
    expect(mobileMenu.parentElement).toHaveClass('hidden');
    
    // Hacer clic en el botón del menú
    fireEvent.click(mobileMenuButton);
    
    // Verificar que el menú móvil ya no está oculto
    expect(mobileMenu.parentElement).not.toHaveClass('hidden');
  });
}); 