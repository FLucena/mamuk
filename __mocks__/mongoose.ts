// Define interfaces for middleware and schema
interface IMiddlewares {
  pre: { [key: string]: Function[] };
  post: { [key: string]: Function[] };
}

interface ISchema {
  definition: any;
  options: any;
  middlewares: IMiddlewares;
  pre(action: string, fn: Function): ISchema;
  post(action: string, fn: Function): ISchema;
  executePreHooks(action: string): Promise<void>;
  executePostHooks(action: string): Promise<void>;
  index(fields: { [key: string]: number }, options?: { [key: string]: any }): ISchema;
}

function Schema(this: ISchema, definition: any, options: any = {}) {
  if (!(this instanceof Schema)) {
    return new (Schema as any)(definition, options);
  }

  this.definition = definition;
  this.options = options;
  this.middlewares = { pre: {}, post: {} };
}

Schema.prototype.pre = function(this: ISchema, action: string, fn: Function) {
  if (!this.middlewares.pre[action]) {
    this.middlewares.pre[action] = [];
  }
  this.middlewares.pre[action].push(fn);
  return this;
};

Schema.prototype.post = function(this: ISchema, action: string, fn: Function) {
  if (!this.middlewares.post[action]) {
    this.middlewares.post[action] = [];
  }
  this.middlewares.post[action].push(fn);
  return this;
};

Schema.prototype.executePreHooks = async function(this: ISchema, action: string) {
  const hooks = this.middlewares.pre[action] || [];
  for (const hook of hooks) {
    await new Promise((resolve) => hook(resolve));
  }
};

Schema.prototype.executePostHooks = async function(this: ISchema, action: string) {
  const hooks = this.middlewares.post[action] || [];
  for (const hook of hooks) {
    await new Promise((resolve) => hook(resolve));
  }
};

Schema.prototype.index = function(this: ISchema, fields: { [key: string]: number }, options: { [key: string]: any } = {}) {
  // Mock implementation for index
  return this;
};

// Add Schema types
Schema.Types = {
  ObjectId: 'ObjectId',
  String: 'String',
  Number: 'Number',
  Date: 'Date',
  Boolean: 'Boolean',
  Array: 'Array',
};

// Mock model creation
function createModel(schema: ISchema) {
  const model = {
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation(async (data) => {
      await schema.executePreHooks('save');
      const doc = { ...data };
      await schema.executePostHooks('save');
      return doc;
    }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };
  return model;
}

// Create mongoose mock object
const mongoose = {
  Schema: Schema as any,
  model: jest.fn().mockImplementation((name: string, schema: ISchema) => createModel(schema)),
  models: {},
  Types: {
    ObjectId: jest.fn().mockImplementation(() => 'mock-object-id'),
  },
};

// Ensure Schema is properly bound
Object.defineProperty(mongoose, 'Schema', {
  value: Schema,
  writable: false,
  configurable: false,
});

export default mongoose;