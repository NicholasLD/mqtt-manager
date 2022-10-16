const { defineConfig } = require('@vue/cli-service')
const path = require("path");
const webpack = require("webpack");
module.exports = defineConfig({
  transpileDependencies: true,
  assetsDir: 'static',
  productionSourceMap: false
})

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  assetsDir: 'static',

  devServer:{
    open: true, //初次打包完成后，自动打开浏览器
    host: '127.0.0.1' ,//实是打包所使用的主机地址
    port:8080, //实时打包使用的端口号 (在http协议中，端口是80则可以省略不显示)
  },

  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
    ]
  },

  productionSourceMap: false
}
