import { Document, Model, Query, QueryOptions, Schema, UpdateQuery, FilterQuery, ProjectionType, Types } from 'mongoose';

/**
 * Enhanced Mongoose Model with properly typed methods
 */
export interface EnhancedModel<T extends Document> extends Model<T> {
  // Find methods
  find<ResultDoc = T>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Query<ResultDoc[], ResultDoc, {}, T>;

  findById<ResultDoc = T>(
    id: Types.ObjectId | string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Query<ResultDoc | null, ResultDoc, {}, T>;

  findOne<ResultDoc = T>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Query<ResultDoc | null, ResultDoc, {}, T>;

  // Update methods
  findByIdAndUpdate<ResultDoc = T>(
    id: Types.ObjectId | string,
    update: UpdateQuery<T>,
    options?: QueryOptions<T> & { new?: boolean }
  ): Query<ResultDoc | null, ResultDoc, {}, T>;

  findOneAndUpdate<ResultDoc = T>(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T> & { new?: boolean; upsert?: boolean }
  ): Query<ResultDoc | null, ResultDoc, {}, T>;

  updateOne<ResultDoc = T>(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T> & { new?: boolean }
  ): Query<{ matchedCount: number; modifiedCount: number; acknowledged: boolean; upsertedCount: number; upsertedId?: Types.ObjectId; }, ResultDoc, {}, T>;

  updateMany<ResultDoc = T>(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T> & { new?: boolean }
  ): Query<{ matchedCount: number; modifiedCount: number; acknowledged: boolean; upsertedCount: number; upsertedId?: Types.ObjectId; }, ResultDoc, {}, T>;

  // Delete methods
  findByIdAndDelete<ResultDoc = T>(
    id: Types.ObjectId | string,
    options?: QueryOptions<T>
  ): Query<ResultDoc | null, ResultDoc, {}, T>;

  findOneAndDelete<ResultDoc = T>(
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Query<ResultDoc | null, ResultDoc, {}, T>;

  // Create methods
  create<ResultDoc = T>(
    docs: Partial<T>[],
    options?: QueryOptions<T>
  ): Promise<ResultDoc[]>;
  create<ResultDoc = T>(
    doc: Partial<T>,
    options?: QueryOptions<T>
  ): Promise<ResultDoc>;

  // Count methods
  countDocuments(
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Query<number, T, {}, T>;

  // Lean methods with proper return typing
  lean<QueryHelpers = {}>(
    options?: { virtuals?: boolean | string[] }
  ): Query<Array<T>, T, QueryHelpers, T> & QueryHelpers;
}

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
 * Helper function to type-cast a model to the enhanced model
 */
export function castToEnhancedModel<T extends Document>(model: Model<T>): EnhancedModel<T> {
  return model as unknown as EnhancedModel<T>;
} 