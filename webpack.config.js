const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const Webpack = require('webpack');
require('dotenv').config();

// cSpell:word devtool

const defineEnv = new Webpack.DefinePlugin({
  'process.env': {
    LINE_TOKEN: JSON.stringify(process.env.LINE_TOKEN),
  },
});

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: false,
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  plugins: [new GasPlugin(), defineEnv],
};
