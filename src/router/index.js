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
const Introduction = () =>
  import("../view/Study/basics/introduction/Introduction.vue");
const Transform = () => import("../view/Study/basics/transform/Transform.vue");
const Matrix = () => import("../view/Study/basics/matrix/Matrix.vue");
const Lights = () => import("../view/Study/classics/lights/Lights.vue");
const Animations = () =>
  import("../view/Study/basics/animations/Animations.vue");
const Cameras = () => import("../view/Study/basics/cameras/Cameras.vue");
const Resizing = () => import("../view/Study/basics/resizing/Resizing.vue");

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
    redirect: "/study/basics/introduction",
    meta: {
      title: "学习记录",
      icon: ["fas", "code"],
    },
    children: [
      {
        path: "/study/basics",
        name: "/study/basics",
        redirect: "/study/basics/introduction",
        meta: {
          title: "基础学习",
          icon: ["fas", "star"],
        },
        children: [
          {
            path: "/study/basics/introduction",
            name: "/study/basics/introduction",
            component: Introduction,
            meta: {
              title: "介绍",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/transform",
            name: "/study/basics/transform",
            component: Transform,
            meta: {
              title: "变化",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/matrix",
            name: "/study/basics/matrix",
            component: Matrix,
            meta: {
              title: "矩阵",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/animations",
            name: "/study/basics/animations",
            component: Animations,
            meta: {
              title: "动画",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/cameras",
            name: "/study/basics/cameras",
            component: Cameras,
            meta: {
              title: "相机",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/resizing",
            name: "/study/basics/resizing",
            component: Resizing,
            meta: {
              title: "自适应",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/geometries",
            name: "/study/basics/geometries",
            component: Matrix,
            meta: {
              title: "几何体",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/gui",
            name: "/study/basics/gui",
            component: Matrix,
            meta: {
              title: "GUI",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/textures",
            name: "/study/basics/textures",
            component: Matrix,
            meta: {
              title: "纹理",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/materials",
            name: "/study/basics/materials",
            component: Matrix,
            meta: {
              title: "材料",
              icon: ["fas", "star"],
            },
          },
          {
            path: "/study/basics/text",
            name: "/study/basics/text",
            component: Matrix,
            meta: {
              title: "文本",
              icon: ["fas", "star"],
            },
          },
        ],
      },
      {
        path: "/study/classics",
        name: "/study/classics",
        redirect: "/study/classics/lights",
        meta: {
          title: "经典方法",
          icon: ["fas", "lightbulb"],
        },
        children: [
          {
            path: "/study/classics/lights",
            name: "/study/classics/lights",
            component: Lights,
            meta: {
              title: "灯光",
              icon: ["fas", "lightbulb"],
            },
          },
        ],
      },
      {
        path: "/study/advanced",
        name: "/study/advanced",
        redirect: "/study/advanced/physics",
        meta: {
          title: "进阶技术",
          icon: ["fas", "magnet"],
        },
        children: [
          {
            path: "/study/advanced/physics",
            name: "/study/advanced/physics",
            component: DataFlow,
            meta: {
              title: "物理引擎",
              icon: ["fas", "car"],
            },
          },
        ],
      },
      {
        path: "/study/shaders",
        name: "/study/shaders",
        redirect: "/study/shaders/shaders",
        meta: {
          title: "着色器",
          icon: ["fas", "paint-roller"],
        },
        children: [
          {
            path: "/study/shaders/shaders",
            name: "/study/shaders/shaders",
            component: DataFlow,
            meta: {
              title: "着色器",
              icon: ["fas", "paint-roller"],
            },
          },
        ],
      },
      {
        path: "/study/extra",
        name: "/study/extra",
        redirect: "/study/extra/processing",
        meta: {
          title: "额外知识",
          icon: ["fas", "share-nodes"],
        },
        children: [
          {
            path: "/study/extra/processing",
            name: "/study/extra/processing",
            component: DataFlow,
            meta: {
              title: "后期处理",
              icon: ["fas", "share-nodes"],
            },
          },
        ],
      },
      {
        path: "/study/react",
        name: "/study/react",
        redirect: "/study/react/threeFiber",
        meta: {
          title: "React与Three",
          icon: ["fas", "star-of-david"],
        },
        children: [
          {
            path: "/study/react/threeFiber",
            name: "/study/react/threeFiber",
            component: DataFlow,
            meta: {
              title: "ReactThreeFiber",
              icon: ["fas", "star-of-david"],
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
