/*!
 * mixin.js v0.0.1
 * (c) 与 chestPalace组合使用
 */

import {
	GetZDSX,
	GetZDYW
} from "@cm/server/get/get";

export const mixinPalace = {
	data() {
		return {
			type: 0, //表示在哪一页面 0：入出库 1：保留 2：盘点 3：管控 4：校准
			palace: [], //九宫格数据
			region: [72.75, 16], //区域
			size: [], //布局 
			mask: -1, //遮罩
		}
	},
	created() {
		// console.error('palace')
	},
	mounted() {

	},
	methods: {
		getMedChestLayers(ZDID) {
			//获取药柜层数据
			GetZDSX({
				'ZDID': ZDID,
				'Opt': 1
			}).then(res => {
				if (res.iRet > 0) {
					//低值耗材柜 获取直接显示宫格数据size
					if (this.sZDLXBM === 'ZDLXBM_007') {
						let hs = 0;
						let YCSX = res.data[0].YCSX;

						YCSX.map((value) => {
							hs += value.iCellH;
						})

						let ls = res.data[0].YCSX[0].iCellW;

						//A B 宫格尺寸
						this.size = [hs, ls];
						this.region = [55, 16.1875];

						//获取格子的数据
						//先清空数据包括上一个的
						this.palace = [];
						this.GetPalace(ZDID);
					} else {
						// this.$message({
						//     message: "当前点击的耗材柜终端类型不是低值耗材柜，请联系管理员修改终端类型",
						//     type: "warning",
						//     showClose: true
						// });
					}
				} else {
					res.iRet === -2 ?
						this.$message({
							message: res.sRet,
							type: "warning",
							showClose: true
						}) :
						this.$message({
							message: "获取药柜层数据失败",
							type: "warning",
							showClose: true
						});
				}
			}).catch((err) => {
				Promise.reject(err);
				this.$message({
					message: "请求出错:获取药柜层布局数据失败",
					type: "warning",
					showClose: true
				});
			})
		},
		GetPalace(ZDID) {
			//获取终端布局
			GetZDYW({
				'ZDID': ZDID,
				'Opt': 2,
				'YHID': ''
			}).then((res) => {
				if (res.iRet > 0) {
					this.palace = res.data;

					//警示标志
					let three = 3 * 30 * 24 * 60 * 60 * 1000;
					let six = 6 * 30 * 24 * 60 * 60 * 1000;

					this.palace.forEach((v) => {
						let YPXX = v.YPXX;
						let iQX = 0;
						//0 正常 -1 已过期 1 即将过期(3-6个月)

						if (YPXX.length > 0) {
							YPXX.forEach((_v) => {
								let sKCMX = _v.KCMX;
								if (sKCMX.length > 0) {
									sKCMX.forEach((value) => {
										let dXQ = value.dXQ;
										// let sPH = value.sPH;

										dXQ
											?
											+new Date(dXQ) - (+new Date()) <= 0 ?
											iQX = -1 :
											+new Date(dXQ) - (+new Date()) < three ?
											iQX = 1 :
											+new Date(dXQ) - (+new Date()) >= three && +new Date(dXQ) - (+new Date()) <= six ?
											iQX = 1 :
											+new Date(dXQ) - (+new Date()) > six ?
											iQX = 1 :
											'' :
											iQX = 0;
									})
								}

								//this.$set(_v, 'iXQ', iQX);
							})
						}

						this.$set(v, 'iXQ', iQX);
					})

					// console.error(this.palace)
				} else {
					res.iRet === -2 ?
						this.$message({
							message: res.sRet,
							type: "warning",
							showClose: true
						}) :
						this.$message({
							message: "获取药柜布局失败",
							type: "warning",
							showClose: true
						});
				}
			}).catch((err) => {
				Promise.reject(err);
				this.$message({
					message: "请求出错:获取药柜布局失败",
					type: "warning",
					showClose: true
				});
			});
		},
	},
	watch: {

	}
}
