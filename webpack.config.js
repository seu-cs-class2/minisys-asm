const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './package/entry/browser.ts'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './website'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.asm$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
}
