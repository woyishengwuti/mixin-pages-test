// localstorage封装
let MyStorage = (function mystorage() {
	let ms = "mystorage";
	let storage = window.localStorage;

	let test = function() {
		return !window.localStorage ? false : true;
	}

	let setItem = function(key, value) {
		//存储
		let mydata = storage.getItem(ms);
		if (!mydata) {
			this.init();
			mydata = storage.getItem(ms);
		}

		mydata = JSON.parse(mydata);
		mydata.data[key] = value;
		storage.setItem(ms, JSON.stringify(mydata));
		return mydata.data;
	};

	let getItem = function(key) {
		//读取
		let mydata = storage.getItem(ms);
		if (!mydata) {
			return false;
		}

		mydata = JSON.parse(mydata);
		return mydata.data[key];
	};

	let removeItem = function(key) {
		//读取
		let mydata = storage.getItem(ms);
		if (!mydata) {
			return false;
		}

		mydata = JSON.parse(mydata);
		delete mydata.data[key];
		storage.setItem(ms, JSON.stringify(mydata));
		return mydata.data;
	};

	let clear = function() {
		//清除对象
		storage.removeItem(ms);
	};

	let init = function() {
		storage.setItem(ms, '{"data":{}}');
	};

	return {
		test: test,
		setItem: setItem,
		getItem: getItem,
		removeItem: removeItem,
		init: init,
		clear: clear
	};
})();

export default MyStorage;
