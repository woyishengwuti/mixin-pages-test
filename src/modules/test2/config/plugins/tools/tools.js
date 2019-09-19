//公共函数类

import {
	recordPostData
} from '../../../server/get/get'

const tools = {
	numReg: /^(\+)?\d+$/, //整数
	plusReg: /^\d+(\.\d{0,2})?$/, //校验数据是否是一个正确的数字 支持小数 点后两位
	minusReg: /^(-?\d+)(\.\d{0,2})?$/, //校验数据是否是一个正确的数字 支持小数 点后两位 包括负数
	dotReg: /\./g,
	PrescriptReg: /^R\d{8,}$/, //处方号正则
	dateReg: /^\d{4}\-|\.\d{2}\-|\.\d{2}$/, //日期正则
	telReg: /^1(3|4|5|7|8)\d{9}$/, //电话正则
	regImg: /\.(jpg|png|jpeg|gif)$/i, //图片正则
	regVideo: /\.(mp4|ogg|flv|avi|wmv|rmvb)$/i, //视频正则
	regSolution: /\.(pdf|ppt)$/i, //解决方案正则
	isPositiveInteger(num) {
		//判断是否是正整数 
		//返回true 表示都满足条件 false表示存在不满足条件的情况
		return Array.isArray(num) ? !num.some((_v) => {
			return this.numReg.test(+_v)
		}) : this.numReg.test(+num);
	},
	enVar: function() {
		// console.error(window.DELPHI_JS)
		if (!window.DELPHI_JS) {
			window.DELPHI_JS = {
				CallDll: function() {},
				ClassInfo: function() {},
				ClassName: function() {},
				ClassNameIs: function() {},
				ClassParent: function() {},
				ExitApp: function() {},
				FreeDll: function() {},
				GetInterfaceEntry: function() {},
				GetInterfaceTable: function() {},
				InheritsFrom: function() {},
				InitInstance: function() {},
				InstanceSize: function() {},
				LoadDll: function() {},
				LoadExe: function() {},
				MethodAddress: function() {},
				MethodName: function() {},
				NewInstance: function() {},
				QualifiedClassName: function() {},
				ReadBrowserVar: function() {},
				ReadIniValue: function(x, y, t) {
					return t;
				},
				ReadVariable: function() {
					return '666666';
				},
				SetBrowserVar: function() {},
				UnitName: function() {},
				UnitScope: function() {},
				WinExec: function() {},
				StopVideoCapture: function() {},
				WriteIniValue: function() {},
			};
		}
	}(),
	ArrayRemove: function() {
		//1 数组去重
		Array.prototype.remove = function() {
			let newArr = [];
			for (let i = 0; i < this.length; i++) {
				if (newArr.indexOf(this[i]) === -1) {
					newArr.push(this[i]);
				}
			}

			return newArr;
		}

		//3删除数组中莫一项
		Array.prototype.deleteItems = function(str) {
			var index = this.indexOf(str);
			if (index > -1) {
				this.splice(index, 1);
			}
			return this;
		}
	}(),
	operString: function() {
		//判断以什么字符结尾
		String.prototype.endsWidth = function(suff) {
			return this.indexOf(suff, this.length - suff.length) !== -1;
		};

		//判断以什么字符开始
		String.prototype.startsWidth = function(suff) {
			return this.indexOf(suff, 0) !== -1;
		};
	}(),
	createImg(params) {
		// console.log(params)
		let blob = new Blob(params);

		return URL.createObjectURL(blob);
	},
	remove: function(arr) {
		//11-1数组去重
		return [...new Set(arr)];
	},
	createTime: function({
		format = 'YYYY-MM-DD hh:ii:ss',
		now = new Date(),
		days = 0,
		direct = true
	}) {
		//时间函数  format格式  now当前时间  days向前向后几天默认为0  direct向前还是向后(默认true向后)
		let d = now;
		let MS = 24 * 60 * 60 * 1000;
		direct ? d = new Date(new Date(now).getTime() + MS * days) : d = new Date(new Date(now).getTime() - MS * days);

		let a = {
			"yyyy": d.getFullYear() + '',
			"yy": (d.getFullYear() + '').substring(2, 4),
			'm': (d.getMonth() + 1) + '',
			"mm": (d.getMonth() + 1) > 9 ? (d.getMonth() + 1) + '' : '0' + (d.getMonth() + 1),
			'd': d.getDate() + '',
			'dd': d.getDate() > 9 ? d.getDate() + '' : '0' + d.getDate(),
			'h': d.getHours() + '',
			'hh': d.getHours() > 9 ? d.getHours() + '' : '0' + d.getHours(),
			'i': d.getMinutes() + '',
			'ii': d.getMinutes() > 9 ? d.getMinutes() + '' : '0' + d.getMinutes(),
			's': d.getSeconds() + '',
			'ss': d.getSeconds() > 9 ? d.getSeconds() + '' : '0' + d.getSeconds(),
			'w': d.getDay()
		}

		function week(num) {
			switch (parseInt(num)) {
				case 0:
					return '星期日';
				case 1:
					return '星期一';
				case 2:
					return '星期二';
				case 3:
					return '星期三';
				case 4:
					return '星期四';
				case 5:
					return '星期五';
				case 6:
					return '星期六';
			}
		}

		format = format.replace(/YYYY/gi, a["yyyy"]);
		format = format.replace(/YY/gi, a["yy"]);

		format = format.replace(/MM/gi, a["mm"]);
		format = format.replace(/M/gi, a["m"]);

		format = format.replace(/DD/gi, a["dd"]);
		format = format.replace(/D/gi, a["d"]);

		format = format.replace(/HH/gi, a["hh"]);
		format = format.replace(/H/gi, a["h"]);

		format = format.replace(/II/gi, a["ii"]);
		format = format.replace(/I/gi, a["ii"]);

		format = format.replace(/SS/gi, a["ss"]);
		format = format.replace(/S/gi, a["ss"]);

		format = format.replace(/W/gi, week(a['w']));

		return format;
	},
	getTimeRangeMS: function(h, m, s) {
		//传入时间 如果格式不对则取当前时间
		(isNaN(h) || h > 24 || h < 0) ? h = new Date().getHours(): h = h;
		(isNaN(m) || m > 60 || h < 0) ? m = new Date().getMinutes(): m = m;
		(isNaN(s) || s > 60 || s < 0) ? s = new Date().getSeconds(): s = s;

		return h * 60 * 60 * 1000 + m * 60 * 1000 + s * 1000;
	},
	getObjectValues: function(obj) {
		//获取对象的值keys
		if (obj !== null && typeof obj === 'object') {
			let val = [],
				key;
			for (key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					val.push(obj[key]);
				}
			}

			return val;
		} else {
			throw new TypeError('getObjectValues called on a non-object');
		}
	},
	judgeNumZero: function(data, field) {
		//获取指定对象 指定字段的值 并去重返回
		if (data === null || typeof data !== 'object' || typeof field !== 'string') throw new TypeError(
			'data called on a non-object');

		let arr = data.map((value) => {
			return value.hasOwnProperty(field) && (typeof value[field] === 'boolean' ? value[field] : +value[field])
		}).remove()

		return arr
	},
	changeSpecifiedObj: function(arr, field, s = false) {
		//改变指定对象值值
		if (!Array.isArray(arr)) throw new TypeError('arr is not a proper array');

		arr.forEach((value) => {
			if (value.hasOwnProperty(field)) value[field] = s;
		})
	},
	sWapPlaces(arr, index) {
		if (!Array.isArray(arr)) throw new TypeError('arr is not a proper array');
		if (arr.length === 0) throw new TypeError('arr.length is zero');
		index = +index;
		if (isNaN(index)) return;

		if (index > 0) {
			//全部置空
			arr.forEach((value, i) => {
				value.ifirst = null;

				//准备挪走的数据是红色的就不动了
				index === i ?
					arr[index].iRed ?
					'' :
					value.iRed = null :
					value.iRed = null;
			})
		}

		//优先级iRed比iFirst高

		let data = arr.splice(index, 1);
		//置顶的改颜色
		data[0].ifirst = true;
		arr.unshift(...data);
	},
	ModifyDataFunc(arr, sHDRID = '') {
		//合并修改的数据[sIP, sYGBM, '', sYWID, sl, 0]
		if (!Array.isArray(arr)) throw new TypeError('arr is not a proper array');

		//根据本身数据生成新的数据
		for (let i = 0; i < arr.length; i++) {
			//建立在存在的前提条件下
			if (arr[i][0] && arr[i][1]) {
				arr[i][2] = sHDRID;
				for (let j = i + 1; j < arr.length; j++) {
					if (arr[i][0] === arr[j][0] && arr[i][1] === arr[j][1]) {
						//下一条数据是以上一条结尾的
						arr[i][5] = arr[j][5];
						arr.splice(j, 1);
						//每删除一个 整体数组长度减一 这是J需要自减一保证下次循环在正确的位置
						j--;
					}
				}
			}
		}

		let newArr = arr.filter((value, index) => {
			return value.length > 0;
		});

		newArr.unshift([]);
		return JSON.stringify(newArr);
	},
	recaordPostDatas({
		ZDID,
		YGBM,
		CZBDLX,
		ZLBDLX = "2",
		BDSL,
		SYSL,
		BDZL,
		SYZL
	}) {
		//记录上报数据
		recordPostData({
			'ZDID': ZDID,
			'YGBM': YGBM,
			'CZBDLX': CZBDLX,
			'ZLBDLX': 2,
			'BDSL': BDSL,
			'SYSL': SYSL,
			'BDZL': BDZL,
			'SYZL': SYZL
		})
	}
}

Object.freeze(tools)

export default tools;
