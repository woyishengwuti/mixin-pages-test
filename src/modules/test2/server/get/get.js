// get.js 获取接口数据
import fetch from '@cm/config/fetch/fetch'
import baseUrl from '@cm/config/env/env'

//通用脚本
export const GetCommData = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/Comm/Comm_GetData.php',
	params: data
}) //获取通用数据
export const GetZDGroup = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_ZDGroup_Get.php',
	params: data
}) //获取所有终端
export const GetZDSX = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_ZDSX_Get.php',
	params: data
}) //根据终端id获取终端属性
export const GetZDYW = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_ZDYW_Get.php',
	params: data
}) //终端药物
export const RecordExceptionInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_YCCZJL.php',
	params: data
}) //异常操作记录
export const RecordErrorInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_JBBCJL.php',
	params: data,
	isStartLoad: false
}) //异常操作记录
export const GetTermData = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/DLCX_TY.php',
	params: data
}) //获取指纹特征码
export const recordPostData = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YW_SBSBJL_Import.php',
	params: data,
	isStartLoad: false
}) //记录上报数据

//登录界面脚本
export const GetUserFingerPrint = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/Comm/Comm_lead_Login.php',
	params: data
}) //登录：获取本地指纹

//主界面脚本
export const GetMeunInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/主界面/GET_ZDCD.php',
	params: data
}) //终端主界面功能块布局
export const GetStockInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/耗材信息查询/HCGL_KCXX.php',
	params: data
}) //库存信息查询
export const GetDrugInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_ZDGL_TYJB.php',
	params: data
}) //获取所有药品信息

//查询界面脚本
export const GetInvenInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/耗材信息查询/HCGL_PCXX.php',
	params: data
}) //查询盘点详情信息
export const GetInInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/耗材信息查询/HCGL_RKXX.php',
	params: data
}) //查询按单入库信息
export const GetOutInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/耗材信息查询/HCGL_CKXX.php',
	params: data
}) //出库信息查询
export const GetStoreInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/耗材信息查询/HCGL_KCXX.php',
	params: data
}) //查询耗材库存明细
export const GetOperaInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/查询/YWGL_YGXX_SSQYCX.php',
	params: data
}) //查询手术取用记录
export const GetTermInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/耗材信息查询/HCGL_PCXX.php',
	params: data
}) //查询当前科室下的所有终端

//消毒操作界面脚本
export const GetDisinfectionInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_ZDCX_TYJB.php',
	params: data
}) //查询消毒操作记录
export const GetAllZDID = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_ZDCX_TYJB.php',
	params: data
}) //查询当前主柜下的所有副柜ID
export const AddDisinfectionInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_XDDJ.php',
	params: data
}) //添加消毒记录
export const AddDisinfectionRecord = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_XDDJ_DGXD.php',
	params: data
}) //添加消毒记录

//消息界面脚本
export const GetWarningInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_XQKCYJ.php',
	params: data
}) //效期库存预警

//出入库界面脚本
export const GetStockList = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/入出库/YWGL_RCK_Get.php',
	params: data
}) //获取待入库单列表
export const GetStockListInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/入出库/YWGL_RCKMX_Get.php',
	params: data
}) //待入库单点击获取明细
export const GetInfoByBarcode = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/查询/YWGL_YWCX_TMXX.php',
	params: data
}) //根据条码查找相关信息

//盘点界面脚本
export const JudgeInven = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_PC_TYJB.php',
	params: data
}) //判断是否生成盘点数据
export const GetInvenData = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPC.php',
	params: data
}) //生成盘点
export const GetInvenDetail = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/盘存/YWGL_YWPCMX_Get.php',
	params: data
}) //药物盘存明细

//手术消耗页面
export const GetPatientInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/手术用/YWGL_SSBRXX_Get.php',
	params: data
}) //病人数据
export const GetLSH = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_SSQY_TYJB.php',
	params: data
}) //获取流水号
export const GetUsedItemsInfo = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/通用/YWGL_SSQY_TYJB.php',
	params: data
}) //已取耗材
export const FinishTheSur = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/手术用/YWGL_SSQY_HDBZGB.php',
	params: data
}) //完成手术
export const UndoTheSur = (data) => fetch({
	url: baseUrl + '/BS/IDMS/modules/CIMS/server/手术用/WIT_MATERIALS_cancle.php',
	params: data
}) //撤销完成手术
