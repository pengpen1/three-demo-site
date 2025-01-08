import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
const Index = () => import("../view/Index.vue");
const Photo = () => import("../view/Photo.vue");
const DataFlow = () => import("../view/DataFlow.vue");
const DataFlow2 = () => import("../view/DataFlow2.vue");
const Building = () => import("../view/Building.vue");
const Readme = () => import("../view/Readme.vue");
const SuperMap = () => import("../view/SuperMap.vue");

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
    path: "/photo",
    name: "photo",
    component: Photo,
    meta: {
      title: "粒子照片",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "image"],
    },
    menuProps: {},
  },
  {
    path: "/dataFlow",
    name: "dataFlow",
    component: DataFlow,
    meta: {
      title: "数据流转",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "shuffle"],
    },
    menuProps: {},
  },
  {
    path: "/dataFlow2",
    name: "dataFlow2",
    component: DataFlow2,
    meta: {
      title: "数据流转2",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "shuffle"],
    },
    menuProps: {},
  },
  {
    path: "/building",
    name: "building",
    component: Building,
    meta: {
      title: "智慧楼宇",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "building"],
    },
    menuProps: {},
  },
  {
    path: "/superMap",
    name: "superMap",
    component: SuperMap,
    meta: {
      title: "超级地图",
      hide: false, // 是否在菜单中隐藏
      icon: ["fas", "map"],
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
    path: "/study",
    name: "study",
    redirect: "/study/test",
    meta: {
      title: "记录",
      icon: ["fas", "scroll"],
    },
    children: [
      {
        path: "/study/test",
        name: "/study/test",
        component: Readme,
        meta: {
          title: "记录1",
          icon: ["fas", "scroll"],
        },
      },
      {
        path: "/study/test2",
        name: "/study/test2",
        redirect: "/study/test2/2-2",
        meta: {
          title: "记录2",
          icon: ["fas", "scroll"],
        },
        children: [
          {
            path: "/study/test2/2-2",
            name: "/study/test2/2-2",
            component: DataFlow,
            meta: {
              title: "记录2-2",
              icon: ["fas", "scroll"],
            },
          },
        ],
      },
    ],
  },
];

export default createRouter({
  // history: createWebHistory("/three-demo-site/"),
  history: createWebHashHistory("/three-demo-site/"),
  routes,
});
export { routes };
