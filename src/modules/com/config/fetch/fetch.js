'use strict'

import axios from 'axios';
import MyStorage from '@cm/config/plugins/localStorage/localStorage.js';
import {
	Message,
	Loading
} from 'element-ui'
import {
	RecordErrorInfo
} from '@cm/server/get/get'
// import store from '../../store/store'

let loading;

function startLoading() {
	loading = Loading.service({
		lock: true,
		text: '加载中……',
		background: 'rgba(0, 0, 0, 0.3)'
	})
}

const fetch = function({
	url,
	params,
	type = "GET",
	jsonType = "json",
	isStartLoad = "true"
}) {
	const instance = axios.create({
		// `url` 是用于请求的服务器 URL
		url: url,
		// `method` 是创建请求时使用的方法 // 默认是 get
		method: type,
		//所有的请求都会带上这些配置，比如全局都要用的身份信息等。application/json
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		timeout: 20 * 1000, // 20秒超时
		//cancelToken: new CancelToken(function (cancel) {
		//console.error(cancel)
		//}),
		transformRequest: [function(data) {
			//`transformRequest` 允许在向服务器发送前，修改请求数据 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法生效
			//后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
			let newData = ''
			for (let k in data) {
				newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&'
			}

			return newData
		}],
		transformResponse: [function(data) {
			// `transformResponse` 在传递给 then/catch 前，允许修改响应数据(记录错误的脚本 如果发生错误 不记录 直接跳过)
			if (url.includes('YWGL_JBBCJL')) return data;

			let wLoginData = MyStorage.getItem('wLoginData');
			let sZDID = MyStorage.getItem('wZDID');
			let sYHID = wLoginData ? wLoginData.sYHID : '';
			let sYHXM = wLoginData ? wLoginData.sXM : '';

			if (typeof data === 'object') {
				//console.error(data, JSON.stringify(params))
				if (data === null || (data.iRet && data.iRet === -1)) {
					RecordErrorInfo({
						'YHID': sYHID,
						'YHXM': sYHXM,
						'ZDID': sZDID,
						'JBMC': url,
						'FHZ': data,
						'URL': window.location.href,
						'CS': JSON.stringify(params),
						'SZYM': ''
					});
				}
			}

			return data;
		}],
		// `responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
		responseType: jsonType, // 默认的
	});

	if (type.toUpperCase() === 'GET' || type.toUpperCase() === 'DELETE') {
		//`params` 是即将与请求一起发送的 URL 参数  必须是一个无格式对象(plain object)或 URLSearchParams 对象
		instance.defaults.params = params;
	} else if (type.toUpperCase() === 'POST' || type.toUpperCase() === 'PUT') {
		// `data` 是作为请求主体被发送的数据
		// 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH' 在没有设置 `transformRequest` 时，必须是以下类型之一：
		// - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams (浏览器专属：FormData, File, Blob,Node 专属： Stream)
		instance.defaults.data = params;
	}

	return new Promise((resolve, reject) => {
		if (isStartLoad) startLoading();
		instance(url, params, type, jsonType).then(response => {
			//把请求到的数据发到引用请求的地方
			// console.error(response)
			resolve(response.data);
			if (loading) loading.close()
		}).catch(error => {
			console.error('请求异常信息：' + error, error.response);
			reject(error);
			if (loading) loading.close()

			// if (error.response) {
			// 	if (error.response.status === 401) {
			// 		router.replace({
			// 			path: '/login' // 到登录页重新获取token
			// 		});
			// 		Message.error('登录凭证已过期，请重新登录');
			// 	}
			// }
		});
	});
}

export default fetch;
