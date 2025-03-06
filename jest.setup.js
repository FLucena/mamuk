import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Next.js usa estos y no están disponibles en el entorno de Jest por defecto
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock de nextauth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ 
    data: { user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' } }, 
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
})) 