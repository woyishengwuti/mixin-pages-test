/**
 * 本js实现页面与底层中间层进行通信交互的函数相关.以及其他通用方法封装. 适配耗材柜
 * @Author Wu
 * @Date 2018/10/31 10:38:00
 * @Date 2019/01/12 添加MD柜的左右屏幕LCD指令
 * @Ver v1.1.1
 */

import MyStorage from '../localStorage/localStorage.js' // 缓存
import {
	typeH
} from '../../env/ship'

const Nuobo = {
	dll: 'NBC_COMM_DLL.dll',
	dllPrint: 'NBC_REPORT.dll',
	//是否开启TCP模式 默认 '0':TCP字符串模式  '1':TCP JSON模式 '2':webs JSON
	TCPMode: DELPHI_JS.ReadIniValue('TXMS', 'CMode', '') === 'Error' ? '0' : DELPHI_JS.ReadIniValue('TXMS', 'CMode', ''),
	relationship() {
		return (this.TCPMode === '0' || this.TCPMode === 'Error') ? 'Str' : 'Json';
	},
	IntevalTime() {
		return +MyStorage.getItem('CS').IntevalTime || 200;
	},
	NBHsptlName() {
		//小屏幕中医院名称医院名称
		return MyStorage.getItem('HosPitalName') ? MyStorage.getItem('HosPitalName') : '医院名称';
	},
	NBYGInit: function(iDebug) {
		//初始化  耗材新协议
		iDebug > '0' ? DELPHI_JS.LoadDll(this.dll, 'bDebug=On,MidComm=1') : DELPHI_JS.LoadDll(this.dll, 'MidComm=1');
	},
	NBYGInitAutoReboot(iDebug, TimePoint) {
		//初始化读取配置文件AutoReboot定时重启  iDebug-是否开启DEBUG 1-on 0-off */ (变量来自于浏览器配置文件)
		iDebug > '0' ?
			DELPHI_JS.LoadDll(this.dll, 'bDebug=On,AutoRebootTime=' + TimePoint) :
			DELPHI_JS.LoadDll(this.dll, "AutoRebootTime=" + TimePoint);
	},
	NBPrintInit: function() {
		//初始化打印DLL
		DELPHI_JS.LoadDll(this.dllPrint, '');
	},
	NBPrint: function(cmd) {
		//调用打印DLL
		DELPHI_JS.CallDll(this.dllPrint, JSON.stringify(cmd));
	},
	NBPrintExit: function() {
		//释放打印DLL
		DELPHI_JS.FreeDll(this.dllPrint);
	},
	NBExit: function() {
		//释放DLL
		DELPHI_JS.FreeDll(this.dll);
	},
	NBSetHost(sContent, iMode = '1') {
		//设置发送目标  sContent-通讯内容(ip或者COM串口取决于通信模式) (All变量来自于数据库ZDXXB)
		//iMode 1-TCP通讯 2-COM通讯
		//可以用来防止浏览器自动退出（设置了自动退出时间）
		if (sContent && this.TCPMode === '0') {
			let cmd = 'Write=' + this.uid() + ',ComMode=' + iMode + ',Content=' + sContent;
			DELPHI_JS.CallDll(this.dll, cmd);
		}
	},
	NBReboot(t = 1) {
		//1 重启 2 关机
		DELPHI_JS.CallDll(this.dll, 'Restart=' + t);
	},
	NBFingerListenOn: function(AllFeatures, isNewFinger) {
		//新版协议指纹检测
		let FingType = MyStorage.getItem('FingType');

		if (FingType === '1') {
			//新的指纹仪只需要打开一次 旧的需要不断的开和关
			if (isNewFinger) this.post('Write=' + this.uid() + ',AllFeatures=' + AllFeatures);
		} else {
			//打开旧的指纹仪
			this.post('Write=' + this.uid() + ',FingerListen=On,FingerType=0,TZM=' + AllFeatures);
		}
	},
	NBFingerListenOff() {
		//关闭指纹监听
		let FingType = MyStorage.getItem('FingType');
		if (FingType === '1') {
			//新版没有关闭指令

		} else {
			this.post('Write=' + this.uid() + ',FingerListen=Off');
		}
	},
	NBFingerToDll: function(GatherFeatures) {
		//新版协议指纹检测，将硬件上报的指纹特征码发个dll进行比对
		this.post('Write=' + Nuobo.uid() + ',GatherFeatures=' + GatherFeatures);
	},
	NBFingerRegist({
		sZDID,
		Count
	}) {
		let FingType = MyStorage.getItem('FingType');

		if (FingType === '1') {
			//获取指纹采集数据  Count 0-取消 1-第一次注册 2-第二次注册 3-第三次 （之后调用脚本保存）
			let target = {
				"DevNum": sZDID,
				"Addr": "0000",
				"Count": Count
			}
			let data = this.NBCreateJSON({
				"MethodNum": 1250,
				"MethodName": "SetFingerPrintEntering",
				"Target": [target]
			});
			this.post(data);
		} else {
			let cmd = 'Write=' + this.uid() + ',FingerRegist=' + Count;
			this.post(cmd);
		}
	},
	NBFingerSave() {
		//保存指纹  
		let cmd = 'Write=' + this.uid() + ',SaveFinger=218';
		this.post(cmd);
	},
	uid(max = 9999, min = 1000) {
		//生成一个随机数
		return ((Math.random() * (max - min)) + min).toFixed(0);
	},
	NBGetKZYS(iType, iCkzys, iGkzys) {
		//判断硬件是否具备 灯,锁,盖,屏幕,称,空瓶回收格子
		//iType 判断类型  0-灯  1-锁  2-盖  3-称   4-屏幕(药架480*320屏幕) 5-屏幕(药柜OLED小屏幕) 6-空瓶回收格子
		//iCkzys - 层控制样式  iGkzys - 格控制样式
		//type 为7的时候iCkzys传入iZDKZYS

		let a = iCkzys;
		let b = iGkzys;

		let type = {
			0: () => {
				//灯 led
				return ((1 & a) === 1 || (1 & b) === 1) ? true : false;
			},
			1: () => {
				//锁
				return ((2 & a) === 2 || (2 & b) === 2) ? true : false;
			},
			2: () => {
				//盖
				return (2 & b) === 2 ? true : false;
			},
			3: () => {
				//称
				return (8 & b) === 8 ? true : false;
			},
			4: () => {
				//屏幕(药架480*320屏幕)
				return (16 & b) === 16 ? true : false;
			},
			5: () => {
				//屏幕(药柜OLED小屏幕) 
				return (4 & b) === 4 ? true : false;
			},
			6: () => {
				//空瓶回收格子
				return (32 & b) === 32 ? true : false;
			},
			7: () => {
				//终端控制样式 顶灯
				return (2 & a) === 2 ? true : false;
			},
			8: () => {
				//灯 RGB
				return (512 & b) === 512 ? true : false;
			},
			9: () => {
				//终端锁
				return (1 & b) === 1 ? true : false;
			},
			10: () => {
				//MD柜子的LCD屏幕
				return (1024 & b) === 1024 ? true : false;
			},
			11: () => {
				//终端的 高值锁
				return (4 & a) === 4 ? true : false;
			}
		}

		return type[+iType]()
	},
	NBGetJSBZ_KZYS(iType, ywKZYS) {
		//警示标志
		let c = +ywKZYS;

		switch (parseInt(iType)) {
			case 0:
				//毒性药品
				return (1 & c) === 1 ? true : false;
			case 1:
				//麻醉药品 
				return (2 & c) === 2 ? true : false;
			case 2:
				//高危药品
				return (4 & c) === 4 ? true : false;
			case 3:
				//精神药品
				return (8 & c) === 8 ? true : false;
			case 4:
				//外用药品
				return (16 & c) === 16 ? true : false;
			case 9:
				//外用药品
				return (512 & c) === 512 ? true : false;
			case 5:
				//看似
				return (32 & c) === 32 ? true : false;
			case 6:
				//听似
				return (64 & c) === 64 ? true : false;
			case 7:
				//多规
				return (128 & c) === 128 ? true : false;
			case 8:
				//急救
				return (256 & c) === 256 ? true : false;
			case 9:
				//二类精神药品
				return (512 & c) === 512 ? true : false;
			case 10:
				//避光属性
				return (1024 & c) === 1024 ? true : false;
			case 11:
				//多剂型药品
				return (2048 & c) === 2048 ? true : false;
		}
	},
	NBGetYPSX(iType, iSxbz) {
		//药品属性 iType 判断类型  0 双人核对 1 空瓶回收 2 处方打印 
		//iSxbz 属性标志
		let a = +iSxbz;
		switch (parseInt(iType)) {
			case 0:
				//双人核对
				return (1 & a) === 1 ? true : false;
			case 1:
				//空瓶回收
				return (2 & a) === 2 ? true : false;
			case 2:
				//处方打印
				return (4 & a) === 4 ? true : false;
		}
	},
	NBCreateJSON({
		MethodNum,
		MethodName,
		Target
	}) {
		//获取JSON类型数据
		let cmd = {
			"SerialNum": 32,
			"Data": {
				"MethodNum": MethodNum,
				"MethodName": MethodName,
				"Target": Target
			}
		}

		return JSON.stringify(cmd)
	},
	NBSetDeviceModel({
		sZDID,
		Product = "H-Serial",
		Model = "H1304",
		TeleParamsData = []
	}) {
		//下发设备模型到中间件
		let TeleParams = TeleParamsData.map((_v) => {
			return {
				"Name": _v.sMKMC,
				"TeleType": _v.sMKTXLX,
				"Param1": _v.sPARAM1,
				"Param2": _v.sPARAM2,
				"Param3": _v.sPARAM3
			}
		})

		let target = {
			"DevNum": sZDID,
			"Addr": '0000',
			"Product": Product,
			"Model": Model,
			"TeleParams": TeleParams,
			"Special": {}
		}
		let data = this.NBCreateJSON({
			"MethodNum": 1,
			"MethodName": "SetDeviceModel",
			"Target": [target]
		});
		//console.error(data)
		this.post(data);
	},
	NBDeleteDeviceModel(sZDID) {
		let target = {
			"DevNum": sZDID,
			"Addr": '0000'
		}
		let data = this.NBCreateJSON({
			"MethodNum": 2,
			"MethodName": "DeleteDeviceModel",
			"Target": [target]
		});
		this.post(data);
	},
	NBreDelectionRFID({
		data,
		InOut = "In"
	}) {
		//重新检测 上报差值
		let target = data.map((value) => {
			return {
				"DevNum": value,
				"Addr": '0100',
				"InOut": InOut
			}
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 1208,
			"MethodName": "CheckRFIDRealList",
			"Target": target
		})
		this.post(sendData);
	},
	NBGetRFIDRealList({
		data,
		InOut = "In"
	}) {
		//1.3.2.10实时读取耗材柜RFID标签列表
		let target = data.map((value) => {
			return {
				"DevNum": value,
				"Addr": '0000',
				"InOut": InOut,
				'Time': 3000
			}
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 1207,
			"MethodName": "GetRFIDRealList",
			"Target": target
		})
		this.post(sendData);
	},
	NBReadLock({
		sZDID,
		sNode,
		sZDGroup,
		type
	}) {
		//读取锁状态    sNode -节点值
		let target;
		Array.isArray(sZDGroup) ?
			target = sZDGroup.map((value) => {
				return {
					"DevNum": value.sZDID,
					"Addr": value.sCZBM
				};
			}) :
			target = [{
				"DevNum": sZDID,
				"Addr": sNode
			}];

		//返回了终端类型编码
		//20190619 添加低值的高值锁判断
		if (type) {
			type = type;
		} else {
			//type不存在
			let sZDLXBM = this.sTypeInfo({
				sZDID: sZDID,
				sCZBM: sNode,
				name: 'sZDLXBM'
			});
			if (typeH.includes(sZDLXBM)) {
				//高值
				type = 'H';
			} else {
				//低值
				let iKZYS = this.sTypeInfo({
					sZDID: sZDID,
					sCZBM: sNode,
					name: 'iKZYS'
				});
				if (this.NBGetKZYS(11, iKZYS)) {
					//低值柜 高值锁 需要发高值的指令
					type = 'H';
				} else {
					type = 'A';
				}
			}
		}

		let MethodNum = type === 'H' ? 1211 : 903;
		let data = this.NBCreateJSON({
			"MethodNum": MethodNum,
			"MethodName": "GetLockState",
			"Target": target
		});
		this.post(data);
	},
	NBSetLockState({
		sZDID,
		sNode,
		state = "Unlock",
		type
	}) {
		//开锁	sNode -节点值
		let target = {
			"DevNum": sZDID,
			"Addr": sNode,
			"State": state
		};

		//返回了终端类型编码
		//20190619 添加低值的高值锁判断
		if (type) {
			type = type;
		} else {
			//type不存在
			let sZDLXBM = this.sTypeInfo({
				sZDID: sZDID,
				sCZBM: sNode,
				name: 'sZDLXBM'
			});
			if (typeH.includes(sZDLXBM)) {
				//高值
				type = 'H';
			} else {
				//低值
				let iKZYS = this.sTypeInfo({
					sZDID: sZDID,
					sCZBM: sNode,
					name: 'iKZYS'
				});
				if (this.NBGetKZYS(11, iKZYS)) {
					//低值柜 高值锁
					type = 'H';
				} else {
					type = 'A';
				}
			}
		}

		let MethodNum = type === 'H' ? 1210 : 902;
		let data = this.NBCreateJSON({
			"MethodNum": MethodNum,
			"MethodName": "SetLockState",
			"Target": [target]
		})
		this.post(data);
	},
	NBSetRGBLedColor({
		data,
		RGB
	}) {
		//设置RGB颜色  开：00CD65   000000
		let target = data.map((value) => {
			return {
				"DevNum": value.sZDID,
				"Addr": value.sYGBM,
				"RGB": RGB
			}
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 1218,
			"MethodName": "SetRGBLedColor",
			"Target": target
		})
		this.post(sendData);
	},
	NBLedCTJSON({
		data,
		Led = "Off"
	}) {
		//JSON开灯  sNode-节点值
		let target = data.map((value) => {
			return {
				"DevNum": value.sZDID,
				"Addr": value.sYGBM,
				"Led": Led
			}
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 1214,
			"MethodName": "SetLightStatus",
			"Target": target
		})
		this.post(sendData);
	},
	NBCalibrationStart({
		sZDID,
		sNode,
		WeightType = "1"
	}) {
		//开始校准  sNode-节点值
		let target = {
			"DevNum": sZDID,
			"Addr": sNode,
			"WeightType": WeightType
		}
		let data = this.NBCreateJSON({
			"MethodNum": 912,
			"MethodName": "SetReadyCalibration",
			"Target": [target]
		})
		this.post(data);
	},
	NBCalibrationDone({
		sZDID,
		sNode,
		iCount
	}) {
		//结束校准  sNode-节点值  iCount-数量
		let target = {
			"DevNum": sZDID,
			"Addr": sNode,
			"Count": iCount
		}
		let data = this.NBCreateJSON({
			"MethodNum": 914,
			"MethodName": "SetDoneCalibration",
			"Target": [target]
		})
		this.post(data);
	},
	NBsetLockTime({
		sZDID,
		sNode,
		Overtime = "30",
		Gaptime = "30",
		sOverGroup
	}) {
		//设置底层上报锁状态的时间间隔(锁未关闭时)
		if (MyStorage.getItem('CS').isLockTimeout === '0') Gaptime = '0';
		//console.log(sOverGroup)
		let target;
		if (Array.isArray(sOverGroup)) {
			target = sOverGroup.map((value) => {
				return {
					"DevNum": value.sZDID,
					"Addr": value.sCZBM,
					"OverTime": Overtime,
					"GapTime": Overtime
				};
			})
		} else {
			target = [{
				"DevNum": sZDID,
				"Addr": sNode,
				"OverTime": Overtime,
				"GapTime": Overtime
			}];
		}

		let data = this.NBCreateJSON({
			"MethodNum": 1234,
			"MethodName": "SetUnlockOverTime",
			"Target": target
		})
		this.post(data);
	},
	NBInventory(iSwitch, sNode) {
		//高值耗材柜专用  控制盘点开始或结局  iSwitch - 1-开始  0-结束    sNode-节点值
		iSwitch
			?
			this.post('Write=' + this.uid() + ',Node=' + sNode + ',Inventory=On') :
			this.post('Write=' + this.uid() + ',Node=' + sNode + ',Inventory=Off');
	},
	NBSelectPic(sYPLX, type) {
		//蓝色值为3，白色为15
		//外43 麻57 精神44 
		//图片  白底   看似19   听似20   多规21    毒47 高危46 logo76   向左12  向右13 外用67  麻醉45 精神44
		//     蓝底   看似7     听似8     多规9     毒35 高危34 logo74   向左 20 向右21  外用31 麻醉33 精神56
		let str = '';

		let x5 = 20;
		let x6 = 290;
		let x7 = 100;
		let x8 = 140;
		let x9 = 220;
		let x10 = 300;

		let y6 = 270;
		let y7 = 90;

		//毒性
		if (this.NBGetJSBZ_KZYS(0, sYPLX)) type === 3 ? str += 'PIC(' + x6 + ',' + y7 + ',35);' : str += 'PIC(' + x6 + ',' +
			y7 + ',47);';
		//麻醉
		if (this.NBGetJSBZ_KZYS(1, sYPLX)) type === 3 ? str += 'PIC(' + x6 + ',' + y7 + ',33);' : str += 'PIC(' + x6 + ',' +
			y7 + ',45);';
		//高危
		if (this.NBGetJSBZ_KZYS(2, sYPLX)) type === 3 ? str += 'PIC(' + x6 + ',' + y7 + ',34);' : str += 'PIC(' + x6 + ',' +
			y7 + ',46);';
		//精神
		if (this.NBGetJSBZ_KZYS(3, sYPLX)) type === 3 ? str += 'PIC(' + x6 + ',' + y7 + ',56);' : str += 'PIC(' + x6 + ',' +
			y7 + ',44);';
		//二类精神
		if (this.NBGetJSBZ_KZYS(9, sYPLX)) type === 3 ? str += 'PIC(' + x6 + ',' + y7 + ',56);' : str += 'PIC(' + x6 + ',' +
			y7 + ',44);';

		//外用
		if (this.NBGetJSBZ_KZYS(4, sYPLX)) type === 3 ? str += 'PIC(' + x7 + ',' + y6 + ',31);' : str += 'PIC(' + x7 + ',' +
			y6 + ',67);';
		//看似
		if (this.NBGetJSBZ_KZYS(5, sYPLX)) type === 3 ? str += 'PIC(' + x8 + ',' + y6 + ',7);' : str += 'PIC(' + x8 + ',' +
			y6 + ',19);';
		//听似
		if (this.NBGetJSBZ_KZYS(6, sYPLX)) type === 3 ? str += 'PIC(' + x9 + ',' + y6 + ',8);' : str += 'PIC(' + x9 + ',' +
			y6 + ',20);';
		//多规
		if (this.NBGetJSBZ_KZYS(7, sYPLX)) type === 3 ? str += 'PIC(' + x10 + ',' + y6 + ',9);' : str += 'PIC(' + x10 + ',' +
			y6 + ',21);';

		return str;
	},
	drugInfo({
		sZDID,
		sYGBM,
		name
	}) {
		let DRUG = MyStorage.getItem('DRUG');
		let data = DRUG.filter((_v) => {
			return _v.sZDID === sZDID && _v.sYGBM === sYGBM
		})

		if (data.length > 0) {
			let sData = data[0];

			//console.error(sData, name, sData.hasOwnProperty(name))
			if (sData.hasOwnProperty(name)) {
				//console.error(sData[name])
				return sData[name]
			} else {
				return '';
			}
		} else {
			return '';
		}
	},
	sTypeInfo({
		sZDID,
		sCZBM,
		name
	}) {
		let LAYER = MyStorage.getItem('LAYER');
		let data = LAYER.filter((_v) => {
			return _v.sZDID === sZDID && _v.sCZBM === sCZBM
		})

		if (data.length > 0) {
			let sData = data[0];

			//console.error('获取终端类型编码', sData, name, sData.hasOwnProperty(name))
			if (sData.hasOwnProperty(name)) {
				//console.error(sData[name])
				return sData[name]
			} else {
				return '';
			}
		} else {
			return '';
		}
	},
	returnEquipType({
		sZDID,
		sCZBM
	}) {
		//返回设备的型号
		let sZDLXBM = this.sTypeInfo({
			sZDID: sZDID,
			sCZBM: sCZBM,
			name: 'sZDLXBM'
		});
		//let iKZYS = this.sTypeInfo({sZDID: sZDID, sCZBM: sCZBM, name: 'iKZYS'});

		//高值 低值柜高值锁(执行低值的事件) 低值锁
		return typeH.includes(sZDLXBM) ? 'H' : 'A';
	},
	NBLCDsetJSON({
		type,
		data,
		Save = "0",
		isUseAllData = true
	}) {
		/* 药架以及低值耗材柜专用   屏幕内容显示控制(480*320 升级版 可显示图片icons)
		 * iType  0-库存状态   1-补药状态   2-取药状态  3-盘点状态  4-校准  5-清除指令 6-退药状态
		 * sPM-品名  sPH-批号  sGG-规格  sKC-库存  sDW-单位 iNum-待取/待退数量
		 * NBHsptlName-从页面给Nuobo.NBHsptlName赋值
		 * {type, sNode, sPM, sPH, sGG, sKC, sDW, iNum, sYPLX, iCKZYS, iKZYS, iKCSX="", sXBZDW="", sZDID, Save="0"}
		 */

		let c, c1;
		//console.error(data)
		//let beginLocation = 300;
		let lenL = Math.floor(180 / 7); //小屏幕宽度480 原始300 7个字符可以显示完全
		//let sLen;
		let NBHsptlName = this.NBHsptlName() + ' | 诺博医疗';

		//NBHsptlName.length > 0 ? sLen = NBHsptlName.length - 7 : sLen = 0;
		//beginLocation = beginLocation - lenL * sLen;

		let target = data.map((value) => {
			let sText = '';
			let sPM = '';
			let sGG = '';
			let sKC = '';
			let iCKZYS = '';
			let sDW = '';
			let iKCSX = '';
			let iKZYS = '';
			let sYPLX = '';

			if (isUseAllData) {
				//默认使用这个全部数据
				sPM = MyStorage.getItem('CS').isShowShortName == "是" ? this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'sYWJC'
				}) : this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'sPM'
				});
				sGG = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'sGG'
				});
				sKC = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'iCFSL'
				});
				iCKZYS = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'iCKZYS'
				});
				sDW = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'sDW'
				});
				if (!sDW) sDW = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'sCFDW'
				})
				iKCSX = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'iKCSX'
				});
				iKZYS = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'iKZYS'
				});
				sYPLX = this.drugInfo({
					sZDID: value.sZDID,
					sYGBM: value.sYGBM,
					name: 'iYPLX'
				});
			} else {
				sPM = value.sPM || '';
				sGG = value.sGG || '';
				sKC = value.sKC || 0;
				iCKZYS = value.iCKZYS || 0;
				sDW = value.sDW || value.sCFDW || '';
				iKCSX = value.iKCSX || 0;
				iKZYS = value.iKZYS || 0;
				sYPLX = value.iYPLX || value.sYPLX || 0;
			}

			let SL = value.SL || 0;
			let iSL = value.iSL || 0;
			let sPH = value.sPH || [];

			//品名 规格 x轴显示位置
			let x1 = 20;
			let x2 = 20;

			let x3 = 110;
			let x4 = 200;

			//品名y轴显示位置
			let y1 = 50;
			let y2 = 100;
			let y3 = 140;
			let y4 = 180;
			let y5 = 220;

			//库存处理
			sKC = this.padStart(String(+sKC), 3);
			iKCSX = this.padStart(String(+iKCSX), 3);

			//数字
			if (iSL) {
				if (+iSL > 0) {
					iSL = this.padStart(String(+iSL), 3);
				} else {
					iSL = Math.abs(iSL);
					iSL = '-' + this.padStart(String(+iSL), 3);
				}
			} else {
				iSL = '';
			}

			let p1 = 400;
			let p2 = 10;

			//返回1(三个月到6个月) 2 （六个月以外的） -1(小于三个月) -9(参数不是数组或者筛选后没有批号的)
			let PH = this.converMS(sPH, 2);
			let sName = '效期'
			switch (parseInt(type)) {
				case 0:
					sText += "SEBL(80);CLS(15);SBC(15);DS16(10,10,'" + NBHsptlName + "',8);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 15);
					//黄色近效期4 红色近效期5 

					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',8);DS24(" + x2 + "," + y2 + ",'" + sGG + "',0);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',0);";
					sText += "DS24(" + x1 + "," + y4 + ",'库存',0);DS24(" + x3 + "," + y4 + ",'" + sKC + "',0);DS24(" + x4 + "," + y4 +
						",'" + sDW + "',0);";
					sText += "DS24(" + x1 + "," + y5 + ",'基数',0);DS24(" + x3 + "," + y5 + ",'" + iKCSX + "',0);DS24(" + x4 + "," +
						y5 + ",'" + sDW + "',0);";
					break;
				case 1:
					c1 = '待补充';
					c = '已补充';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',15);";
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c1 + "',15);DS24(" + x3 + "," + y4 + ",'" + SL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					sText += "DS24(" + x1 + "," + y5 + ",'" + c + "',15);DS24(" + x3 + "," + y5 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y5 + ",'" + sDW + "',15);";
					break;
				case 2:
					c1 = '待取出';
					c = '已取出';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',15);";
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c1 + "',15);DS24(" + x3 + "," + y4 + ",'" + SL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					sText += "DS24(" + x1 + "," + y5 + ",'" + c + "',15);DS24(" + x3 + "," + y5 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y5 + ",'" + sDW + "',15);";
					break;
				case 3:
					c = '请盘点';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',15);";
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c + "',15);DS24(" + x3 + "," + y4 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					break;
				case 4:
					//校准
					c = '请校准';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c + "',15);DS24(" + x3 + "," + y4 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					break;
				case 5:
					//清屏指令
					sText += 'CLS(15);';
					break;
				case 6:
					c1 = '待退回';
					c = '已退回';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',15);";
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c1 + "',15);DS24(" + x3 + "," + y4 + ",'" + SL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					sText += "DS24(" + x1 + "," + y5 + ",'" + c + "',15);DS24(" + x3 + "," + y5 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y5 + ",'" + sDW + "',15);";
					break;
				case 7:
					c = '已取出';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',15);"
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c + "',15);DS24(" + x3 + "," + y4 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					break;
				case 8:
					c1 = '待入库';
					c = '已入库';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ":" + PH.sPH + "',15);";
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c1 + "',15);DS24(" + x3 + "," + y4 + ",'" + SL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					sText += "DS24(" + x1 + "," + y5 + ",'" + c + "',15);DS24(" + x3 + "," + y5 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y5 + ",'" + sDW + "',15);";
					break;
				case 9:
					c = '已退回';
					sText += "SEBL(80);CLS(52);SBC(52);DS16(10,10,'" + NBHsptlName + "',15);";
					//15表示用白底图片 3表示使用蓝底
					sText += this.NBSelectPic(sYPLX, 3);
					sText += "DS32(" + x1 + "," + y1 + ",'" + sPM + "',15);DS24(" + x1 + "," + y2 + ",'" + sGG + "',15);DS16(" + x1 +
						"," + y3 + ",'" + sName + ": " + PH.sPH + "',0);";
					//黄色近效期4 红色近效期5 
					if (PH.sBSM === 1) sText += "PIC(" + p1 + "," + p2 + ",4);";
					if (PH.sBSM === -1) sText += "PIC(" + p1 + "," + p2 + ",5);";
					sText += "DS24(" + x1 + "," + y4 + ",'" + c + "',15);DS24(" + x3 + "," + y4 + ",'" + iSL + "',15);DS24(" + x4 +
						"," + y4 + ",'" + sDW + "',15);";
					break;
			}

			return {
				"DevNum": value.sZDID,
				"Addr": value.sYGBM,
				"Save": Save,
				"Lcd": encodeURI(sText)
			};
			//return {"DevNum": value.sZDID, "Addr": value.sYGBM, "Save": Save, "Lcd": sText};
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 918,
			"MethodName": "SetScreenString",
			"Target": target
		});
		this.post(sendData);
	},
	NBLCDsetCountJSON({
		data,
		Save = '0'
	}) {
		//药架以及低值耗材柜   屏幕内容中 数量变化 显示控制(只改变数量)(480*320 升级版 可显示图片icons)

		let x3 = 110;
		let y4 = 220;
		let target = data.map((value) => {
			let sl = value.iSL;
			if (sl == "FF") sl = 0; +
			sl < 0 ? sl = '-' + this.padStart(String(+sl), 2) : sl = this.padStart(String(+sl), 3);
			let sText = "DS24(" + x3 + "," + y4 + ",'   ',15);DS24(" + x3 + "," + y4 + ",'" + sl + "',15);"

			return {
				"DevNum": value.sZDID,
				"Addr": value.sYGBM,
				"Save": Save,
				"Lcd": encodeURI(sText)
			};
			//return {"DevNum": value.sZDID, "Addr": value.sYGBM, "Lcd": sText};
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 918,
			"MethodName": "SetScreenString",
			"Target": target
		});
		this.post(sendData);
	},
	NBReadCount({
		sZDID,
		sNode,
		WeightType = "1"
	}) {
		//药架以及低值耗材柜   从底层称重模块读取数量  sNode-节点值 
		let target = {
			"DevNum": sZDID,
			"Addr": sNode
		}
		let data = this.NBCreateJSON({
			"MethodNum": 931,
			"MethodName": "GetBoxAmount",
			"Target": [target]
		})
		this.post(data, true);
	},
	NBSetCountJSON({
		data,
		WeightType = "1"
	}) {
		//药架以及低值耗材柜   设置数量(改底层芯片中数量)  sNode-节点值  iNum-数量
		let target = data.map((value) => {
			return {
				"DevNum": value.sZDID,
				"Addr": value.sYGBM,
				"Amount": value.iCFSL,
				"WeightType": WeightType
			}
		})

		let sendData = this.NBCreateJSON({
			"MethodNum": 930,
			"MethodName": "SetBoxAmount",
			"Target": target
		})
		this.post(sendData, true);
	},

	NBGetPurpleLog(startTime, endTime) {
		//获取紫外线灯启停日志
		let target = {
			"start_date": startTime,
			"end_date": endTime,
		}
		let sendData = this.NBCreateJSON({
			"MethodNum": 1258,
			"MethodName": "GetPurpleLog",
			"Target": [target]
		});
		this.post(sendData, true);
	},
	GetPurpleTime(ZDID) {
		//获取紫外线消毒时间
		let target = {
			"DevNum": ZDID,
			"Addr": "0000"
		}
		let sendData = this.NBCreateJSON({
			"MethodNum": 1255,
			"MethodName": "GetPurpleTime",
			"Target": [target]
		});
		this.post(sendData, true);
	},
	ClearPurpleTime(ZDID) {
		//清空紫外线消毒时间
		let target = {
			"DevNum": ZDID,
			"Addr": "0000"
		}
		let sendData = this.NBCreateJSON({
			"MethodNum": 1256,
			"MethodName": "ClearPurpleTime",
			"Target": [target]
		});
		this.post(sendData, true);
	},
	SetPurpleTime(ZDID, startTime, endTime) {
		//设置紫外线消毒时间
		let target = {
			"DevNum": ZDID,
			"Addr": "0000",
			"StartTime": startTime,
			"StopTime": endTime
		}
		let sendData = this.NBCreateJSON({
			"MethodNum": 1254,
			"MethodName": "SetPurpleTime",
			"Target": [target]
		});
		this.post(sendData, true);
	},
	// NBSetCountJSON({ data, WeightType = "1" }) {
	// 	//药架以及低值耗材柜   设置数量(改底层芯片中数量)  sNode-节点值  iNum-数量
	// 	let target = data.map((value) => {
	// 		return { "DevNum": value.sZDID, "Addr": value.sYGBM, "Amount": value.iCFSL, "WeightType": WeightType }
	// 	})

	// 	let sendData = this.NBCreateJSON({ "MethodNum": 1258, "MethodName": "SetBoxAmount", "Target": target })
	// 	this.post(sendData, true);
	// },
	NBAnalysis: function(cmd, name) {
		//解析底层返回的数据(字符串)，处理成JSON

		let s = cmd.split(',');
		let len = s.length;
		let res = {};

		for (let i = 0; i < len; i++) {
			let splits = s[i].split('=');
			let prefix = splits[0];
			let suffix = splits[1];

			res[prefix] = suffix;
		}

		return name ? res[name] : res;
	},
	padStart(str, n = 3) {
		if (typeof String.prototype.padStart !== 'function') {
			str = String(Math.abs(+str));
			if (str.length >= n) return str;

			let fillString = '0';

			let fillLen = n - str.length;
			let timesToRepeat = Math.ceil(fillLen / fillString.length);
			let truncatedStringFiller = fillString.repeat(timesToRepeat).slice(0, fillLen);

			return truncatedStringFiller + str;
		} else {
			//前补零
			return str.padStart(n, 0)
		}
	},
	converMS(sPH, type = 1) {
		//不是数组  或者筛选后没有批号的 也认为没有 同意返回-9
		//type 不存在显示全部 1 显示批号 2 显示效期
		if (!Array.isArray(sPH) || sPH.length === 0) return {
			'sBSM': -9,
			'sPH': ''
		};;

		//GetYG_Out脚本里面数量为iSL 筛选出数量大于0的数据
		const sPHArr = sPH.filter((value) => {
			return value.iMXSL > 0 || value.iSL > 0;
		});

		//输入时间 三个月内包括过期返回-1 3-6返回1  不合法内容返回0
		let THREETIME = 3 * 30 * 24 * 60 * 60 * 1000;
		let SIXTIME = 6 * 30 * 24 * 60 * 60 * 1000;

		//当前时间
		let curTime = +new Date();

		//效期对应的毫秒数
		let ms;

		//筛选后的长度不存在 或者格式不正确
		sPHArr.length === 0 ? ms = NaN : ms = '';

		//只要存在任意一个过期的 显示出来
		let str = '',
			three, six, more;
		sPHArr.forEach((_v) => {
			type === 1 ? str += _v.sPH + '/' : str += _v.dXQ + '/'

			//一旦存在则为true
			let ms = +new Date(_v.dXQ);
			ms - curTime < THREETIME ? three = true : '';
			ms - curTime >= THREETIME && ms - curTime < SIXTIME ? six = true : '';
		})

		str = str.substring(0, str.length - 1);

		return !isNaN(ms) ? three ? {
				'sBSM': -1,
				'sPH': str
			} :
			six ? {
				'sBSM': 1,
				'sPH': str
			} : {
				'sBSM': 2,
				'sPH': str
			} :
			{
				'sBSM': -9,
				'sPH': ''
			};
	},
	now: +new Date(), //时间
	time: 1, //次数
	timeInterval: 0, //时间间隔
	post(cmd, s) {
		//cmd.includes('SerialNum')
		if (s) {
			if (+new Date() - this.now > 5000) {
				this.time = 1;
				this.now = +new Date();

				this.timeInterval = 0;
			} else {
				this.time++;
				this.timeInterval = 111 * this.time;
			}
		} else {
			this.timeInterval = 4;
		}

		//console.error(this.timeInterval + 'ms后下发' + cmd.substring(0, 500))
		setTimeout(() => {
			DELPHI_JS.CallDll(this.dll, cmd);

			try {
				console.log('[Nuobo.post]', decodeURI(cmd.substring(0, 500)));
			} catch (e) {
				console.log('[Nuobo.post]', cmd.substring(0, 500));
			}
		}, this.timeInterval)
	},
	//	post(cmd) {
	//		this.TCPMode === '2' ? Main.ws.send(cmd) : DELPHI_JS.CallDll(this.dll, cmd);
	//		
	//		(cmd.length < 500 || this.TCPMode !== '0') 
	//		? console.log('[Nuobo.post]', decodeURI(cmd)) 
	//		: console.log('[Nuobo.post]', decodeURI(cmd.substring(0, 500)));
	//	}
}

Object.seal(Nuobo);

export default Nuobo;
