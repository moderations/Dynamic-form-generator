const { defineConfig } = require('@vue/cli-service')
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.resolve.alias
     // 设置 @ 指向 src 目录
    .set('@', path.resolve('src'))
     // 可以根据需要设置其他别名
    .set('components', path.resolve('src/components'));

    // console.log('config.resolve.alias>>>', config.resolve.alias)
  },
})
