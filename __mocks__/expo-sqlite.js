const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
};

const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);

module.exports = { openDatabaseAsync, _mockDb: mockDb };
