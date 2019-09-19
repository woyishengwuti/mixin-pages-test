import * as types from './mutation-types.js'
import {
	GetDrugInfo
} from "@cm/server/get/get";
import MyStorage from '@cm/config/plugins/localStorage/localStorage.js'

//Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象
//因此你可以调用 context.commit 提交一个 mutation，或者通过 context.state 和 context.getters 来获取 state 和 getters

export default {
	// showloader: ({commit}) => {
	// 	commit(types.SHOWLOADING)
	// },
	async GetDrugInfos({
		commit,
		state
	}, obj) {
		//异步传参 参数只能有一个 但是可以是数组也可以是对象
		await GetDrugInfo({
			"Param": JSON.stringify([3, "获取所有药品信息", MyStorage.getItem('wZDID'), null])
		}).then((res) => {
			if (res.iRet > 0) {
				commit(types.DRUG, res.data)
			} else {
				
			}
		}).catch((err) => {
			Promise.reject(err);
		});
	}
}
