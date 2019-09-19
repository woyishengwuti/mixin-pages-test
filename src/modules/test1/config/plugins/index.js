import tools from './tools/tools'; //方法
import MyStorage from './localStorage/localStorage.js' // 缓存
import baseUrl from '@cm/config/env/env';
import Nuobo from './nuobo/Nuobo'; //方法
import Screen from './nuobo/Screen'; //方法

const MyPlugin = {};
MyPlugin.install = function(Vue, options) {
	// 3. 注入组件
	Vue.mixin({
		created: function() {
			// 逻辑...
		}
	})

	// 4. 添加实例方法
	Vue.prototype.$Utils = tools;
	Vue.prototype.$MyStorage = MyStorage;
	Vue.prototype.$BaseUrl = baseUrl;
	Vue.prototype.$nuobo = Nuobo;
	Vue.prototype.$screen = Screen;
}

export default MyPlugin;
