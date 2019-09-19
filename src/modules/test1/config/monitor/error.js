const errorHandler = function(err, vm, info) {
	console.log('接受错误', err, vm, info)
	// handle error
	// `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
	// 只在 2.2.0+ 可用
}

export default errorHandler;
