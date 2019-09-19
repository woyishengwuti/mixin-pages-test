/*!
 * mixin.js v0.0.1
 * (c) 通用函数数据等部分
 */

// import { getAllDrugDatas } from '@cm/server/get/get'
// import exportCsv from '@cm/config/download/excel/exportExcel.js'

export const mixinTable = {
	data() {
		return {
			currentPage: 1, //分页数据
			info: [], //显示的表格数据
			allInfo: [], //全部数据
			search: '', //搜索的输入框数据
			timeout: null, //搜索延时
			pageSize: 15, //每条显示数目
			total: 0, //总数目
			pageCount: 1, //分页数量
			multipleSelection: [], //选中的数据
		}
	},
	created() {
		//console.error('table')
	},
	methods: {
		handleSizeChange(val) {
			//console.log(`每页 ${val} 条`, this.currentPage);
			this.pageSize = val;
			this.info = this.allInfo.filter((_v, index) => {
				return index < this.currentPage * this.pageSize && index >= (this.currentPage - 1) * this.pageSize;
			})
		},
		handleCurrentChange(val) {
			//console.log(`当前页: ${val}`);
			this.currentPage = val;
			this.info = this.allInfo.filter((_v, index) => {
				return index < val * this.pageSize && index >= (val - 1) * this.pageSize;
			})
		},
		searchData(val) {
			//搜索表内数据
			this.info = this.allInfo.filter((value) => {
				for (let key in value) {
					if (value[key]) {
						//console.log(value[key].toString(), val.toUpperCase())
						if (
							value[key].toString().includes(val.toUpperCase()) ||
							value[key].toString().includes(val)
						) {
							return value;
						}
					}
				}
			})

			//console.log(this.info)

			this.total = this.info.length;
			this.pageCount = Math.ceil(this.info.length / this.pageSize);
		},
	},
	watch: {
		search(val, oldVal) {
			//console.log(val, oldVal)
			//筛选数据
			if (this.timeout) clearTimeout(this.timeout);

			this.timeout = setTimeout(() => {
				this.searchData(this.search)
			}, 300);
		}
	}
}
