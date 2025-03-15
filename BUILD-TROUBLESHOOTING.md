# Build Troubleshooting Guide

This guide provides solutions for common build issues with the Next.js application.

## Issue: Build Freezes or Hangs

If your build process freezes or hangs at the initialization stage, it's likely due to experimental features or complex configurations in the Next.js config.

### Solution 1: Use Minimal Configuration

We've created a script that temporarily replaces your Next.js configuration with a minimal one for building:

```bash
npm run build:minimal
```

This script:
1. Backs up your current `next.config.js`
2. Replaces it with a minimal configuration
3. Runs the build with simplified settings
4. Restores your original configuration

### Solution 2: Simple Build Without Source Maps

If you just want to build without source maps and with minimal features:

```bash
npm run build:simple
```

This skips source map generation and disables experimental features that might cause issues.

### Solution 3: Manual Configuration Adjustment

If you prefer to manually adjust the configuration:

1. Edit `next.config.js`
2. Disable experimental features:
   ```js
   experimental: {
     // Disable features that might cause build issues
     optimizeCss: false,
     memoryBasedWorkersCount: false,
     // Use minimal settings for required features
     serverActions: {
       bodySizeLimit: '1mb',
     },
     // Disable package imports optimization
     optimizePackageImports: [],
   },
   ```
3. Run the build:
   ```bash
   npm run build:nolint
   ```

## Issue: Permission Errors During Build

If you encounter permission errors when cleaning the `.next` directory:

### Solution:

1. Close any applications that might be using files in the `.next` directory (e.g., VS Code, browser)
2. Try running with administrator privileges
3. Manually delete the `.next` directory if possible
4. Use the build script that skips cleaning problematic directories:
   ```bash
   npm run build:simple
   ```

## Issue: Memory Issues During Build

If the build process runs out of memory:

### Solution:

1. Increase Node.js memory limit:
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   npm run build:simple
   ```

2. For Windows:
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096 && npm run build:simple
   ```

## Issue: Source Maps Generation Fails

If source maps generation is causing issues:

### Solution:

Skip source maps generation:
```bash
npm run build:nolint
```

## Recommended Build Process for Production

For the most reliable production build:

1. Clean the cache:
   ```bash
   npm run clean:cache
   ```

2. Build with minimal configuration:
   ```bash
   npm run build:minimal
   ```

3. Optimize images after build (optional):
   ```bash
   npm run optimize:images
   ```

## Additional Resources

- [Next.js Build Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [Troubleshooting Next.js Builds](https://nextjs.org/docs/messages/build-optimization-failed) 