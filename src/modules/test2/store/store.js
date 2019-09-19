// import Vue from 'vue'
// import Vuex from 'vuex'

import actions from './actions.js'
import mutations from './mutations.js'
import getters from './getters.js'

const state = {
	underylingData: null, //底层数据
	unLockedArr: [], //开着的层数据
	ZDGroup: null, //所有的终端ID
	layer: null, //带锁的层数据
	cs: null, //参数
	isReadLocktatus: false, //标记是否正在读取锁状态 如果在读取 则不下发消息到各个页面
	audioSrc: '', //语音地址
	patientsInfo: null, //病人数据
	curr: 1, //病人卡下分页所在第几页
	currEquip: 1, //病人卡下分页所在第几页
	clickMenu: '', //点击的左侧菜单 通知有需要的页面处理
	checkState: false, //双人核对标志
	//entryAdvice: null,  //紧急取药
	AutoSubmit: null, //未点击确定自动提交数据
	drug: [], //所有的药品数据
}

// Vue.use(Vuex)

// export default new Vuex.Store({
// 	state, //用来数据共享数据存储
// 	getters, //用来对共享数据进行过滤操作
// 	actions, //解决异步改变共享数据
// 	mutations, //用来注册改变数据状态
// })



export default {
	namespaced: true, //命名空间
	state, //用来数据共享数据存储
	getters, //用来对共享数据进行过滤操作
	actions, //解决异步改变共享数据
	mutations, //用来注册改变数据状态
}
