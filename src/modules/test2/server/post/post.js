// get.js 获取接口数据
import fetch from '@cm/config/fetch/fetch'
import baseUrl from '@cm/config/env/env'
let type = 'POST';

export const updateUidLocation = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/入出库/YWGL_HC_ZDGK.php',
	params: data,
	type: type
}) //出入库后更新高值数据

//登录
export const LoginIn = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/Comm/Login_M.php',
	params: data,
	type: type
}) //登陆

//主页面
export const loadingParam = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/Comm/Comm_Param_Init.php',
	params: data,
	type: type
}) //加载参数

//出入库界面脚本
export const gainLocationInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_GetYG_In.php',
	params: data,
	type: type
}) //请按单入库
export const updateStockByDoc = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/入出库/YWGL_RCK_ADRK.php',
	params: data,
	type: type
}) //终端按单据执行入库动作
export const updateStock = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/入出库/YWGL_RCK_UpdKC.php',
	params: data,
	type: type
}) //出入库数据更新

//设置界面脚本
export const updateRFID = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_Set_TYJB.php',
	params: data,
	type: type
}) //RFID工卡绑定与解除
export const AddNewDrug = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/设置/YWGL_YGYWWH.php',
	params: data,
	type: type
}) //画药格
export const GetDrugInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_YWXX_Get.php',
	params: data,
	type: type
}) //药物信息
export const setFingerPrint = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/设置/YWGL_ZWWH.php',
	params: data,
	type: type
}) //指纹设置
export const updatePassword = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/Comm/Comm_YHB_SetPWD.php',
	params: data,
	type: type
}) //密码设置
// export const updateStock = (data) => fetch({url: baseUrl + 'BS/IDMS/modules/CIMS/server/设置/YWGL_YGJZ.php', params: data, type: type}) //

//盘点界面脚本
export const deleteInvenInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPC_ZTGB.php',
	params: data,
	type: type
}) //删除上次生成的盘点记录
export const updateInvenInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPC_ZTGB.php',
	params: data,
	type: type
}) //提交盘点记录
export const updateInvenData = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPC_SP.php',
	params: data,
	type: type
}) //调用实盘脚本
export const updateInvenState = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPCSH.php',
	params: data,
	type: type
}) //盘存标志改变成功  提交审核数据
export const checkInevnState = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPC_JC.php',
	params: data,
	type: type
}) //药物盘存-检测

//消毒记录
// export const recordDisinfectionMsg = (data) => fetch({url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_XDDJ_DGXD.php', params: data, type: type}) //记录底层上报的消毒日志
