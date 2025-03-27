# API Directory Structure

## Overview

This directory contains serverless API routes for Vercel deployment, organized with a shared module pattern to optimize for serverless environments.

## Directory Structure

```
api/
├── auth/                      # Authentication routes
│   └── google/                # Google authentication
│       └── verify.js          # Google token verification
├── shared/                    # Shared modules across API routes
│   ├── config/                # Configuration files
│   │   └── index.js           # Environment-specific config
│   ├── middleware/            # Middleware functions
│   │   └── auth.js            # Authentication middleware
│   ├── models/                # Database models
│   │   └── User.js            # User model
│   └── utils/                 # Utility functions
│       ├── auth.js            # Authentication utilities
│       └── database.js        # Database utilities
├── package.json               # API-specific package for path aliases
└── README.md                  # This documentation
```

## Path Aliases

The API uses path aliases to make imports more maintainable:

- `#shared/*` - Imports from the shared directory
- `#models/*` - Imports from shared/models
- `#utils/*` - Imports from shared/utils
- `#config/*` - Imports from shared/config
- `#middleware/*` - Imports from shared/middleware

## Serverless Environment

In Vercel's serverless environment:

1. Each API route is deployed as an isolated function
2. The directory structure is different from local development
3. Imports between routes need special handling

This structure is optimized to:

- Minimize code duplication
- Support proper module resolution
- Prevent model recompilation errors
- Enable environment-specific configurations 