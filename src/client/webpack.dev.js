const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

// first load common
module.exports = merge(common, { 
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist/client',
    hot: true // hot module reloading
  }
})