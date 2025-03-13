// Mock for mongoose module
const mongooseMock = {
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    setMaxListeners: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    close: jest.fn().mockResolvedValue(true),
  },
  Schema: function (obj) {
    return {
      ...obj,
      pre: jest.fn().mockReturnThis(),
      index: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      virtual: jest.fn().mockReturnThis(),
      methods: {},
      statics: {},
    };
  },
  model: jest.fn().mockImplementation((name, schema) => {
    return {
      name,
      schema,
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((doc) => Promise.resolve({ ...doc, _id: 'mock-id' })),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
  }),
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => id || 'mock-id'),
    Mixed: 'mixed',
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Buffer: Buffer,
    Date: Date,
    Map: Map,
  },
};

// Add Schema.Types
mongooseMock.Schema.Types = mongooseMock.Types;

// Add isValid method to ObjectId
mongooseMock.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

// Add models property to store models
mongooseMock.models = {};

module.exports = mongooseMock; 