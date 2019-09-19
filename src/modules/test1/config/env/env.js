/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 *
 */
let baseUrl = '';
const url1 = '/api/';
const url2 = 'http://' + DELPHI_JS.ReadIniValue('YGSZ', 'PORT', 'localhost:8080');
if (process.env.NODE_ENV == 'development') {
	baseUrl = url1;
} else if (process.env.NODE_ENV == 'production') {
	baseUrl = url2;
}

export default baseUrl
