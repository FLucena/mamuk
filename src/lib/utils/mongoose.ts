import { Document, Model, Types } from 'mongoose';
import { EnhancedModel, castToEnhancedModel } from '@/types/mongoose';

/**
 * Gets a properly typed Mongoose model
 * This allows us to use strongly typed Mongoose methods
 * instead of using 'as any' casts throughout the codebase
 * 
 * @param model The Mongoose model to enhance
 * @returns A properly typed version of the model
 */
export function getTypedModel<T extends Document>(model: Model<T>): EnhancedModel<T> {
  return castToEnhancedModel(model);
}

/**
 * Safely converts a string ID to a MongoDB ObjectId
 * 
 * @param id The string ID to convert
 * @returns MongoDB ObjectId or null if invalid
 */
export function toObjectId(id: string): Types.ObjectId | null {
  try {
    if (Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely converts an ObjectId to a string
 * 
 * @param id The ObjectId to convert
 * @returns String representation of the ID or empty string if null/undefined
 */
export function fromObjectId(id?: Types.ObjectId | null): string {
  if (!id) return '';
  return id.toString();
}

/**
 * Converts the Mongoose document or array of documents to plain objects
 * This helps with JSON serialization by converting ObjectIds to strings
 * 
 * @param docs Mongoose document(s) to transform
 * @returns Plain JavaScript object(s) with string IDs
 */
export function toPlainObject<T>(docs: (Document & T)[]): Record<string, unknown>[];
export function toPlainObject<T>(doc: Document & T): Record<string, unknown>;
export function toPlainObject<T>(
  doc: (Document & T) | (Document & T)[]
): Record<string, unknown> | Record<string, unknown>[] {
  if (Array.isArray(doc)) {
    return doc.map(item => {
      const plainObj = item.toObject ? item.toObject() : { ...item };
      if (plainObj._id) {
        plainObj._id = plainObj._id.toString();
      }
      return plainObj;
    });
  }
  
  const plainObj = doc.toObject ? doc.toObject() : { ...doc };
  if (plainObj._id) {
    plainObj._id = plainObj._id.toString();
  }
  return plainObj;
} 