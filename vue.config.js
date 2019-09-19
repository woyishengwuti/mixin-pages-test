/**
 * vue-cli3配置文件
 *
 */

const glob = require("glob");
const path = require("path");
const webpack = require("webpack");

let argv = process.argv.splice(2).splice(3);
let VUE_APP_SYS = process.env.VUE_APP_SYS;

// console.log("process.argv", process.argv, 'argv', argv);
console.log('process.env is', process.env.NODE_ENV, process.env.VUE_APP_SYS);

function resolve(dir) {
  return path.join(__dirname, dir);
}

let static =
  process.env.NODE_ENV === "production"
    ? {
        css: ["./plugins/elementUI/elementUI.css"],
        js: [
          "./plugins/monitor/monitor.js",
          "./plugins/vue/vue.js",
          "./plugins/vue/vuex.js",
          "./plugins/axios/axios.js",
          "./plugins/elementUI/elementUI.js",
          "./plugins/vue/vue-router.js"
        ]
      }
    : {
        js: [],
        css: []
      };

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  outputDir: `${VUE_APP_SYS}`,
  // lintOnSave: true,
  pages: {
    index: {
      entry: `src/main.js`,
      // 模板来源
      template: `src/modules/template/index.html`,
      // 在 dist/index.html 的输出
      filename: `index.html`,
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ["chunk-vendors", "chunk-common", "index"],
      static: static
    }
  },
  configureWebpack: {
    plugins: []
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      var externals = {
        vue: "Vue",
        axios: "axios",
        "element-ui": "ELEMENT",
        "vue-router": "VueRouter",
        vuex: "Vuex"
      };
      config.externals(externals);
    }

    config.resolve.alias
      .set("@", resolve("src"))
      .set("@cm", resolve("src/modules/com"))
      .set("@test1", resolve("src/modules/test1"))
      .set("@test2", resolve("src/modules/test2"));
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8080/",
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/"
        }
      }
    }
  }
};
