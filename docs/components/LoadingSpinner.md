# LoadingSpinner Component

The `LoadingSpinner` component provides a consistent loading indicator throughout the application. It's designed to be flexible and can be used in various contexts, from inline loading indicators to full-screen overlays.

## Usage

```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With size variation
<LoadingSpinner size="lg" />

// Centered in container
<LoadingSpinner centered />

// With label
<LoadingSpinner label="Cargando datos..." />

// Full screen overlay
<LoadingSpinner fullScreen label="Procesando..." />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls the size of the spinner |
| `className` | `string` | `''` | Additional CSS classes to apply |
| `fullScreen` | `boolean` | `false` | When true, creates a fixed overlay covering the entire screen |
| `centered` | `boolean` | `false` | Centers the spinner in its container |
| `label` | `string` | `undefined` | Optional text to display below the spinner |

## Variants

### Inline Spinner

For inline loading indicators, such as within buttons or next to text:

```tsx
<button disabled={isLoading}>
  {isLoading ? <LoadingSpinner size="sm" /> : null}
  Submit
</button>
```

### Centered in Container

For loading states within a specific container or component:

```tsx
<div className="relative h-64">
  {isLoading ? <LoadingSpinner centered /> : null}
  {!isLoading && data ? <DataDisplay data={data} /> : null}
</div>
```

### Full Page Loading

For initial page loads or during major data fetching operations:

```tsx
import PageLoading from '@/components/ui/PageLoading';

// Using the PageLoading component (which uses LoadingSpinner internally)
<PageLoading message="Cargando página..." />

// Or directly with LoadingSpinner
<div className="min-h-screen flex items-center justify-center">
  <LoadingSpinner size="lg" centered label="Cargando página..." />
</div>
```

### Global Loading Indicator

The application includes a global loading indicator that can be controlled via the `useSpinner` hook:

```tsx
import { useSpinner } from '@/contexts/SpinnerContext';

function MyComponent() {
  const { showSpinner, hideSpinner, withSpinner } = useSpinner();
  
  const handleClick = async () => {
    showSpinner();
    try {
      await fetchData();
    } finally {
      hideSpinner();
    }
  };
  
  // Or using the withSpinner helper
  const handleSubmit = async () => {
    await withSpinner(fetchData());
  };
  
  return (
    <button onClick={handleClick}>Load Data</button>
  );
}
```

## Best Practices

1. **Use appropriate sizes**: Choose the right size for the context - `sm` for inline/button spinners, `md` for component loading, and `lg` for page-level loading.

2. **Provide feedback**: When loading might take more than a moment, include a label to inform users what's happening.

3. **Consider accessibility**: The spinner includes `aria-hidden="true"` as it's a decorative element. Ensure you provide text context for screen readers when using the spinner.

4. **Avoid multiple spinners**: Use the global spinner for full-page operations and local spinners for component-specific loading states.

5. **Prevent layout shifts**: When possible, maintain the same layout dimensions when switching between loading and loaded states to prevent content jumps. 