const webpack = require('webpack');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = {
  webpack: function (config, env) {
    config.devtool = env === 'production' ? 'source-map' : 'cheap-module-source-map';

    config.ignoreWarnings = [
      {
        module: /node_modules/,
      },
    ];

    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    config.output = {
      ...config.output,
      globalObject: 'self',
      publicPath: 'auto',
    };

    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules/,
      },
      {
        resourceQuery: /asset/,
        type: 'asset/resource',
      },
    ];

    config.resolve.alias = {
      ...config.resolve.alias,
      'process/browser': require.resolve('process/browser.js'),
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url/'),
      zlib: require.resolve('browserify-zlib'),
    };

    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js',
      }),
    ];

    if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN) {
      config.plugins.push(
        new SentryWebpackPlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          include: './build',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        })
      );
    }

    return config;
  },

  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // config.headers = {
      //   ...config.headers,
      //   'Cross-Origin-Opener-Policy': 'same-origin',
      //   'Cross-Origin-Embedder-Policy': 'credentialless',
      // };

      return config;
    };
  },
};
