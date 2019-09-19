/*!
 * mixin.js v0.0.1
 * (c) 与 病人卡和病人卡的导航 组合使用
 */

import {
	GetPatientInfo,
	GetLSH
} from "@cm/server/get/get";

export const mixinNav = {
	data() {
		return {
			count: 0, //总数量
			limit: 24, //每页显示数据
			pageCount: 0, //分页数量
			// currentPage: 5,  //当前显示的第几项
			currIndex: 0, //滑屏的时候点击了小圆点切换病人卡
			searchVal: null, //搜索数据
			isSuccess: false, //判断导入信息是否成功
			patient: [], //显示的病人卡数据
			patients: [], //病人卡数据
			time: '', //时间
			pickerOptions2: {
				shortcuts: [{
					text: '最近一周',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: '上一个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
						picker.$emit('pick', [start, end]);
					}
				}]
			}, //时间快捷键
			timeout: null, //搜索定时器
			inputText: '', //搜索数据
		}
	},
	created() {
		console.error('nav')
	},
	mounted() {
		//获取药柜列表
		// this.getHISData();

		setTimeout(() => {
			if (!this.isSuccess) {
				this.isSuccess = true;
				// this.getPatients();
			}
		}, 8000)

		//当前显示页面从vuex中取值 并展示出来
		//this.curr = this.$store.state.curr;

		let startX = 0;
		let endX = 0;
		//获取值
		this.currIndex = this.curr;

		window.ontouchstart = (e) => {
			startX = e.changedTouches[0].pageX;
		}

		window.ontouchend = (e) => {
			endX = e.changedTouches[0].pageX;
			// 总数/每个分页数量
			let iMax = Math.ceil(this.count / this.limit);

			if (startX - endX > 80 || endX - startX > 80) {
				//切换下一页
				if (startX - endX > 80 && iMax > this.currIndex) {
					this.currIndex++;
				} else if (endX - startX > 80 && this.currIndex - 1 > 0) {
					this.currIndex--;
				}

				this.handleCurrentChange(this.currIndex);
			}
		}

		let sTartTime = this.$Utils.createTime({
			format: 'YYYY-MM-DD 00:00:00',
			now: new Date()
		});
		let sEndTime = this.$Utils.createTime({
			format: 'YYYY-MM-DD 23:59:59',
			now: new Date(),
			days: 1,
			direct: true
		})
		this.time = [this.$MyStorage.getItem('sTartTime') || sTartTime, this.$MyStorage.getItem('sEndTime') || sEndTime];

		//加载病人卡
		this.GetPatientInfos(this.time[0], this.time[1]);
	},
	computed: {
		clickMenuData() {
			return this.$store.state.clickMenu;
		},
		curr() {
			return this.$store.state.curr;
		}
	},
	methods: {
		getPatients() {
			//获取数据
			fetch("/BS/IDMS/php/TDMS/临床用/YWGL_ZYBRXX_Get.php", {
				KSID: loginInfo.sKSID
			}).then((res) => {
				if (res.iRet > 0) {
					this.patients = res.data;
					if (this.clickMenuData === 'JJQY') {
						this.patients.unshift({
							'state': 'urgent'
						})
					}

					this.patient = res.data.filter((value, index) => {
						this.$set(value, 'checked', false)
						return index < this.curr * this.limit && index >= (this.curr - 1) * this.limit
					})

					this.clickMenuData === 'JJQY' ? this.count = res.data.length - 1 : this.count = res.data.length;
				} else {
					res.iRet === -2 ? this.$message({
						message: res.sRet,
						type: "warning",
						showClose: true
					}) : this.$message({
						message: '获取病人信息失败',
						type: "warning",
						showClose: true
					});
				}
			}).catch((err) => {
				this.$message({
					message: '请求出错:获取病人信息失败',
					type: "warning",
					showClose: true
				})
				//if (this.clickMenuData === 'JJQY') {
				this.patient = [{
					'state': 'urgent',
					'checked': false
				}];
				//}
				Promise.reject(err);
			})
		},
		clickPatientOut(s, t) {
			console.log('父组件接收病人卡', s, t)
			this.GetLSHs(this.$MyStorage.getItem('wZDID'), s);

			// if (!this.multiplayer) {
			//     //单人直接进入  多人不进入
			//     if (s.iDFBZ === 1 || this.clickMenuData === 'JJQY') {
			//         //存在未取药医嘱 存储病人信息
			//         this.multiplayerArr.push(s);

			//         //进入下一级
			//         this.Entry();
			//     } else {
			//         this.$message('此病人暂无可取药医嘱');
			//     }
			// } else {
			//     //把每次选择的数据存起来(紧急取药进入的不会触发这里)
			//     if (t === true) {
			//         //选中
			//         this.multiplayerArr.push(s);
			//     } else {
			//         //取消选中
			//         let sBRID = s.sBRID

			//         this.multiplayerArr = this.multiplayerArr.filter((value) => {
			//             return value.sBRID !==  sBRID
			//         })
			//     }
			// }
		},
		GetLSHs(sZDID, s) {
			GetLSH({
				'Param': `[10,"返回这个人进行中的备药单及其明细","${sZDID}"]`
			}).then((res) => {
				console.error(res)
				if (res.iRet > 0) {
					let sSSID = s.sSSID;

					let data = res.data;
					if (data.length > 0) {
						res.data.map((_v, index) => {
							// console.error('sLSH', _v.sLSH, _v.sGLSS, sSSID, _v.sGLSS === sSSID)
							if (_v.sGLSS === sSSID) {
								this.$MyStorage.setItem('sLSH', _v.sLSH);
								this.$store.commit('PATIENTSINFO', [s]);
								this.$router.push({
									name: 'outs',
									path: 'outs'
								});
							} else if (index === data.length - 1) {
								this.$store.commit('PATIENTSINFO', [s]);
								this.$router.push({
									name: 'outs',
									path: 'outs'
								});
							}
						})
					} else {
						this.$store.commit('PATIENTSINFO', []);
						this.$router.push({
							name: 'outs',
							path: 'outs'
						});
					}
				} else {
					res.iRet === -2 ?
						this.$message({
							message: res.sRet,
							type: "warning",
							showClose: true
						}) :
						this.$message({
							message: "获取流水号失败",
							type: "warning",
							showClose: true
						});
				}
			}).catch((err) => {
				Promise.reject(err);
				this.$message({
					message: "请求出错:获取流水号失败",
					type: "warning",
					showClose: true
				});
			});
		},
		handleCurrentChange(val) {
			// console.log(`当前页: ${val}`);
			this.$store.commit('CURR', val);

			this.currIndex = val;

			//取不同的数据进行渲染
			this.patient = this.patients.filter((value, index) => {
				return index < val * this.limit && index >= (val - 1) * this.limit
			});
		},
		searchData(val) {
			this.patient = this.patients.filter((value) => {
				for (let key in value) {
					if (value[key]) {
						//console.log(value[key].toString(), val.toUpperCase())
						if (
							value[key].toString().includes(val.toUpperCase()) ||
							value[key].toString().includes(val)
						) {
							return value;
						}
					}
				}
			});

			if (this.patient.length > 0 && this.patient[0].state !== 'urgent') {
				this.patient.unshift({
					'state': 'urgent',
					'checked': false
				})
			}

			this.count = this.patient.length;
			this.pageCount = Math.ceil(this.patient.length / this.limit);
		},
		changeTime() {
			let sTartTime = this.time[0] + ' 00:00:00';;
			let sEndTime = this.time[1] + ' 23:59:59';;
			this.$MyStorage.setItem('sTartTime', sTartTime);
			this.$MyStorage.setItem('sEndTime', sEndTime);

			this.GetPatientInfos(sTartTime, sEndTime)
		},
		GetPatientInfos(startTime, endTime) {
			//获取病人信息
			GetPatientInfo({
				'ZDID': this.$MyStorage.getItem('wZDID'),
				'Opt': 0,
				'QSSJ': startTime,
				'JZSJ': endTime
			}).then((res) => {
				const sSSXX = res.SSXX;
				if (Object.keys(sSSXX).length > 0) {

					let data = [];

					Object.keys(sSSXX).forEach((_v) => {
						data.push(...sSSXX[_v]);
					});

					this.patients = data;
					this.patients.unshift({
						'state': 'urgent'
					})

					this.patient = this.patients.filter((value, index) => {
						this.$set(value, 'checked', false)
						return index < this.curr * this.limit && index >= (this.curr - 1) * this.limit
					})

					this.count = this.patients.length;

					this.pageCount = Math.ceil(this.count / this.limit);

					// console.error(this.patients, this.patient)
				} else {
					this.patients = [{
						'state': 'urgent'
					}];
					this.patient = [{
						'state': 'urgent'
					}];

					this.count = this.patients.length;

					this.pageCount = Math.ceil(this.count / this.limit);
				}
			}).catch((err) => {
				Promise.reject(err);
				this.patient = [{
					'state': 'urgent',
					'checked': false
				}];
				this.$message({
					message: "请求出错:获取病人数据失败" + err,
					type: "warning",
					showClose: true
				});
			});
		},
		createPatientCard() {

		}
	},
	watch: {
		inputText() {
			//筛选数据
			if (this.timeout) clearTimeout(this.timeout);

			this.timeout = setTimeout(() => {
				this.searchData(this.inputText);
			}, 300);
		},
	}
}
