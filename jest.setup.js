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
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
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
  
  const mockSchema = {
    index: jest.fn().mockReturnThis(),
    pre: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
  };
  
  const mongoose = {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      setMaxListeners: jest.fn(),
      on: jest.fn(),
      close: jest.fn().mockResolvedValue(true),
    },
    Schema: jest.fn().mockReturnValue(mockSchema),
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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Suppress console errors during tests
global.console.error = jest.fn();

// Mock CSS modules
jest.mock('*.module.css', () => ({}));

// Mock window.performance
if (!window.performance) {
  window.performance = {
    mark: jest.fn(),
    clearMarks: jest.fn(),
    getEntriesByType: jest.fn(() => []),
  };
}

// Mock PerformanceObserver
global.PerformanceObserver = class {
  observe() {}
  disconnect() {}
};

// Mock process.env
process.env = {
  ...process.env,
  NEXTAUTH_URL: 'http://localhost:3001',
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Mock Request object
global.Request = class {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
  }
};

// Mock Response object
global.Response = class {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Headers(init.headers);
    this.type = 'default';
    this.url = '';
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
  }

  async text() {
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
  }

  clone() {
    return new Response(this._body, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
    });
  }
};

// Mock Headers object if not available
if (!global.Headers) {
  global.Headers = class {
    constructor(init) {
      this._headers = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value);
        });
      }
    }

    append(name, value) {
      this._headers.set(name.toLowerCase(), value);
    }

    delete(name) {
      this._headers.delete(name.toLowerCase());
    }

    get(name) {
      return this._headers.get(name.toLowerCase()) || null;
    }

    has(name) {
      return this._headers.has(name.toLowerCase());
    }

    set(name, value) {
      this._headers.set(name.toLowerCase(), value);
    }
  };
} 