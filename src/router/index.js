import { createRouter, createWebHistory } from "vue-router";
const index = () => import("../view/index.vue");

const routes = [
  {
    path: "/",
    name: "index",
    component: index,
    meta: {
      title: "首页",
    },
    menuProps: {},
  },
  {
    path: "/test",
    name: "test",
    redirect: "/test/test1",
    meta: {
      title: "测试",
    },
    menuProps: {},
    children: [
      {
        path: "/test/test1",
        name: "test1",
        component: index,
        meta: {
          title: "测试1",
        },
        menuProps: {},
      }
    ]
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
export { routes };
