/**
 * Helper functions for mocking Next.js components and hooks
 */

/**
 * Sets up mocks for Next.js navigation hooks
 */
export function setupNextNavigation() {
  // Mock next/navigation
  jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
    useParams: jest.fn(() => ({})),
  }));
}

/**
 * Sets up mocks for Next.js router (legacy)
 */
export function setupNextRouter() {
  // Mock next/router
  jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    })),
  }));
}

/**
 * Sets up mocks for Next.js image component
 */
export function setupNextImage() {
  // Mock next/image
  jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      return <img {...props} />;
    },
  }));
}

/**
 * Sets up mocks for Next.js link component
 */
export function setupNextLink() {
  // Mock next/link
  jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }));
}

/**
 * Sets up mocks for Next.js head component
 */
export function setupNextHead() {
  // Mock next/head
  jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  }));
}

/**
 * Sets up mocks for Next.js script component
 */
export function setupNextScript() {
  // Mock next/script
  jest.mock('next/script', () => ({
    __esModule: true,
    default: (props) => <script {...props} />,
  }));
}

/**
 * Sets up all Next.js mocks
 */
export function setupAllNextMocks() {
  setupNextNavigation();
  setupNextRouter();
  setupNextImage();
  setupNextLink();
  setupNextHead();
  setupNextScript();
}

/**
 * Creates a mock for the NavigationContext
 * @param {Object} options - Options for the mock
 * @returns {Object} Mock NavigationContext
 */
export function createMockNavigationContext(options = {}) {
  const defaultOptions = {
    isNavigating: false,
    navigateTo: jest.fn(),
    ...options,
  };

  return {
    NavigationProvider: ({ children }) => <div data-testid="navigation-provider">{children}</div>,
    useNavigation: () => defaultOptions,
  };
}

/**
 * Creates a mock for the AuthContext
 * @param {Object} options - Options for the mock
 * @returns {Object} Mock AuthContext
 */
export function createMockAuthContext(options = {}) {
  const defaultOptions = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      roles: ['customer'],
    },
    role: 'customer',
    roles: ['customer'],
    isAdmin: false,
    isCoach: false,
    isCustomer: true,
    hasRole: jest.fn((role) => role === 'customer'),
    updateRole: jest.fn(),
    updateRoles: jest.fn(),
    addRole: jest.fn(),
    removeRole: jest.fn(),
    ...options,
  };

  return {
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => defaultOptions,
  };
} 