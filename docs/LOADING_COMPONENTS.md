# Loading Components Standardization

This document outlines the standardization of loading components in the Mamuk application.

## Overview

To improve consistency and maintainability, all loading components in the application have been standardized to use the `PageLoading` component. This component is animated, blue, and centered both horizontally and vertically on the screen.

## PageLoading Component

The `PageLoading` component is defined in `src/components/ui/PageLoading.tsx` and has the following features:

- Centered both horizontally and vertically on the screen
- Blue color for the spinner and label
- Animated spinner using the `Loader2` icon from `lucide-react`
- Semi-transparent background overlay
- Customizable size and label

```tsx
interface PageLoadingProps {
  size?: number;
  label?: string;
  className?: string;
}

export default function PageLoading({ 
  size = 32, 
  label = 'Cargando...', 
  className = '' 
}: PageLoadingProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 ${className}`}>
      <div className="flex flex-col items-center justify-center">
        <Loader2 
          size={size} 
          className="animate-spin text-blue-600 dark:text-blue-400" 
          aria-hidden="true"
        />
        {label && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{label}</p>
        )}
      </div>
    </div>
  );
}
```

## Standardization Process

The following components have been updated to use `PageLoading`:

1. **LoadingSpinner** (`src/components/ui/LoadingSpinner.tsx`)
   - Now a wrapper around `PageLoading` for backward compatibility
   - Converts size props ('sm', 'md', 'lg') to numeric values for `PageLoading`

2. **Loading Components** (`src/components/ui/loading.tsx`)
   - `Loading`, `LoadingPage`, and `LoadingOverlay` are now wrappers around `PageLoading`
   - Maintains backward compatibility while using the standardized component

3. **Next.js Loading Files** (`src/app/**/loading.tsx`)
   - All loading files in the app directory now use `PageLoading`
   - A script (`scripts/update-loading-components.js`) was created to automate this process

## Usage

To use the standardized loading component in your code:

```tsx
import PageLoading from '@/components/ui/PageLoading';

// Basic usage
<PageLoading />

// With custom size and label
<PageLoading size={40} label="Cargando datos..." />

// With custom class
<PageLoading className="my-custom-class" />
```

## Testing

A test page is available at `/test-loading` to verify the appearance and behavior of the `PageLoading` component.

## Maintenance

When adding new loading states to the application, always use the `PageLoading` component directly rather than creating new loading components or using the legacy wrappers.

If you need to update all loading files in the app directory, you can run:

```bash
npm run update-loading
```

This will scan all `loading.tsx` files and update them to use the `PageLoading` component. 