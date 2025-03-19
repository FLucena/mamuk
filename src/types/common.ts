/**
 * Common utility types for replacing 'any' throughout the codebase
 */

// For API responses with unknown structure
export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonObject 
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

// For error handling
export interface ErrorWithMessage {
  message: string;
  [key: string]: unknown;
}

// For event handlers
export type GenericEventHandler<E extends Event = Event> = (event: E) => void;

// For commonly used data structures
export type MessageData = string | ArrayBuffer | Blob | null;

// For React component props with unknown structure
export type UnknownProps = Record<string, unknown>;

// For function parameters and returns with complex or mixed types
export type GenericFunction = (...args: unknown[]) => unknown;

// For component refs
export type ComponentRef<T = HTMLElement> = React.RefObject<T>;

// For data fetching and state
export type AsyncData<T> = {
  data: T | null;
  error: ErrorWithMessage | null;
  loading: boolean;
};

// For callback functions with specific structures
export type CallbackFunction<T = void> = () => T;
export type ParameterizedCallback<P, R = void> = (param: P) => R;

// For objects with dynamic keys
export type Dictionary<T = unknown> = {
  [key: string]: T;
};

// For API parameters
export type ApiParams = Record<string, string | number | boolean | undefined | null>;

// For response transformers
export type DataTransformer<T, R> = (data: T) => R; 