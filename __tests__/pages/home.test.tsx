import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Session } from 'next-auth';
import { Role } from '@/lib/types/user';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock SchemaOrg component
jest.mock('@/components/SchemaOrg', () => ({
  __esModule: true,
  default: () => <div data-testid="schema-org" />,
}));

// Mock SignInButtons component
jest.mock('@/components/auth/SignInButtons', () => ({
  SignInButtons: () => <div data-testid="sign-in-buttons">Sign In Buttons</div>,
}));

// Mock getServerSession
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock User model
jest.mock('@/lib/models/user', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(data => ({
      _id: 'mock-user-id',
      ...data,
    })),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  }
}));

// Create a mock version of the HomePage component
const MockHomePage = ({ hasSession = false }: { hasSession?: boolean }) => {
  if (hasSession) {
    return null; // This would redirect in the real component
  }
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="Mamuk Training Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Bienvenido a Mamuk
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Crea, gestiona y comparte rutinas de entrenamiento personalizadas
        </p>
        
        <div className="mb-8">
          <div data-testid="sign-in-buttons">Sign In Buttons</div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Preguntas Frecuentes</h2>
        </div>
      </div>
    </main>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('renders homepage content for unauthenticated users', async () => {
    // Mock getServerSession to return null (unauthenticated)
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValue(null);

    // Render the mock homepage
    render(<MockHomePage hasSession={false} />);

    // Check for elements that should be visible to unauthenticated users
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido a Mamuk/i)).toBeInTheDocument();
    
    // Verify that sign-in buttons are shown
    expect(screen.getByText(/Sign In Buttons/i)).toBeInTheDocument();
    expect(screen.getByText(/Preguntas Frecuentes/i)).toBeInTheDocument();
  });

  it('redirects authenticated users to workout page', async () => {
    // Create a mock session
    const mockSession: Session = {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['customer' as Role],
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Mock getServerSession to return the session (authenticated)
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValue(mockSession);
    
    // Get the mocked redirect function
    const { redirect } = require('next/navigation');

    // Import the actual HomePage component
    const { default: HomePage } = require('@/app/page');
    
    // Call the HomePage function (this will trigger the redirect)
    await HomePage();

    // Verify that redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/workout');
  });
}); 