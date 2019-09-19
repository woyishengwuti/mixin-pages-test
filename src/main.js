/*
 * 应用入口，在这里根据不同的环境变量 VUE_APP_SYS 来合并router等数据
 * by feixiang.wu
 * time {{ 2019-09-19 }}
 */

import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'
import App from '@cm/App'

Vue.use(Router)
Vue.use(Vuex)

/**
 * 导入 mixin router store 等... 并合并
 */

import commonMixin from '@cm/mixin/mixin'

// 注入 mixins
const mixins = [ commonMixin ]

Vue.config.productionTip = false

// 引入通用样式文件
require('@cm/style/comm.scss')

// 工具函数，用于和 require 的行为一致，加个 default 导出 
function wrapWithDefault (value) {
  return { default: value }
}

// 根据 process.env.VUE_APP_SYS 的结果，导入

console.error('process.env.VUE_APP_SYS is', process.env.VUE_APP_SYS)

if (process.env.VUE_APP_SYS !== 'test1') {
  mixins.push(require('@test2/mixin/mixin').default)
  require('@test2/style/comm.scss')
}

if (process.env.VUE_APP_SYS !== 'test2') {
  mixins.push(require('@test1/mixin/mixin').default)
  require('@test1/style/comm.scss')
}

console.log('混合mixins', mixins)

// 检测并获取适当的路由配置
const commonRoutes = require('@cm/router/routes')

// 为了简化操作，将不需要导入的配置使用空数组
const test1Routes = process.env.VUE_APP_SYS !== 'test2' ? require('@test1/router/routes') : wrapWithDefault([ ])
const test2Routes = process.env.VUE_APP_SYS !== 'test1' ? require('@test2/router/routes') : wrapWithDefault([ ])
const routes = [ ...commonRoutes.default, ...test1Routes.default, ...test2Routes.default ]

console.error('路由routes', routes)

// 检测并获取适当的 store 配置
const commonStoreConfig = require('@cm/store/store')

const test1StoreConfig = process.env.VUE_APP_SYS !== 'test2' ? require('@test1/store/store') : wrapWithDefault({ })
const test2StoreConfig = process.env.VUE_APP_SYS !== 'test1' ? require('@test2/store/store') : wrapWithDefault({ })

const storeConfig = {
  ...commonStoreConfig.default,
  modules: {
    test1: test1StoreConfig.default,
    test2: test2StoreConfig.default
  }
}

console.error('存储storeConfig', storeConfig)

// 初始化路由和 store，并启动应用
const router = window.router = new Router({ routes })
const store = window.store = new Vuex.Store(storeConfig)

new Vue({
  mixins,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
