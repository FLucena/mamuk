import { Document, Model, Types } from 'mongoose';

/**
 * Type helper for MongoDBDocument with _id handling
 */
export interface MongoDBDocument {
  _id: Types.ObjectId;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Enhanced Mongoose Model type
 * Using a simple type alias to avoid compatibility issues with complex mongoose types
 */
export type EnhancedModel<T extends Document> = Model<T>;

/**
 * Helper function to type-cast a model to the enhanced model
 */
export function castToEnhancedModel<T extends Document>(model: Model<T>): EnhancedModel<T> {
  return model as EnhancedModel<T>;
} 