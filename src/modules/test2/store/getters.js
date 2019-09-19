import MyStorage from '@cm/config/plugins/localStorage/localStorage.js'

const getters = {
	//如果需要处理返回数据数据 则使用getters
	getUnderData: state => state.underylingData,
}

export default getters
