/*!
 * mixin.js v0.0.1
 * (c) 开锁 绘制九宫格
 */

// import { GetPatientInfo, GetLSH } from "@cm/server/get/get";

export const mixinUnLock = {
	data() {
		return {
			sUnLockYGBM: '', //开锁专用药格编码
			sUnLockCZBM: '', //开锁专用层组编码
			sUnLockZDID: '', //开锁专用终端ID
			isDraw: true, //开锁成功是否绘制九宫格
		}
	},
	created() {
		console.error('unlock')
	},
	mounted() {

	},
	computed: {

	},
	methods: {
		UnlockFunc(val) {
			let MethodNum = val.Data.MethodNum;
			let Target = val.Data.Target ? val.Data.Target[0] : val.Data.Return[0];
			let sZDID = Target.DevNum;
			let sAddr = Target.Addr;

			if (MethodNum == 905) {
				//上锁（中间件主动推送 包括开锁后主动返回这条消息）1213
				let State = Target.State;
				if (State == "Unlock") {
					if (sAddr.substring(2, 4) === '00') {
						//开锁成功的回复消息 绘制九宫格
						if (this.isDraw) {
							this.getMedChestLayers(this.sZDID);
						}
					} else {
						//开盖成功的回复消息

					}
				} else if (State == "Lock") {
					if (sAddr.substring(2, 4) === '00') {
						//层上锁

					} else {
						//盖子上锁
					}
				}
			} else if (MethodNum == 903) {
				//获取锁状态（读取锁状态返回的结果）1211
				let State = Target.State;
				if (State == "Unlock") {
					if (sAddr.substring(2, 4) === '00') {
						//读取到层是开着的 绘制九宫格
						if (this.isDraw) {
							this.getMedChestLayers(this.sZDID);
						}
					} else {
						//开盖成功的回复消息
					}
				} else if (State == "Lock") {
					//读取到层状态为锁上的 (层和盖子)
					this.$nuobo.NBSetLockState({
						'sZDID': sZDID,
						'sNode': sAddr
					});
				}
			}
		}
	},
	watch: {

	}
}
