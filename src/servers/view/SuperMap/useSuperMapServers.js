import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { eventBus } from "@/utils";
import exampleMd from "@/servers/view/SuperMap/superMap.md?raw";
import renderedJs from "@/servers/view/SuperMap/useSuperMapServers.js?raw";
import renderedTemplate from "@/view/SuperMap.vue?raw";
import markdownIt from "markdown-it";
import Prism from "prismjs";

export default function useSuperMapServers({ containerRef }) {
  // 相关变量

  // 图表相关逻辑
  const timeDate = ref(null);
  const userName = ref(null);
  const showCharts = ref(true);
  const displayData = reactive({
    // 左 菜单
    menuData1: [
      {
        name: "整体视图",
        active: true,
        route: "/landmark", //路由
        id: 0,
      },
      {
        name: "资产视图",
        active: false,
        route: "/building", //路由
        id: 2,
      },
    ],
    // 右 菜单
    menuData2: [
      {
        name: "风险视图",
        active: false,
        route: "/operation", //路由
        id: 3,
      },
      {
        name: "暂未开放",
        route: "/command", //路由
        active: false,
        id: 4,
      },
    ],
    handleClick: (item) => {
      if (item) {
        [...displayData.menuData1, ...displayData.menuData2].forEach((item) => {
          item.active = false;
        });
        item.active = true;
      }
    },
    // 当前日期和时间
    nowDate: "", // 当前日期
    openType: false,
  });

  // 日期 时间 星期
  const formatDate = () => {
    let date = new Date();
    let year = date.getFullYear(); // 年
    let month = date.getMonth() + 1; // 月
    let day = date.getDate(); // 日
    let week = date.getDay(); // 星期
    let weekArr = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    let hour = date.getHours(); // 时
    hour = hour < 10 ? "0" + hour : hour; // 如果只有一位，则前面补零
    let minute = date.getMinutes(); // 分
    minute = minute < 10 ? "0" + minute : minute; // 如果只有一位，则前面补零
    let second = date.getSeconds(); // 秒
    second = second < 10 ? "0" + second : second; // 如果只有一位，则前面补零
    displayData.nowDate = `${year}/${month}/${day} ${hour}:${minute}:${second} ${weekArr[week]}`;
  };
  // 日期 时间 星期  刷新
  const currentTime = () => {
    setInterval(formatDate, 500); // 每 0.5秒 刷新 获取时间 数据
  };
  // 动画效果
  const animation = () => {
    let navigation = document.querySelector(".navigation"); // 导航
    let imgsSetting = document.querySelector(".imgs_setting"); // 边框
    let navigationMain = document.querySelector(".navigation_main"); // 文字
    let navigationUlMenuLeft = document.querySelector(
      ".navigation_ul_menu_left"
    ); // 左
    let navigationUlMenuRight = document.querySelector(
      ".navigation_ul_menu_right"
    ); // 右

    navigation.style.cssText = "animation: imgsSettingTop 1s 0.8s; opacity: 1;";
    imgsSetting.style.cssText = "animation: imgsSettingTop 1s 1s; opacity: 1;";
    navigationMain.style.cssText =
      "animation: imgsSettingTop 2s 1s; opacity: 1;";
    navigationUlMenuLeft.style.cssText =
      "animation: navigationBottom 3s 1s; opacity: 1;";
    navigationUlMenuRight.style.cssText =
      "animation: navigationBottom 3s 1s; opacity: 1;";

    userName.value.style.cssText =
      "animation: imgsSettingTop 3s 1s; opacity: 1;"; // 用户名称
    timeDate.value.style.cssText =
      "animation: navigationBottom 3s 1s; opacity: 1;"; // 时间日期
  };

  const isShow = ref(false);
  // 点击查看笔记处理函数
  const clickHandler = () => {
    console.log("查看笔记");
    isShow.value = !isShow.value;
  };
  // 关闭悬浮处理函数
  const closeHandler = () => {
    isShow.value = false;
  };

  // 获取md
  const renderedMarkdown = computed(() => {
    const md = markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    return md.render(exampleMd);
  });

  // 笔记配置
  const noteProps = computed(() => {
    return {
      visible: isShow.value,
      data: [
        {
          id: 1,
          title: "template",
          content: renderedTemplate,
          type: "code:vue",
        },
        { id: 2, title: "serve", content: renderedJs, type: "code:js" },
        { id: 3, title: "笔记", content: renderedMarkdown.value, type: "html" },
      ],
    };
  });

  const init = async () => {
    try {
      // 图表相关
      if (showCharts.value) {
        currentTime();
        animation();
      }
      Prism.highlightAll();
    } catch (e) {
      console.log(e);
    }
  };

  //初始化
  onMounted(async () => {
    await init();
  });

  // 卸载
  onBeforeUnmount(() => {});

  return {
    clickHandler,
    closeHandler,
    isShow,
    exampleMd,
    renderedMarkdown,
    noteProps,
    displayData,
    showCharts,
    userName,
    timeDate,
  };
}
