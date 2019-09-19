import {
	UNDERYLINGDATA,
	PATIENTSINFO,
	CURR,
	CURREQUIP,
	CLICKMENU,
	CHECKSTATE,
	AUTOSUBMIT,
	ZDGROUP,
	LAYER,
	CS,
	ISREADLOCKSTATUS,
	AUDIOSRC,
	UNLOCKEDARR,
	DRUG
} from './mutation-types.js';
import MyStorage from '@cm/config/plugins/localStorage/localStorage.js'

//每个 mutation 都有一个字符串的 事件类型 (type)(这里是指在mutations-type中导入的'SHOWLOADING','HIDELOADING') 和 一个 回调函数 (handler)
//这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数        mutation 必须是同步函数

const mutations = {
	[UNDERYLINGDATA](state, info) {
		//底层数据
		state.underylingData = info;
		//MyStorage.setItem(UNDERYLINGDATA, info);
	},
	[PATIENTSINFO](state, info) {
		//病人数据
		state.patientsInfo = info;
		MyStorage.setItem(PATIENTSINFO, info);
	},
	[CURR](state, info) {
		//当前页面
		state.curr = info;
		MyStorage.setItem(CURR, info);
	},
	[CURREQUIP](state, info) {
		//当前页面
		state.currEquip = info;
		MyStorage.setItem(CURREQUIP, info);
	},
	[CLICKMENU](state, info) {
		//选中菜单
		state.clickMenu = info;
		MyStorage.setItem(CLICKMENU, info);
	},
	[CHECKSTATE](state, info) {
		//双人核对
		state.checkState = info;
		MyStorage.setItem(CHECKSTATE, info);
	},
	[AUTOSUBMIT](state, info) {
		//自动提交
		state.AutoSubmit = info;
		MyStorage.setItem(AUTOSUBMIT, info);
	},
	[ZDGROUP](state, info) {
		//终端ID
		state.ZDGroup = info;
		MyStorage.setItem(ZDGROUP, info);
	},
	[LAYER](state, info) {
		//带锁的层数据
		state.layer = info;
		MyStorage.setItem(LAYER, info);
	},
	[CS](state, info) {
		//参数
		state.cs = info;
		MyStorage.setItem(CS, info);
	},
	[ISREADLOCKSTATUS](state, info) {
		//是否在读取锁状态
		state.isReadLocktatus = info;
		MyStorage.setItem(ISREADLOCKSTATUS, info);
	},
	[AUDIOSRC](state, info) {
		//语音地址
		state.audioSrc = info;
		MyStorage.setItem(AUDIOSRC, info);
	},
	[UNLOCKEDARR](state, info) {
		//未上锁数据
		state.unLockedArr = info;
		// MyStorage.setItem(AUDIOSRC, info);
	},
	[DRUG](state, info) {
		//药品数据
		state.drug = info;
		MyStorage.setItem(DRUG, info);
	},
}

//你不能直接调用一个 mutation handler
//这个选项更像是事件注册：“当触发一个类型为 increment 的 mutation 时，调用此函数。”要唤醒一个 mutation handler，你需要以相应的 type 调用 store.commit 方法：
export default mutations
