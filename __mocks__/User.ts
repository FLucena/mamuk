const User = {
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation(data => ({
    _id: 'mock-user-id',
    ...data,
  })),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
};

export default User; 