import { createRouter, createWebHistory } from "vue-router";
const Index = () => import("../view/Index.vue");
const DataFlow = () => import("../view/DataFlow.vue");
const Building = () => import("../view/Building.vue");
const Readme = () => import("../view/Readme.vue");

const routes = [
  {
    path: "/",
    name: "index",
    component: Index,
    meta: {
      title: "首页",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "house"],
    },
    menuProps: {},
  },
  {
    path: "/readme",
    name: "readme",
    component: Readme,
    meta: {
      title: "readme",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "scroll"],
    },
    menuProps: {},
  },
  {
    path: "/dataFlow",
    name: "dataFlow",
    component: Building,
    meta: {
      title: "数据流转",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "shuffle"],
    },
    menuProps: {},
  },
  {
    path: "/building",
    name: "building",
    component: DataFlow,
    meta: {
      title: "智慧楼宇",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "building"],
    },
    menuProps: {},
  },
];

export default createRouter({
  history: createWebHistory("/three-demo-site/"),
  routes,
});
export { routes };
