/**
 * 本js为Vue自定义指令
 * @Author Wu
 * @Date 2018/11/11 13:50:00
 * @Ver v1.0.1
 */

// import addListener from '@cm/config/plugins/directive/lazyLoad/load.js'

const Direction = function(Vue, options) {
	//注册全局指令 
	Vue.directive('focus', {
		// 当被绑定的元素插入到 DOM 中时……
		//当绑定元素插入到 DOM 中。
		inserted: function(el, {
			value
		}) {
			// 聚焦元素
			if (value) {
				el.focus();
			}
		},
		update: function(el, {
			value
		}) {
			if (value) {
				el.focus();
			}
		}
	})

	//懒加载
	// Vue.directive('lazyload', {
	// 	inserted: function (el, { value }) {
	// 		addListener(el, value)
	// 	},
	// 	update: function (el, { value }) {
	// 		addListener(el, value)
	// 	},
	// })
}

export default Direction
