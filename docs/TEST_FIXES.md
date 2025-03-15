# Test Fixes Documentation

## Overview

This document outlines the changes made to fix failing tests in the Mamuk application, particularly focusing on the `RouteGuard` component tests that were failing after implementing the centralized redirect service.

## Issues Fixed

### 1. PageLoading Component Mock

**Problem**: Tests were failing with the error `Unable to find an element with the test ID: "loading-spinner"`. This occurred because the `RouteGuard` component was updated to use the `PageLoading` component instead of the previously used `LoadingSpinner` component.

**Solution**: Updated the test file to mock the `PageLoading` component instead of the `LoadingSpinner` component:

```javascript
// Before
jest.mock('@/components/ui/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// After
jest.mock('@/components/ui/PageLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));
```

### 2. RedirectService Mock

**Problem**: Tests were failing with the error `TypeError: Cannot read properties of undefined (reading 'performRedirect')`. This occurred because the `RouteGuard` component was updated to use the centralized `redirectService` for handling redirects, but the mock in the test file was not correctly structured.

**Solution**: Updated the mock for the `redirectService` to properly expose the `performRedirect` method:

```javascript
// Before
jest.mock('@/utils/redirectService', () => ({
  performRedirect: jest.fn().mockReturnValue(true),
}));

// After
jest.mock('@/utils/redirectService', () => ({
  redirectService: {
    performRedirect: jest.fn().mockReturnValue(true)
  }
}));
```

### 3. Test Assertions

**Problem**: The tests were checking for router.push calls, but the component now uses the redirectService instead.

**Solution**: Updated the test assertions to check for calls to `redirectService.performRedirect` instead of `router.push`:

```javascript
// Before
expect(mockPush).toHaveBeenCalledWith('/unauthorized');

// After
expect(redirectService.performRedirect).toHaveBeenCalledWith(
  expect.anything(),
  '/unauthorized',
  expect.objectContaining({
    source: 'RouteGuard',
    sessionStatus: 'authenticated'
  })
);
```

## Best Practices for Testing with RedirectService

When writing tests for components that use the centralized redirect service, follow these guidelines:

1. **Mock the redirectService properly**: Ensure the mock structure matches the actual implementation.
2. **Check for performRedirect calls**: Verify that `redirectService.performRedirect` is called with the correct parameters.
3. **Include sessionStatus in assertions**: The redirect service now expects a sessionStatus parameter, so include it in your test assertions.
4. **Use expect.objectContaining for options**: When asserting redirect options, use `expect.objectContaining()` to focus on the relevant properties without being too strict.

## Conclusion

These changes ensure that the tests properly reflect the updated implementation of the `RouteGuard` component with the centralized redirect service. All tests now pass successfully, validating that the redirect optimization works as expected while maintaining backward compatibility with existing code. 