/*!
 * mixin.js v0.0.1
 * (c) 引入弹层到父组件后 此mixin引入父组件 包含提交数据部分
 */

import {
	RecordExceptionInfo,
	JudgeInven
} from 'cm/server/get/get'
import {
	updateStock,
	updateUidLocation
} from '@cm/server/post/post'
import {
	mapActions
} from 'vuex'

export const mixinLayer = {
	data() {
		return {
			location: 0, //0 出入库页面 9 退货出库 31 手术消耗
			isShowDialog: false, //是否显示弹出层
			clickBtnYesStatus: false, //提交数据的按钮等待
			uidData: [], //返回的数据
			layerData: [], //弹层数据
			layerDetail: [], //弹层上的明细表格
			redeteLoading: null, //重新检测的等待层
			ModifyData: [], //修改的数据
			sYGIDArr: [], //存放YGID的数组
			sIPGroupArr: [], //存放节点
			addNewLocation: [], //高值添加管控
		}
	},
	created() {
		console.error('layer')
	},
	methods: {
		rowClick(row, event, column) {
			console.error('点击表格行', row, 'column', column, 'event', event)
			if (event) {
				//点击的表格行
				if (column.property === "iSL" && !row.sUID) {
					//其他的情况 当前点击的显示
					this.$Utils.changeSpecifiedObj(this.layerData, 'app');
					row.app = true;
					console.error(row.app)
				}
			} else {
				//点击的事件
				if (column === 'unlock') {
					this.$confirm('是否重新开锁?', '', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						center: true,
						showClose: false,
						customClass: 'layer_tips_default',
						closeOnClickModal: false
					}).then(() => {
						if (row.sUID) {
							//暂时用uid判断是不是高值的
							this.$nuobo.NBSetLockState({
								'sZDID': row.sZDID,
								'sNode': '0000',
								'type': 'H'
							});
						} else {
							this.$nuobo.NBSetLockState({
								'sZDID': row.sZDID,
								'sNode': row.sCZBM,
								'type': 'A'
							});
						}
					}).catch(() => {

					});
				} else if (column === 'mark') {
					let title = !row.isMark ?
						'是否将此条上报消息标记为误报?标记后此数据将不会提交，仅记录日志' :
						'是否取消此次标记'

					this.$confirm(title, '', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						center: true,
						showClose: false,
						customClass: 'layer_tips_default',
						closeOnClickModal: false
					}).then(() => {
						row.isMark = !row.isMark;
					}).catch(() => {

					});
				}
			}
		},
		handleNum(item, param, params, items) {
			// console.log('加减', item, param, params, items)

			if (params === 'items') {
				//总数据点击加减号
				let sl = item.iSL;

				param === 'Inc' ? item.iSL = +item.iSL + 1 : item.iSL <= 0 ? item.iSL = 0 : item.iSL = +item.iSL - 1;

				//没有称重 并且 数据为0 切换取出放入
				if (!this.$nuobo.NBGetKZYS(3, 0, item.iKZYS) && param === 'Dec' && item.iSL == 0) {
					item.sChange === 'Inc' ? item.sChange = 'Dec' : item.sChange = 'Inc';
				}

				//计算数据
				this.sumSL(item);

				//记录修改数据
				if (this.$nuobo.NBGetKZYS(3, 0, item.iKZYS)) {
					//有称重的模块修改才记录
					this.recordModifyData(sl, item);
				}
			} else {
				//总数据点击加减号
				let sl = item.iSL;

				param === 'Inc' ? item.iSL = +item.iSL + 1 : item.iSL <= 0 ? item.iSL = 0 : item.iSL = +item.iSL - 1;

				//没有称重 并且 数据为0 切换取出放入
				// if (!this.$nuobo.NBGetKZYS(3, 0, item.iKZYS) && param === 'Dec' && item.iSL == 0) {
				// 	item.sChange === 'Inc' ? item.sChange = 'Dec' : item.sChange = 'Inc';
				// }

				//计算总和
				items.iSL = items.UIDMX.reduce((v, t) => {
					return v + (+t.iSL);
				}, 0);

				//记录修改数据
				if (this.$nuobo.NBGetKZYS(3, 0, items.iKZYS)) {
					//有称重的模块修改才记录
					this.recordModifyData(sl, items);
				}
			}

			//刷屏 区分补药和取药 type 1补药 assort 2 '待补'+iSL,'已补' + SL
			//this.$screen.floodCell({'type': 1, 'data': item, 'assort': 2});
		},
		changeTrNum(items, num, params, item) {
			//修改数量
			let reg = this.$Utils.plusReg;

			if (params === 'items') {
				//汇总数据修改
				//console.error(num, reg.test(num), items.iSL)
				if (!reg.test(+num)) {
					this.$message({
						message: "请输入正确的数字",
						type: "warning",
						showClose: true
					});

					num.toString().includes('-') ? items.toString().sChange === 'Inc' ? items.sChange = 'Dec' : items.sChange = 'Inc' :
						'';
					num.toString().replace(/^-/g, '');

					//items.iSL = num.toString().substring(0, num.toString().length - 1);
					if (items.UIDMX.length > 0) {
						let sl = items.UIDMX.reduce((v, t) => {
							return v + (+t.iSL);
						}, 0);

						items.iSL = sl;
					}
				} else {
					items.iSL = num;
				}

				//计算数据
				this.sumSL(items);
			} else {
				if (!reg.test(+num)) {
					this.$message({
						message: "请输入正确的数字",
						type: "warning",
						showClose: true
					});

					num.toString().replace(/^-/g, '');

					items.iSL = num.toString().substring(0, num.toString().length - 1);
				} else {
					items.iSL = num;
				}

				//计算总和
				item.iSL = item.UIDMX.reduce((v, t) => {
					return v + (+t.iSL);
				}, 0);
			}

			//console.error('修改数量', this.layerData, items)
		},
		sumSL(items) {
			if (items.UIDMX.length > 0) {
				if (items.UIDMX.length > 1) {
					//计算除了第一个以外的数据
					let sl = items.UIDMX.reduce((t, v, i) => {
						return i > 0 && t + (+v.iSL);
					}, 0);

					if (items.iSL - sl >= 0) {
						items.UIDMX[0].iSL = items.iSL - sl;
					} else {
						items.UIDMX[0].iSL = items.iSL;

						//除了第一个其他清空
						items.UIDMX.forEach((v, i) => {
							if (i !== 0) v.iSL = 0;
						})
					}
				} else {
					items.UIDMX[0].iSL = items.iSL;
				}
			}
		},
		recordModifyData(sl, items) {
			let sIP = items.sZDID;
			let sYGBM = items.sYGBM;
			let sYWID = items.sYWID;
			let mSl = items.iSL;

			this.ModifyData.push([sIP, sYGBM, '', sYWID, sl, mSl]);
		},
		addBathch(items) {
			console.error('新增批次信息', items);
			//添加批号 包括添加his批号

			if (false) {
				//HIS导入批号
				// let sYWID = items.sYWID;

				// fetch('/BS/IDMS/php/TDMS/通用/YWGL_GETYPPH.php', {
				//     "YWID": sYWID
				// }).then(res => {
				//     if (res.iRet > 0) {
				// 		if (res.data.length == 0){
				//             this.$message("暂无可选批号");
				//         } else {
				//             this.batchData = res.data;
				//             this.dialogBatchVisible = true;
				//         }
				// 	} else {
				// 		res.iRet === -2 ? this.$message(res.sRet) : this.$message('获取HIS批号失败');
				// 	}
				// }).catch((err) => {
				//     this.$message('请求出错:获取HIS批号失败');
				//     Promise.reject(err);
				// })  
			} else {
				const aPH = items.UIDMX.filter((value, index) => {
					return value.sPH === '';
				});

				//console.error(aPH, aPH.length)
				if (aPH.length > 0) {
					this.$message({
						message: '已存在空批号，不允许再次添加空批号',
						type: "warning",
						showClose: true
					});
				} else {
					//直接添加空白批号
					this.$confirm('是否新增空白批号?', '', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						center: true,
						showClose: false,
						customClass: 'layer_tips_default',
						closeOnClickModal: false
					}).then(() => {
						this.addPH('', '', items);
					}).catch(() => {

					});
				}
			}
		},
		addPH(sPH, dXQ, data) {
			const arr = {
				'dXQ': dXQ,
				'iSL': 0,
				'sDW': '',
				'sPH': sPH,
				'sQRRXM': '',
				'sSPRXM': '',
				'original': false,
				'app': false,
				'sPM': data.sPM,
				'sGG': data.sGG
			}

			// if (!sPH) {
			// 	//直接添加的允许修改
			// 	arr.isRead = true;
			// }

			const sPHArr = data.UIDMX.map((value) => {
				return value.sPH;
			})

			if (sPHArr.includes(sPH) && sPH) {
				this.$message({
					message: '批号' + sPH + '已存在',
					type: "warning",
					showClose: true
				});
			} else {
				data.UIDMX.push(arr);
				this.$message({
					message: '添加批号成功!',
					type: "success",
					showClose: true
				});
			}
		},
		deleteBatch(items, item, i) {
			console.log('删除批号', items, item, i)
			let sPH = item.sPH;
			let sYGID = items.sYGID;
			let sYWID = items.sYWID;
			let iSL = item.iSL;

			this.$confirm('是否停用批号' + sPH + '?', '', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				center: true,
				showClose: false,
				customClass: 'layer_tips_default',
				closeOnClickModal: false
			}).then(() => {
				if (!sPH && +iSL === 0) {
					//删除被停用的批号
					if (items.UIDMX.length > 1) {
						items.UIDMX.splice(i, 1);
					} else {
						this.$message({
							message: '仅剩余最后一条空白数据，暂不允许删除',
							type: "warning",
							showClose: true,
							// duration: 20000000
						});
					}
				} else {
					JudgeInven({
						Param: `[3, "停用批号", "${sYGID}", "${sYWID}", "${sPH}"]`
					}).then(res => {
						if (res.iRet > 0) {
							//删除被停用的批号
							items.UIDMX.splice(i, 1);
						} else {
							this.$message({
								message: res.sRet,
								type: "warning",
								showClose: true
							});
						}
					}).catch((err) => {
						this.$message({
							message: '请求出错:停用批号失败',
							type: "warning",
							showClose: true
						});
						Promise.reject(err);
					})
				}
			}).catch(() => {

			});
		},
		clickBtn(param) {
			//console.error(param);

			!param ? this.clickBtncancel() : this.clickBtnSunbmit();
		},
		clickBtncancel() {
			let isZero = this.layerData.some((_v) => {
				return _v.iSL != 0;
			})

			if (isZero) {
				//只要存在一个不等于0
				this.$confirm('耗材发生数量变动，其是否取消?', '', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					center: true,
					showClose: false,
					customClass: 'layer_tips_default',
					closeOnClickModal: false
				}).then(() => {
					this.cancel('cancel');
				}).catch(() => {

				});
			} else {
				this.cancel('cancel');
			}
		},
		clickBtnSunbmit() {
			console.error('明细数据', this.layerData)
			//location: 0  0 出入库页面 9 退货出库 31 手术消耗
			let strTips = '';
			let errNum = '';
			let isNotEqual = '';
			let isZero = this.layerData.some((_v) => {
				return _v.iSL != 0;
			})

			if (isZero) {
				//只要存在一个不等于0
				let data = [
					[]
				];
				let isMark = [];
				this.addNewLocation = [
					[]
				];

				this.layerData.forEach((_v) => {
					let sChange = _v.sChange;

					if (_v.isMark) {
						//被标记
						isMark.push(_v);
					} else {
						//退货出库 不允许负数存在
						let UIDMX = _v.UIDMX;
						let reg = this.$Utils.plusReg;

						if (_v.sUID) {
							//高值
							let sYGBM = '0111';
							let sl = _v.iSL;

							//不是正确的数字
							if (!reg.test(sl)) {
								errNum += _v.sPM + ',' + _v.sGG + '|';
							}

							UIDMX.forEach((v) => {
								let sl = v.iSL;

								//不是正确的数字
								if (!reg.test(sl)) {
									errNum += _v.sPM + ',' + _v.sGG + '|';
								}

								if (this.location === 9) {
									//退货出库
									if (sChange === 'Inc') {
										strTips += _v.sPM + ',' + _v.sGG + '|';
									} else {
										data.push([0, _v.sZDID, sYGBM, '', v.sUID, +sl]);
									}
								} else if (this.location === 0) {
									if (sChange === 'Inc') {
										data.push([0, _v.sZDID, sYGBM, '', v.sUID, +sl]);
									} else {
										data.push([0, _v.sZDID, sYGBM, '', v.sUID, +('-' + sl)]);
									}
								} else if (this.location === 31) {
									if (sChange === 'Inc') {
										data.push([0, _v.sZDID, sYGBM, '', v.sUID, +('-' + sl)]);
									} else {
										data.push([0, _v.sZDID, sYGBM, '', v.sUID, +sl]);
									}
								}

								this.addNewLocation.push([0, _v.sZDID, sYGBM, '', _v.sUID]);
							})
						} else {
							//低值
							let _sl = _v.iSL;
							let _sum = 0;
							//不是正确的数字
							if (!reg.test(_sl)) {
								errNum += _v.sPM + ',' + _v.sGG + '|';
							}

							UIDMX.forEach((v) => {
								let sl = v.iSL;
								_sum += +sl;

								//不是正确的数字
								if (!reg.test(sl)) {
									errNum += _v.sPM + ',' + _v.sGG + '|';
								}

								if (this.location === 9) {
									//退货出库
									if (sChange === 'Inc') {
										strTips += _v.sPM + ',' + _v.sGG + '|';
									} else {
										data.push([1, _v.sZDID, _v.sYGBM, '', _v.sYWID, v.sPH, v.dXQ, +v.iSL]);
									}
								} else if (this.location === 0) {
									if (sChange === 'Inc') {
										data.push([1, _v.sZDID, _v.sYGBM, '', _v.sYWID, v.sPH, v.dXQ, +v.iSL]);
									} else {
										data.push([1, _v.sZDID, _v.sYGBM, '', _v.sYWID, v.sPH, v.dXQ, +('-' + v.iSL)]);
									}
								} else if (this.location === 31) {
									if (sChange === 'Inc') {
										data.push([1, _v.sZDID, _v.sYGBM, '', _v.sYWID, v.sPH, v.dXQ, +('-' + v.iSL)]);
									} else {
										data.push([1, _v.sZDID, _v.sYGBM, '', _v.sYWID, v.sPH, v.dXQ, +v.iSL]);
									}
								}
							})

							if (_sum != _sl) {
								//数量不一致的存起来
								isNotEqual += _v.sPM + ',' + _v.sGG + '|';
							}
						}
					}
				})

				//现阶段 出 负数  入正数
				if (isMark.length > 0) {
					if (isMark.length === this.layerData.length) {
						//全部被标记
						this.$message({
							message: "当前数据全部被标记误报，已取消并记录日志",
							type: "warning",
							showClose: true
						});
						this.cancel('cancel');

						return;
					} else {

					}
				}

				if (this.location === 0 || this.location === 31) {
					//允许正负数
					if (errNum) {
						this.$message({
							message: errNum + '数量不正确，请检查',
							type: "warning",
							showClose: true
						});
					} else if (isNotEqual) {
						this.$message({
							message: isNotEqual + '总数量和批号数量不一致，请检查各个批号数量',
							type: "warning",
							showClose: true
						});
					} else {
						this.submit(data);
					}
				} else {
					//判断 只能是正数
					if (strTips) {
						this.$message({
							message: "退货出库中不允许放入耗材，请取出" + strTips,
							type: "warning",
							showClose: true
						});
					} else if (errNum) {
						this.$message({
							message: errNum + '数量不正确，请检查',
							type: "warning",
							showClose: true
						});
					} else if (isNotEqual) {
						this.$message({
							message: isNotEqual + '总数量和批号数量不一致，请检查各个批号数量',
							type: "warning",
							showClose: true
						});
					} else {
						this.submit(data);
					}
				}
			} else {
				//都是0 直接取药 记录点击确定的取消
				this.cancel('success');
			}
		},
		submit(data) {
			let options = null;
			console.error('类别', this.location, '流水号', this.sLSH, '手术ID', this.sSSID)

			let ModifyData = this.$Utils.ModifyDataFunc(this.ModifyData, '');
			if (this.location == 31) {
				let Opt = !this.sLSH ? 0 : 1;
				let GLData = !this.sSSID ? '[]' : `[3, "${this.sSSID}"]`;
				options = {
					ZDID: this.$MyStorage.getItem('wZDID'),
					Opt: Opt,
					YWBZ: 2,
					CRLX: this.location, // 0:自由入库|2:自由出库|31:手术消耗
					JLS: data.length,
					LSH: this.sLSH,
					Data: JSON.stringify(data),
					GLData: GLData,
					YDData: ModifyData,
				}
			} else {
				options = {
					ZDID: this.$MyStorage.getItem('wZDID'),
					Opt: 0,
					YWBZ: 2,
					CRLX: this.location, // 0:自由入库|2:自由出库|31:手术消耗
					JLS: data.length,
					Data: JSON.stringify(data),
					GLData: '[]',
					YDData: ModifyData,
				}
			}

			updateStock(options).then((res) => {
				if (res.iRet > 0) {
					this.$message({
						message: "成功",
						type: "success",
						showClose: true
					})

					// console.error(1111111111111111111, res.sLSH, this.location)
					if (res.sLSH && this.location == 31) {
						//手术消耗存下来流水号
						this.sLSH = res.sLSH;
						this.$MyStorage.setItem('sLSH', res.sLSH);
						// console.error(1111111111111111111, this.sSSID)
						this.sSSID ? this.GetUsedItemsInfos(this.sSSID, this.$MyStorage.getItem('wZDID')) : this.UsedItems = [];
					}

					this.cancel();

					//管控高值耗材
					if (this.addNewLocation.length > 1) {
						this.updateUidLocations();
					}
				} else {
					res.iRet === -2 ?
						this.$message({
							message: res.sRet,
							type: "warning",
							showClose: true
						}) :
						this.$message({
							message: "提交数据失败",
							type: "warning",
							showClose: true
						});
				}
			}).catch((err) => {
				Promise.reject(err);
				this.$message({
					message: "请求出错:提交数据失败",
					type: "warning",
					showClose: true
				});
			});
		},
		cancel(s, data) {
			let postData = data ? data : this.layerData;
			if (s === 'cancel') {
				//点击取消按钮的
				RecordExceptionInfo({
					'DH': '',
					'CZLX': 21,
					'BZ': '直接出库-取消',
					'ZDID': '',
					'Data': JSON.stringify(postData),
					'DZLX': 2
				});
			} else if (s === 'success') {
				//点击确定按钮的
				RecordExceptionInfo({
					'DH': '',
					'CZLX': 21,
					'BZ': '直接出库-确认',
					'ZDID': '',
					'Data': JSON.stringify(postData),
					'DZLX': 2
				});
			} else {
				//刷新数据
				if (this.location == 31) {
					//刷新手术已取数据
					this.sSSID ? this.GetUsedItemsInfos(this.sSSID, this.$MyStorage.getItem('wZDID')) : '';
				} else {
					//刷新出入库数据
					//20190611 存在九宫格的时候需要刷新九宫格
					//九宫格标志存在
					this.isShowPalace ? this.GetPalace(this.sZDID) : this.GetZDYWs(this.sZDID);
				}
			}

			this.isShowDialog = false;
			this.uidData = [];
			this.layerData = [];
			this.layerDetail = [];

			//刷回去库存状态
			this.$screen.floodScreenToInv(this.sYGIDArr);

			this.sYGIDArr = [];
			this.sIPGroupArr = [];

			//通过actions刷新数据
			this.GetDrugInfos();
		},
		reDetection() {
			//重新检测
			console.error('检测')
			this.$message({
				message: "正在重新检测标签，请稍候",
				type: "success",
				showClose: true
			});
			// this.redeteLoading = this.$loading({
			// 	lock: true,
			// 	text: '正在重新检测标签',
			// 	spinner: 'el-icon-loading',
			// 	background: 'rgba(0, 0, 0, 0.7)'
			// });

			// setTimeout(() => {
			// 	this.redeteLoading.close();
			// }, 5000);

			let data = this.$store.state.ZDGroup;
			let sZDID = data.includes('|') ? data.split('|') : [];
			this.$nuobo.NBreDelectionRFID({
				data: sZDID,
				InOut: "In"
			});

			//模拟指令
			//this.GetInfoByBarcodes(this.sZDID, 'E280116060000209577CD52F', 'Inc');
		},
		updateUidLocations() {
			updateUidLocation({
				ZDID: this.$MyStorage.getItem('wZDID'),
				Data: JSON.stringify(this.addNewLocation)
			}).then((res) => {
				if (res.iRet > 0) {
					// this.$message({
					// 	message: '添加成功',
					// 	type: "success",
					// 	showClose: true
					// });
				} else {
					// res.iRet === -2 
					// ? this.$message({
					// 	message: res.sRet,
					// 	type: "warning",
					// 	showClose: true
					// })
					// : this.$message({
					// 	message: "添加高值耗材数据失败",
					// 	type: "warning",
					// 	showClose: true
					// });
				}
			}).catch((err) => {
				Promise.reject(err);
				// this.$message({
				// 	message: "请求出错:添加高值耗材数据失败",
				// 	type: "warning",
				// 	showClose: true
				// });
			});
		},
		...mapActions([
			'GetDrugInfos', // 将 `this.GetDrugInfos()` 映射为 `this.$store.dispatch('GetDrugInfos')`
		]),
	},
	watch: {

	}
}
