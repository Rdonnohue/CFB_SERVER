const path = require('path');
const webpack = require('webpack');
const CopyPlug = require('copy-webpack-plugin');
module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    target: 'node',
    optimization: {
        minimize: false
      },
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
          {
            test: /\.ts?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
      },
      externals: {
        knex: 'commonjs knex'
      },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CopyPlug({
            patterns: [
                {from: path.resolve(__dirname, 'src/testScripts'), to: 'public'}
            ]
        }),
    ]

  };