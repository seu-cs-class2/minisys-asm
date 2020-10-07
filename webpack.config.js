const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'package/entry/browser.ts'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'website'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
}
