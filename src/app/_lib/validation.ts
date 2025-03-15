/**
 * Data validation utilities for API routes
 * Provides functions for validating and sanitizing input data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Error response for validation failures
 */
export interface ValidationErrorResponse {
  success: false;
  errors: Record<string, string[]>;
  message: string;
}

/**
 * Validate request data against a Zod schema
 * 
 * @example
 * ```ts
 * // Define your schema
 * const UserSchema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email(),
 *   age: z.number().int().positive().optional(),
 * });
 * 
 * // In your API route
 * export async function POST(req: NextRequest) {
 *   const result = await validateRequest(req, UserSchema);
 *   
 *   if (!result.success) {
 *     return result.response;
 *   }
 *   
 *   // Data is valid, proceed with your logic
 *   const validatedData = result.data;
 *   // ...
 * }
 * ```
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse<ValidationErrorResponse> }
> {
  try {
    // Parse request body as JSON
    const body = await req.json();
    
    // Validate against schema
    const result = schema.safeParse(body);
    
    if (!result.success) {
      // Format validation errors
      const formattedErrors: Record<string, string[]> = {};
      
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(error.message);
      });
      
      // Return validation error response
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            errors: formattedErrors,
            message: 'Validation failed',
          },
          { status: 400 }
        ),
      };
    }
    
    // Return validated data
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    // Handle JSON parsing errors
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          errors: { _form: ['Invalid JSON data'] },
          message: 'Invalid request data',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/on\w+=\w+/g, '');
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  url: z.string().url(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
}; 