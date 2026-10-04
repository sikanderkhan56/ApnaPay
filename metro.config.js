const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * RN 0.87 inlined `@react-native/assets-registry` into `react-native/asset-registry`.
 * react-native-svg 15.15 still imports the old package name; map it so Metro can bundle.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === '@react-native/assets-registry/registry' ||
        moduleName === '@react-native/assets-registry'
      ) {
        return {
          filePath: require.resolve('react-native/asset-registry'),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
