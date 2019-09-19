/*!
 * mixin.js v0.0.1
 * (c) 与 chestList组合使用
 */

import {
	GetZDSX,
	GetZDYW
} from "@cm/server/get/get";

export const mixinChest = {
	data() {
		return {
			group: [], //药柜列表
			index: -1, //表示激活的耗材柜
			sCZBM: '0000', //层组编码
			isOpen: false, //柜子开关状态 默认为关
			chestLayer: false, //在弹层上还是页面上
			isInsurgery: false, //是否在手术取药中 -> 修改为状态值 surgery inven setting 三个 分别
		}
	},
	created() {
		console.error('chest')
	},
	mounted() {
		//获取药柜列表
		this.getChestList();
	},
	methods: {
		chestChecked(chest, index) {
			//选中了某个药柜
			console.error('选中了某个药柜', chest, index)
			this.index = index;
			this.sZDID = chest.sZDID;
			this.sZDLXBM = chest.sZDLXBM;
			this.sCZBM = chest.sZDTXBM ? chest.sZDTXBM : '0000';

			if (this.sZDLXBM === "ZDLXBM_006") {
				//显示列表的区域
				this.isShowPalace = false;

				//加载这个耗材柜内耗材信息
				if (this.isInsurgery) {
					// this.GetInfoByBarcodes(this.sZDID,'DA0B2BE3714E2BE3714ED0C6|E280116060000209577CC42D|E280116060000209577CD520', 'Inc');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E64393|E280116060000209577CC42E|E280116060000209577CC42F', 'Dec');
					this.$nuobo.NBSetLockState({
						'sZDID': this.sZDID,
						'sNode': this.sCZBM
					});
					return;
				} else {
					this.GetZDYWs(this.sZDID);
				}

				//读取锁状态
				//this.loadState = -1;
				//this.isOpen = false;
				//this.$nuobo.NBReadLock({'sZDID': this.sZDID, 'sNode': this.sCZBM});

				//测试数据
				if (!this.chestLayer) {
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E64393|E28011606000020CF1E643A3|E28011606000020CF1E643B3', 'Inc');
					// this.GetInfoByBarcodes(this.sZDID,'DA0B2BE3714E2BE3714ED0C6', 'Dec');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E80D1F', 'Dec');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E8AB51', 'Dec');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E8AB61', 'Dec');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E8AB71', 'Dec');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E8AB81', 'Dec');
					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E8ABC1', 'Dec');

					// this.GetInfoByBarcodes(this.sZDID,'E28011606000020CF1E643A3|E28011606000020CF1E643B3', 'Inc');
					// this.GetInfoByBarcodes(this.sZDID,'E280116060000209577CD522|E280116060000209577CD524', 'Inc');

					// this.GetInfoByBarcodes(this.sZDID,'DA0B2BE3714E2BE3714ED0C6|E280116060000209577CCC24', 'Dec');
					this.$nuobo.NBSetLockState({
						'sZDID': this.sZDID,
						'sNode': this.sCZBM
					});
				} else {
					//弹层上 开锁
					this.$nuobo.NBSetLockState({
						'sZDID': this.sZDID,
						'sNode': this.sCZBM
					});
				}
			} else if (this.sZDLXBM === "ZDLXBM_007") {
				//低值
				this.sUnLockCZBM = chest.sZDTXBM ? chest.sZDTXBM : '0000';
				this.sUnLockZDID = chest.sZDID;
				let iKZYS = chest.iKZYS;

				let type = this.$nuobo.NBGetKZYS(11, iKZYS) ? 'H' : 'A';
				this.$nuobo.NBReadLock({
					'sZDID': this.sUnLockZDID,
					'sNode': this.sUnLockCZBM,
					type: type
				});

				//显示九宫格的区域
				this.isShowPalace = true;
			}
		},
		getChestList() {
			GetZDSX({
				'ZDID': this.$store.state.ZDGroup,
				'Opt': 0
			}).then((res) => {
				if (res.iRet > 0) {
					//第一个的ZDID和IP
					this.sZDID = res.data[0].sZDID;
					this.sZDLXBM = res.data[0].sZDLXBM;

					//绘制列表（筛选出不是使用终端）
					this.group = res.data;
					//this.group = [...data, ...data, ...data, ...data];

					//单个的时候开锁
					if (this.isInsurgery) {
						this.index = -1;
					} else {
						if (this.group.length > 1) {
							// this.index = -1;

							// //显示全部的耗材
							// this.GetZDYWs(this.$store.state.ZDGroup);

							this.index = -1;

							//多个的时候只显示第一个的数据 为了点击图片开柜子有数据 0517
							this.chest = res.data[0];

							//显示第一个的耗材
							this.GetZDYWs(this.sZDID);
						} else {
							this.index = 0;

							//显示第一个的耗材
							this.GetZDYWs(this.sZDID);
						}
					}
				} else {
					res.iRet === -2 ?
						this.$message({
							message: res.sRet,
							type: "warning",
							showClose: true
						}) :
						this.$message({
							message: "获取药柜列表数据失败",
							type: "warning",
							showClose: true
						});
				}
			}).catch((err) => {
				Promise.reject(err);
				this.$message({
					message: "请求出错:获取药柜列表数据失败",
					type: "warning",
					showClose: true
				});
			});
		},
		GetZDYWs(ZDID) {
			//获取终端药物
			//多个柜子的话 全部显示出来 打开某一个显示哪一个
			GetZDYW({
				'ZDID': ZDID,
				'Opt': 3
			}).then((res) => {
				if (res.iRet > 0) {
					//获取表格数据
					for (let i = 0; i < res.data.length; i++) {
						let YPXX = res.data[i].YPXX;
						this.$set(res.data[i], 'arrow', false);

						let sl = res.data[i].YPXX.reduce((t, v) => {
							return t + Math.abs(v.iSL)
						}, 0)

						this.$set(res.data[i], 'sum', sl);
					}
					this.tableData = res.data;
				} else {
					res.iRet === -2 ?
						this.$message({
							message: res.sRet,
							type: "warning",
							showClose: true
						}) :
						this.$message({
							message: "获取药柜列表数据失败",
							type: "warning",
							showClose: true
						});
				}
			}).catch((err) => {
				Promise.reject(err);
				this.$message({
					message: "请求出错:获取药柜列表数据失败",
					type: "warning",
					showClose: true
				});
			});
		},
	},
	watch: {

	}
}
