module.exports = {
  speak: jest.fn((text, options) => {
    // テスト環境では onDone を非同期で呼び出す（実機と同じ挙動を模倣）
    if (options?.onDone) {
      setTimeout(options.onDone, 0);
    }
  }),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
};
