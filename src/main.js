import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import "element-plus/dist/index.css";
import "./assets/common/css/index.css";

library.add(fas, far);

const app = createApp(App);
// 定义全局方法
app.config.globalProperties.$goPage = function (
  name = "404",
  params,
  query = {},
  flag = false
) {
  if (/^http*/.test(name)) {
    flag ? window.location.replace(name) : (window.location.href = name);
    return;
  }
  flag = flag ? "replace" : "push";
  this.$router[flag]({
    name: name,
    params,
    query,
  });
};
// 注册icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
/* add font awesome icon component */
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.use(ElementPlus);

app.mount("#app");
