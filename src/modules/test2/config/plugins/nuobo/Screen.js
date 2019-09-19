/** 
 * 更新硬件的程序集中处理
 * time: 2018-11-29
 * author: ''
 * iSL 取出 SL待取
 */

import Nuobo from './Nuobo'
import MyStorage from '../localStorage/localStorage.js' // 缓存
import {
	GetDrugInfo
} from '../../../server/get/get'

const Screen = {
	//间隔时间
	readLockTime: 160, //盘点读取节点和盘点完成设置节点值的时间间隔
	TimeInterval: 400, //刷新FA屏幕的时间间隔
	sYGTime: 111, //统一刷回库存的时间间隔（两个药格之间）
	sIPGroup: '', //补药状态下使用的 第一个格子发指令 其余不发
	idDataHasFlash: [], //在刷回去库存关顶灯的时候 指令一条一条发下去的 记录每一次的ZDID
	Calibration: function({
		item,
		packageSize = "1"
	}) {
		//console.log('校准', item, items, packageSize)
		//4校准
		let sYGBM = item.sYGBM;
		let sZDID = item.sZDID;
		console.error('校准刷屏数据', item)
		this.floodCellJSON({
			"type": 4,
			'data': [item]
		})

		Nuobo.NBCalibrationStart({
			'sZDID': sZDID,
			'sNode': sYGBM,
			'WeightType': packageSize
		});
	},
	CalibrationBegin({
		item,
		num,
		packageSize = "1"
	}) {
		//开始校准
		//console.log(ws, items, item, num)
		let sZDID = item.sZDID;
		let sYGBM = item.sYGBM;

		Nuobo.NBCalibrationDone({
			'sZDID': sZDID,
			'sNode': sYGBM,
			'iCount': num,
			'WeightType': packageSize
		});
	},
	floodScreenToInv(sYGID, type) {
		//获取所有药品信息(带批号 如果传入sYGID则获取此药格的数据)
		if (!Array.isArray(sYGID) || sYGID.length === 0) return
		if (sYGID.length !== 0) sYGID.unshift(0);

		GetDrugInfo({
			"Param": JSON.stringify([3, "获取所有药品信息", MyStorage.getItem('wZDID'), sYGID])
		}).then((res) => {
			if (res.iRet > 0) {
				//一个target最长30
				let len = res.data.length;

				for (let i = 0; i < len; i++) {
					let time = 600 * (Math.floor(i / 5));
					//console.error('time', time)
					setTimeout(() => {
						//console.error('时间', +new Date())
						this.downfloodScreenJSON([res.data[i]], type);
					}, time)
				}

				//总时间
				let sTime = 600 * (Math.floor(len / 5) - 1) + 200;
				setTimeout(() => {
					this.idDataHasFlash = [];
				}, sTime)

				if (this.sIPGroup) this.sIPGroup = '';
			} else {
				//this.$message('获取药柜层数据失败');
			}
		})
	},
	downfloodScreenJSON: function(WholeArr, type) {
		//集中处理取消确认返回的数据
		let dataHasLed = [],
			dataHasScreenF = [],
			dataHasScreenM = [],
			dataHasGravity = [],
			dataHasFlash = [],
			dataHasRGB = [],
			dataHasMDLcd = [];
		WholeArr.forEach((value) => {
			//有灯的数据led
			if (Nuobo.NBGetKZYS(0, value.iCKZYS, value.iKZYS) && MyStorage.getItem('CS').isCooperatLed !== '是') dataHasLed.push(
				value);
			//有灯的数据led
			if (Nuobo.NBGetKZYS(8, value.iCKZYS, value.iKZYS)) dataHasRGB.push(value);
			//有顶灯的数据
			if (
				Nuobo.NBGetKZYS(7, this.getZDKZYS(value.sYGID)) &&
				this.idDataHasFlash.includes(value.sZDID)
			) {
				//暂不考虑刷新的情况
				dataHasFlash.push(value);
				if (this.idDataHasFlash.length > 0) this.idDataHasFlash.deleteItems(value.sZDID);
			}
			//有FA的数据
			if (Nuobo.NBGetKZYS(4, value.iCKZYS, value.iKZYS)) dataHasScreenF.push(value);
			//有M的数据
			if (Nuobo.NBGetKZYS(5, value.iCKZYS, value.iKZYS)) dataHasScreenM.push(value);
			//MD 的LCD屏幕
			if (Nuobo.NBGetKZYS(10, value.iCKZYS, value.iKZYS)) dataHasMDLcd.push(value);
			//有称重
			if (type && Nuobo.NBGetKZYS(3, 0, value.iKZYS) && MyStorage.getItem('CS').isAutoInventory === '1') dataHasGravity
				.push(value);
		})

		if (dataHasLed.length > 0) {
			//重力AF 灯
			Nuobo.NBLedCTJSON({
				"data": dataHasLed,
				"Led": "Off"
			});
		}

		if (dataHasRGB.length > 0) {
			//F300关闭屏幕RGB灯
			Nuobo.NBSetRGBLedColor({
				"data": dataHasRGB,
				"RGB": '000000'
			});
		}

		if (dataHasGravity.length > 0) {
			//盘点模块 有称重
			Nuobo.NBSetCountJSON({
				"data": dataHasGravity
			});
		}

		if (dataHasFlash.length > 0) {
			//F3000关闭顶灯
			Nuobo.NBSetRGBLedCorlorFlash({
				"data": dataHasFlash,
				"State": "DecAll"
			});
		}

		if (dataHasScreenF.length > 0) {
			//F A
			dataHasScreenF.forEach((value) => {
				//批号从所有药品取
				value.sPH = value.PHXQ;
				value.sKC = value.iCFSL;
			})
			Nuobo.NBLCDsetJSON({
				'type': 0,
				'data': dataHasScreenF,
				'Save': 1,
				'isUseAllData': false
			});
		}

		if (dataHasScreenM.length > 0) {
			//H  bool左屏停止闪烁
			dataHasScreenM.forEach((value) => {
				//批号从所有药品取
				value.iSL = value.iCFSL;
			})

			if (MyStorage.getItem('CS').isUseLeftScreen === '是') Nuobo.NBOLEDBlinks({
				num: 0,
				'sNode': sNode
			});
			Nuobo.NBNewOLEDSetJSON({
				'type': 1,
				'data': dataHasScreenM
			});
		}

		//MD的LCD小屏幕
		if (dataHasMDLcd.length > 0) {
			//刷成库存
			dataHasMDLcd.forEach((value) => {
				//批号从所有药品取
				value.iSL = value.iCFSL;
			})

			Nuobo.NBLCDsetMDRightJSON({
				'type': 1,
				'data': dataHasMDLcd
			});
		}
	},
	floodCell: function({
		type,
		data,
		assort,
		DevNum
	}) {
		//刷屏（初始状态的刷屏）assort 1:'待补','已补'+SL(同取)2:'待补'+iSL,'已补0'（同取）3:'待取'+iSL,'已取'+SL（同取）:'待退','已退' + 
		// console.error(type, data, assort)
		let DataJSON = data;
		Array.isArray(DataJSON) ? DataJSON = data : DataJSON = [data];
		//console.error('DataJSON', DataJSON.length)
		this.floodCellJSON({
			'type': type,
			'data': DataJSON,
			'assort': assort
		});
	},
	floodCellJSON: function({
		type,
		data,
		assort
	}) {
		//刷屏（初始状态的刷屏）assort 1:'待补','已补'+SL(同取)2:'待补'+iSL,'已补0'（同取）3:'待取'+iSL,'已取'+SL（同取）:'待退','已退' + 
		if (data === null || !Array.isArray(data)) return

		let dataSet = JSON.parse(JSON.stringify(data));

		let dataHasLed = [],
			dataHasScreenF = [],
			dataHasScreenM = [],
			dataHasGravity = [],
			dataHasFlash = [],
			dataHasRGB = [],
			dataHasMDLcd = [];
		dataSet.forEach((value) => {
			//有灯的数据
			if (Nuobo.NBGetKZYS(0, value.iCKZYS, value.iKZYS) && type !== 7) dataHasLed.push(value);
			//有灯的数据led
			if (Nuobo.NBGetKZYS(8, value.iCKZYS, value.iKZYS)) dataHasRGB.push(value);
			//有顶灯的数据
			if (Nuobo.NBGetKZYS(7, this.getZDKZYS(value.sYGID)) && !this.idDataHasFlash.includes(value.sZDID)) {
				dataHasFlash.push(value);
				this.idDataHasFlash.push(value.sZDID);
			}
			//有FA的数据
			if (Nuobo.NBGetKZYS(4, value.iCKZYS, value.iKZYS)) dataHasScreenF.push(value);
			//有M的数据
			if (Nuobo.NBGetKZYS(5, value.iCKZYS, value.iKZYS)) dataHasScreenM.push(value);
			//MD 的LCD屏幕
			if (Nuobo.NBGetKZYS(10, value.iCKZYS, value.iKZYS)) dataHasMDLcd.push(value);
			//有称重
			if (type === 3 && Nuobo.NBGetKZYS(3, 0, value.iKZYS) && MyStorage.getItem('CS').isAutoInventory === '1')
				dataHasGravity.push(value);
		})

		//自动盘点
		if (dataHasGravity.length > 0) {
			let sZDID = dataHasGravity[0].sZDID;
			//let sYGFF = dataHasGravity[0].sYGBM.substring(0, 2) + 'FF';
			let sYGFF = dataHasGravity[0].sYGBM;

			Nuobo.NBReadCount({
				"sZDID": sZDID,
				"sNode": sYGFF
			});
		}

		console.error(dataHasLed, dataHasRGB, dataHasFlash, dataHasScreenF, dataHasScreenM, dataHasGravity)
		if (dataHasLed.length > 0) {
			if (type === 5) {
				//type 5 表示删除管控
				//测试使用 删除的时候开关一下

			} else {
				//开灯
				Nuobo.NBLedCTJSON({
					"data": dataHasLed,
					"Led": "On"
				});
			}
		}

		if (dataHasFlash.length > 0) {
			//F3000开大灯
			Nuobo.NBSetRGBLedCorlorFlash({
				"data": dataHasFlash,
				"State": "Inc",
				"RGB": "0000FF"
			});
		}

		if (dataHasRGB.length > 0) {
			//F3000屏幕灯
			if (type === 5) {
				//删除的时候关灯
				Nuobo.NBSetRGBLedColor({
					"data": dataHasRGB,
					"RGB": '000000'
				});
			} else if (type !== 7) {
				//setTimeout(() => {
				Nuobo.NBSetRGBLedColor({
					"data": dataHasRGB,
					"RGB": '0000FF'
				});
				//}, 200)
			}
		}

		//F A
		if (dataHasScreenF.length > 0) {
			//0-库存状态   1-补药状态   2-取药状态  3-盘点状态  4-校准  5-清除指令 6-退药状态
			dataHasScreenF.forEach((value) => {
				//批号从所有药品取
				if (value.aMXList) {
					value.sPH = value.aMXList
				} else {
					let sDrug = MyStorage.getItem('DRUG');
					value.sPH = sDrug.filter((v) => {
						return (value.sDCTXIP === v.sDCTXIP || value.sZDID === v.sZDID) && value.sYGBM === v.sYGBM;
					}).map((value) => {
						return value.PHXQ;
					})[0]
				}

				value.sYPLX = this.colation(value.sYWID);
			})

			if (type === 0 || type === 3 || type === 4 || type === 5 || type === 7) {
				//盘点
				if (type === 7) type = 0;
				Nuobo.NBLCDsetJSON({
					'type': type,
					'data': dataHasScreenF
				});
			} else {
				//其它
				Nuobo.NBLCDsetJSON({
					'type': type,
					'data': dataHasScreenF
				});

				//暂时先注释 20190524
				// Nuobo.NBLCDsetCountJSON({ 'data': dataHasScreenF });
			}
		}

		if (dataHasScreenM.length > 0) {
			//M D小屏 
			dataHasScreenM.forEach((value) => {
				//批号从所有药品取
				value.iYPLX = this.colation(value.sYWID);
				if (value.sPM == '' && value.SL) value.SL = 0;
				value.SL == 0 ? value.SL = 'FF' : value.SL = value.SL;

				type = +type;
				if ((type === 1 || type === 6 || type === 2) && assort === 1) value.iSL = 'FF';
				if ((type === 0 || type === 3 || type === 4 || type === 7) || (type === 2 && assort === 2)) value.SL = 'FF';
				//自动刷屏 2 2 -> 0 20190103注释
				//if (type === 2 && assort === 2) value.iSL = 0;
			})

			//1 库存 2 取药 3 补药 4 盘点  5校准 6仅刷新变化数字
			switch (+type) {
				case 0:
					//第二个屏刷成库存单位
					Nuobo.NBNewOLEDSetJSON({
						'type': 1,
						'data': dataHasScreenM
					});
					//Nuobo.NBNewOLEDSet({'type': 1, 'data': sYGBM, 'num1': iSL, 'num2': 'FF'});
					break;
				case 1:
				case 6:
					//补药状态（直接补药和按单补药）
					if (assort === 1) {
						//Nuobo.NBNewOLEDSet({'type': 3, 'sNode': sYGBM, 'num1': 'FF', 'num2': SL});
						MyStorage.getItem('CS').isUnderlyingControl !== '是' && Nuobo.NBNewOLEDSetJSON({
							'type': 3,
							'data': dataHasScreenM
						});
					} else if (assort === 2) {
						//交给底层控制 在通用里面层进入补药状态  这一个格子进入另一个补药状态
						//2  已知取药数量，立即刷屏，并且取放药时也刷屏  3 已知补药数量，立即刷屏，并且取放药时也刷屏

						if (MyStorage.getItem('CS').isUnderlyingControl === '是') {
							let sIPG = sIP + '-' + sYGBM;
							Nuobo.NBBotConCellJSON({
								'data': dataHasScreenM,
								'type': 3
							})
						} else {
							//Nuobo.NBNewOLEDSet({'type': 3, 'sNode': sYGBM, 'num1': iSL, 'num2': SL});
							Nuobo.NBNewOLEDSetJSON({
								'type': 3,
								'data': dataHasScreenM
							});
						}
					}
					break;
				case 2:
					//取药状态（直接取药和处方取药医嘱取药等）
					if (assort === 1) {
						//Nuobo.NBNewOLEDSet({'type': 2, 'sNode': sYGBM, 'num1': 'FF', 'num2': SL});
						MyStorage.getItem('CS').isUnderlyingControl !== '是' && Nuobo.NBNewOLEDSetJSON({
							'type': 2,
							'data': dataHasScreenM
						});
					} else if (assort === 2) {
						//Nuobo.NBNewOLEDSet({'type': 2, 'sNode': sYGBM, 'num1': iSL, 'num2': 'FF'});
						MyStorage.getItem('CS').isUnderlyingControl === '是' ?
							Nuobo.NBBotConCellJSON({
								'data': dataHasScreenM,
								'type': 2
							}) :
							Nuobo.NBNewOLEDSetJSON({
								'type': 2,
								'data': dataHasScreenM
							});
						if (MyStorage.getItem('CS').isUseLeftScreen === '是') Nuobo.NBOLEDBlinks({
							num: 1,
							'sNode': sYGBM
						});
					} else if (assort === 3) {
						//Nuobo.NBNewOLEDSet({'type': 2, 'sNode': sYGBM, 'num1': iSL, 'num2': SL});
						MyStorage.getItem('CS').isUnderlyingControl === '是' ?
							Nuobo.NBBotConCellJSON({
								'data': dataHasScreenM,
								'type': 2
							}) :
							Nuobo.NBNewOLEDSetJSON({
								'type': 2,
								'data': dataHasScreenM
							});
					}
					break;
				case 3:
					//盘点状态
					//Nuobo.NBNewOLEDSet({'type': 4, 'sNode': sYGBM, 'num1': iSL, 'num2': 'FF'});
					Nuobo.NBNewOLEDSetJSON({
						'type': 4,
						'data': dataHasScreenM
					});
					break;
				case 4:
					//校准
					//Nuobo.NBNewOLEDSet({'type': 5, 'sNode': sYGBM, 'num1': iSL, 'num2': 'FF'});
					Nuobo.NBNewOLEDSetJSON({
						'type': 5,
						'data': dataHasScreenM
					});
					break;
				case 5:
					//清除小屏幕
					//Nuobo.NBOLEDClearBoth({'sNode': sYGBM})
					Nuobo.NBOLEDClearBoth({
						'data': dataHasScreenM
					});
					break;
				case 7:
					//管控刷品名 规格
					//if (sPM == '') SL = '';
					//if (MyStorage.getItem('CS').isShowShortName === '是') sPM = data.sYWJC || '简称';

					//Nuobo.NBOLEDSet({'type': 0, 'sNode': sYGBM, 'sText1':sPM, 'sText2':sGG});
					Nuobo.NBOLEDSetJSON({
						data: dataHasScreenM
					})
					Nuobo.NBNewOLEDSetJSON({
						'type': 1,
						'data': dataHasScreenM
					});
					//Nuobo.NBNewOLEDSet({'type': 1, 'sNode': sYGBM, 'num1': iSL, 'num2': 'FF'});
					break;
			}
		}

		//MD的LCD小屏幕
		if (dataHasMDLcd.length > 0) {
			//M D LCD小屏幕
			dataHasMDLcd.forEach((value) => {
				//批号从所有药品取
				value.iYPLX = this.colation(value.sYWID);
				if (value.sPM == '' && value.SL) value.SL = 0;
				value.SL == 0 ? value.SL = '0xFFFF' : value.SL = value.SL;

				type = +type;
				if ((type === 1 || type === 6 || type === 2) && assort === 1) value.iSL = '0xFFFF';
				if ((type === 0 || type === 3 || type === 4 || type === 7) || (type === 2 && assort === 2)) value.SL = '0xFFFF';
				//自动刷屏 2 2 -> 0 20190103注释
				//if (type === 2 && assort === 2) value.iSL = 0;
			})

			//1 库存 2 取药 3 补药 4 盘点  5校准 6仅刷新变化数字 7管控品名
			switch (+type) {
				case 0:
					//右屏刷成库存单位
					Nuobo.NBLCDsetMDRightJSON({
						'type': 1,
						'data': dataHasMDLcd
					});
					break;
				case 1:
				case 6:
					//补药状态（直接补药和按单补药）
					if (assort === 1) {
						//Nuobo.NBNewOLEDSet({'type': 3, 'sNode': sYGBM, 'num1': 'FF', 'num2': SL});
						MyStorage.getItem('CS').isUnderlyingControl !== '是' && Nuobo.NBLCDsetMDRightJSON({
							'type': 3,
							'data': dataHasMDLcd
						});
					} else if (assort === 2) {
						//交给底层控制 在通用里面层进入补药状态  这一个格子进入另一个补药状态
						//2  已知取药数量，立即刷屏，并且取放药时也刷屏  3 已知补药数量，立即刷屏，并且取放药时也刷屏

						if (MyStorage.getItem('CS').isUnderlyingControl === '是') {
							//let sIPG = sIP + '-' + sYGBM;
							Nuobo.NBRightAotoDisPlayJSON({
								'data': dataHasMDLcd,
								'type': 3
							})
						} else {
							//Nuobo.NBNewOLEDSet({'type': 3, 'sNode': sYGBM, 'num1': iSL, 'num2': SL});
							Nuobo.NBLCDsetMDRightJSON({
								'type': 3,
								'data': dataHasMDLcd
							});
						}
					}
					break;
				case 2:
					//取药状态（直接取药和处方取药医嘱取药等）
					if (assort === 1) {
						//Nuobo.NBNewOLEDSet({'type': 2, 'sNode': sYGBM, 'num1': 'FF', 'num2': SL});
						MyStorage.getItem('CS').isUnderlyingControl !== '是' && Nuobo.NBLCDsetMDRightJSON({
							'type': 2,
							'data': dataHasMDLcd
						});
					} else if (assort === 2) {
						//Nuobo.NBNewOLEDSet({'type': 2, 'sNode': sYGBM, 'num1': iSL, 'num2': 'FF'});
						MyStorage.getItem('CS').isUnderlyingControl === '是' ?
							Nuobo.NBRightAotoDisPlayJSON({
								'data': dataHasMDLcd,
								'type': 2
							}) :
							Nuobo.NBLCDsetMDRightJSON({
								'type': 2,
								'data': dataHasMDLcd
							});
						if (MyStorage.getItem('CS').isUseLeftScreen === '是') Nuobo.NBOLEDBlinks({
							num: 1,
							'sNode': sYGBM
						});
					} else if (assort === 3) {
						//Nuobo.NBNewOLEDSet({'type': 2, 'sNode': sYGBM, 'num1': iSL, 'num2': SL});
						MyStorage.getItem('CS').isUnderlyingControl === '是' ?
							Nuobo.NBRightAotoDisPlayJSON({
								'data': dataHasMDLcd,
								'type': 2
							}) :
							Nuobo.NBLCDsetMDRightJSON({
								'type': 2,
								'data': dataHasMDLcd
							});
					}
					break;
				case 3:
					//盘点状态
					Nuobo.NBLCDsetMDRightJSON({
						'type': 4,
						'data': dataHasMDLcd
					});
					break;
				case 4:
					//校准
					Nuobo.NBLCDsetMDRightJSON({
						'type': 5,
						'data': dataHasMDLcd
					});
					break;
				case 5:
					//清除小屏幕
					Nuobo.NBClearLCDMDJSON({
						'data': dataHasMDLcd,
						'Clear': 'Both'
					});
					break;
				case 7:
					//只有在管控的时候才调用Left指令下发左屏（品名 规格）
					Nuobo.NBLCDsetMDLeftJSON({
						'data': dataHasMDLcd
					});
					//右屏幕刷成0
					Nuobo.NBLCDsetMDRightJSON({
						'type': 1,
						'data': dataHasMDLcd
					})
					break;
			}
		}
	},
	floodNumber: function({
		type,
		data,
		assort
	}) {
		//只改数字部分  assort 1:'待补','已补'+SL(同取)  2： '待补'+iSL,'已补'+SL（同取）
		if (data === null || typeof data !== 'object') return

		let DataJSON = data;
		Array.isArray(DataJSON) ? DataJSON = data : DataJSON = [data];
		this.floodNumberJSON({
			'type': type,
			'data': DataJSON,
			'assort': assort
		});
	},
	floodNumberJSON: function({
		type,
		data,
		assort
	}) {
		if (data === null || !Array.isArray(data)) return

		let dataSet = JSON.parse(JSON.stringify(data));

		let dataHasScreenF = [],
			dataHasScreenM = [],
			dataHasMDLcd = [];
		dataSet.forEach((value) => {
			//有FA的数据
			if (Nuobo.NBGetKZYS(4, value.iCKZYS, value.iKZYS)) dataHasScreenF.push(value);
			//有M的数据
			if (Nuobo.NBGetKZYS(5, value.iCKZYS, value.iKZYS)) dataHasScreenM.push(value);
			//MD 的LCD屏幕
			if (Nuobo.NBGetKZYS(10, value.iCKZYS, value.iKZYS)) dataHasMDLcd.push(value);
		})

		//只发送数字(包含毒麻药单个)floodScreen(1 || 2, ckzys, kzys, ip, node, '', '', SL, '', 'number')
		if (dataHasScreenF.length > 0) {
			Nuobo.NBLCDsetCountJSON({
				'data': dataHasScreenF
			});
		}

		if (dataHasScreenM.length > 0) {
			dataHasScreenM.forEach((value) => {
				value.SL == 0 ? value.SL = 'FF' : value.SL = value.SL;
			})

			switch (type) {
				case 1:
					if (assort === 1) {
						//Nuobo.NBOLEDSet(2, sYGBM, '待补', '已补' + SL);
						MyStorage.getItem('CS').isUnderlyingControl !== '是' && Nuobo.NBNewOLEDSetJSON({
							'type': 3,
							'data': dataHasScreenM
						});
					} else if (assort === 2) {
						//Nuobo.NBOLEDSet(2, sYGBM, '待补' + iSL, '已补' + SL); Nuobo.NBBotConCell(sYGBM, iSL, SL, 3)
						//交给底层控制 在通用里面层进入补药状态  这一个格子进入另一个补药状态
						//2  已知取药数量，立即刷屏，并且取放药时也刷屏  3 已知补药数量，立即刷屏，并且取放药时也刷屏

						MyStorage.getItem('CS').isUnderlyingControl === '是' ?
							'' :
							Nuobo.NBNewOLEDSetJSON({
								'type': 3,
								'data': dataHasScreenM
							});
					}
					break;
				case 2:
					if (assort === 1) {
						//Nuobo.NBOLEDSet(2,sYGBM,'待取','已取' + SL);
						MyStorage.getItem('CS').isUnderlyingControl !== '是' && Nuobo.NBNewOLEDSetJSON({
							'type': 6,
							'data': dataHasScreenM
						});
					} else if (assort === 2) {
						//Nuobo.NBOLEDSet(2, sYGBM, '待取' + iSL, '已取' + SL);	 Nuobo.NBBotConCell(sYGBM, iSL, SL, 2)
						MyStorage.getItem('CS').isUnderlyingControl === '是' ?
							'' :
							Nuobo.NBNewOLEDSetJSON({
								'type': 6,
								'data': dataHasScreenM
							});
					}
					break;
			}
		}

		//MD的LCD小屏幕
		if (dataHasMDLcd.length > 0) {
			Nuobo.NBLCDsetMDRightJSON({
				'type': 6,
				'data': dataHasMDLcd
			});
		}
	},
	colation(sYWID) {
		//console.log('特殊药品', sPM)
		let sDrugAll = MyStorage.getItem('DRUG');
		if (sDrugAll.length > 0) {
			let sDrug = sDrugAll.filter((value) => {
				return sYWID === value.sYWID
			})

			if (sDrug.length > 0) {
				console.error('特殊药品', sYWID, sDrug[0].iJSBZ)
				return sDrug[0].iJSBZ
			} else {
				return ''
			}
		} else {
			return ''
		}
	},
	getZDKZYS(sYGID) {
		let sDrug = MyStorage.getItem('DRUG');
		let arr = sDrug.filter((value) => {
			return sYGID === value.sYGID
		});
		if (arr.length > 0) {
			console.error('终端样式', sYGID, arr[0].iZDKZYS)
		}

		return arr.length > 0 ? arr[0].iZDKZYS : 0;
	}
}

Object.seal(Screen);

export default Screen;
