module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // テスト環境以外でreanimatedを有効化
      ...(process.env.NODE_ENV !== 'test' ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
