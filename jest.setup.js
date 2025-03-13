import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Set up TextEncoder/TextDecoder for Next.js compatibility
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock console.error to suppress expected error messages during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Don't log expected error messages
  if (
    args[0]?.includes?.('Warning: An update to') ||
    args[0] === 'Error updating roles:' ||
    args[0] === 'Error updating user roles:' ||
    args[0] === 'Application error:' ||
    args[0]?.includes?.('Warning: Received `true` for a non-boolean attribute')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Restore original console.error after all tests
afterAll(() => {
  console.error = originalConsoleError;
});

// Set up environment variables for testing
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
process.env.NEXT_PUBLIC_SENTRY_DSN = ''
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Remove priority prop or convert it to a string to avoid the warning
    const { priority, ...rest } = props;
    const priorityAttr = priority ? { 'data-priority': 'true' } : {};
    
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} {...priorityAttr} alt={props.alt || ''} />;
  },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        role: 'user',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => {
    return Promise.resolve({
      user: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        role: 'user',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),
}))

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(() => {
    return Promise.resolve({
      name: 'Test User',
      email: 'test@example.com',
      sub: '123',
      role: 'user',
    })
  }),
  decode: jest.fn(() => {
    return Promise.resolve({
      name: 'Test User',
      email: 'test@example.com',
      sub: '123',
      role: 'user',
    })
  }),
}))

// Mock openid-client
jest.mock('openid-client', () => ({}))

// Mock jose
jest.mock('jose', () => ({}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  withScope: jest.fn((callback) => callback({ setExtra: jest.fn() })),
}))

// Mock mongoose directly
jest.mock('mongoose', () => {
  const mockModel = {
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  }
  
  const mongoose = {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      setMaxListeners: jest.fn(),
      on: jest.fn(),
      close: jest.fn().mockResolvedValue(true),
    },
    Schema: jest.fn().mockReturnValue({
      index: jest.fn().mockReturnThis(),
    }),
    model: jest.fn().mockReturnValue(mockModel),
    models: {
      User: mockModel,
      Coach: mockModel,
      Workout: mockModel,
      Exercise: mockModel,
    },
  }
  
  // Add Schema.Types.ObjectId
  mongoose.Schema.Types = {
    ObjectId: 'ObjectId',
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Mixed: 'Mixed',
    Array: Array,
    Buffer: Buffer,
    Map: Map,
  }
  
  return mongoose
})

// Mock the auth redirect hook
jest.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: jest.fn(() => ({
    session: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      }
    },
    isLoading: false,
  })),
})); 