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
import Map3d from "@/servers/view/SuperMap/utils/Map3d.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import TWEEN from "@tweenjs/tween.js";
import gsap from "gsap";
import { random } from "@/servers/view/SuperMap/utils";
import useFileLoader from "@/servers/view/SuperMap/hooks/useFileLoader.js";
import useCountry from "@/servers/view/SuperMap/hooks/useCountry.js";
import useCoord from "@/servers/view/SuperMap/hooks/useCoord.js";
import useConversionStandardData from "@/servers/view/SuperMap/hooks/useConversionStandardData.js";
import useMapMarkedLightPillar from "@/servers/view/SuperMap/hooks/useMapMarkedLightPillar";
import useCSS2DRender from "@/servers/view/SuperMap/hooks/useCSS2DRender";

export default function useSuperMapServers({ containerRef }) {
  // 相关变量
  let centerXY = [104.114129, 7.550339]; // 地图的中心点，这个值会变更(取渲染出的3D地图的中心坐标)
  const COLOR_ARR = ["#0f1214", "#0d3854"]; // 测试颜色用的
  const ADCODE = [
    {
      adcode: 110000,
      name: "北京",
      centroid: [116.41995, 40.18994],
      markSite: [116.41995, 40.18994], //标记点位置
      labelSite: [116.405285, 39.904989], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 120000,
      name: "天津",
      centroid: [117.347043, 39.288036],
      markSite: [117.347043, 39.288036], //标记点位置
      labelSite: [117.190182, 39.125596], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 130000,
      name: "河北",
      centroid: [114.502461, 38.045474],
      markSite: [114.502461, 38.045474], //标记点位置
      labelSite: [114.502461, 38.045474], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 140000,
      name: "山西",
      centroid: [112.304436, 37.618179],
      markSite: [112.304436, 37.618179], //标记点位置
      labelSite: [112.549248, 37.857014], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 150000,
      name: "内蒙古",
      centroid: [114.077429, 44.331087],
      markSite: [114.077429, 44.331087], //标记点位置
      labelSite: [111.670801, 40.818311], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 210000,
      name: "辽宁",
      centroid: [122.604994, 41.299712],
      markSite: [122.604994, 41.299712], //标记点位置
      labelSite: [123.429096, 41.796767], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 220000,
      name: "吉林",
      centroid: [126.171208, 43.703954],
      markSite: [126.171208, 43.703954], //标记点位置
      labelSite: [125.3245, 43.886841], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 230000,
      name: "黑龙江",
      centroid: [127.693027, 48.040465],
      markSite: [127.693027, 48.040465], //标记点位置
      labelSite: [126.642464, 47], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 100,
    },
    {
      adcode: 310000,
      name: "上海",
      centroid: [121.438737, 31.072559],
      markSite: [121.438737, 31.072559], //标记点位置
      labelSite: [121.472644, 31.231706], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 60,
    },
    {
      adcode: 320000,
      name: "江苏",
      centroid: [119.486506, 32.983991],
      markSite: [119.486506, 32.983991], //标记点位置
      labelSite: [118.767413, 32.041544], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 330000,
      name: "浙江",
      centroid: [120.109913, 29.181466],
      markSite: [120.109913, 29.181466], //标记点位置
      labelSite: [120.153576, 30.287459], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 340000,
      name: "安徽",
      centroid: [117.226884, 31.849254],
      markSite: [117.226884, 31.849254], //标记点位置
      labelSite: [117.283042, 31.86119], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 350000,
      name: "福建",
      centroid: [118.006468, 26.069925],
      markSite: [118.006468, 26.069925], //标记点位置
      labelSite: [119.306239, 26.075302], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 360000,
      name: "江西",
      centroid: [115.732975, 27.636112],
      markSite: [115.732975, 27.636112], //标记点位置
      labelSite: [115.892151, 28.676493], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 370000,
      name: "山东",
      centroid: [118.187759, 36.376092],
      markSite: [118.187759, 36.376092], //标记点位置
      labelSite: [117.000923, 36.675807], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 410000,
      name: "河南",
      centroid: [113.619717, 33.902648],
      markSite: [113.619717, 33.902648], //标记点位置
      labelSite: [113.665412, 34.757975], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 420000,
      name: "湖北",
      centroid: [112.271301, 30.987527],
      markSite: [112.271301, 30.987527], //标记点位置
      labelSite: [114.298572, 30.584355], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 430000,
      name: "湖南",
      centroid: [111.711649, 27.629216],
      markSite: [111.711649, 27.629216], //标记点位置
      labelSite: [112.982279, 28.19409], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 440000,
      name: "广东",
      centroid: [113.429919, 23.334643],
      markSite: [113.429919, 23.334643], //标记点位置
      labelSite: [113.280637, 24], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 450000,
      name: "广西",
      centroid: [108.7944, 23.833381],
      markSite: [108.7944, 23.833381], //标记点位置
      labelSite: [108.320004, 22.82402], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 460000,
      name: "海南",
      centroid: [109.754859, 19.189767],
      markSite: [109.754859, 19.189767], //标记点位置
      labelSite: [110.33119, 20.031971], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 60,
    },
    {
      adcode: 500000,
      name: "重庆",
      centroid: [107.8839, 30.067297],
      markSite: [107.8839, 30.067297], //标记点位置
      labelSite: [106.504962, 29.533155], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 510000,
      name: "四川",
      centroid: [102.693453, 30.674545],
      markSite: [102.693453, 30.674545], //标记点位置
      labelSite: [104.065735, 30.659462], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 520000,
      name: "贵州",
      centroid: [106.880455, 26.826368],
      markSite: [106.880455, 26.826368], //标记点位置
      labelSite: [106.713478, 26.578343], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 530000,
      name: "云南",
      centroid: [101.485106, 25.008643],
      markSite: [101.485106, 25.008643], //标记点位置
      labelSite: [102.712251, 25.040609], //文本标签位置
      reportStatus: 2, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0d3854", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 540000,
      name: "西藏",
      centroid: [88.388277, 31.56375],
      markSite: [88.388277, 31.56375], //标记点位置
      labelSite: [91.132212, 29.660361], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 1, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 120,
    },
    {
      adcode: 610000,
      name: "陕西",
      centroid: [108.887114, 35.263661],
      markSite: [108.887114, 35.263661], //标记点位置
      labelSite: [108.948024, 34.263161], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 620000,
      name: "甘肃",
      centroid: [103.823557, 36.058039],
      markSite: [103.823557, 36.058039], //标记点位置
      labelSite: [103.823557, 36.058039], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 630000,
      name: "青海",
      centroid: [96.043533, 35.726403],
      markSite: [96.043533, 35.726403], //标记点位置
      labelSite: [99, 36.623178], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 100,
    },
    {
      adcode: 640000,
      name: "宁夏",
      centroid: [106.169866, 37.291332],
      markSite: [106.169866, 37.291332], //标记点位置
      labelSite: [106.278179, 38.46637], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 650000,
      name: "新疆",
      centroid: [85.294711, 41.371801],
      markSite: [85.294711, 41.371801], //标记点位置
      labelSite: [87.617733, 43.792818], //文本标签位置
      reportStatus: 1, //未接入0，已上报1，未上报2
      riskLevel: 2, //低危0，中危1，高危2
      topColor: "#2890f0", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 120,
    },
    {
      adcode: 710000,
      name: "台湾",
      centroid: [120.971485, 23.749452],
      markSite: [120.971485, 23.749452], //标记点位置
      labelSite: [121.509062, 25.044332], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 60,
    },
    {
      adcode: 810000,
      name: "香港",
      centroid: [114.134357, 22.377366],
      markSite: [114.134357, 22.377366], //标记点位置
      labelSite: [114.5, 22.5], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
    {
      adcode: 820000,
      name: "澳门",
      centroid: [113.566988, 22.159307],
      markSite: [113.566988, 22.159307], //标记点位置
      labelSite: [112.5, 21.5], //文本标签位置
      reportStatus: 0, //未接入0，已上报1，未上报2
      riskLevel: 0, //低危0，中危1，高危2
      topColor: "#0f1214", //顶部颜色,根据上报状态来定,上报状态值为0时顶部颜色值为#0f1214，为1时颜色为#2890f0，为2时颜色为#0d3854
      sideColor: "#4e8da2", //侧边颜色
      markSize: 80,
    },
  ];
  const ADCODE_MAP = new Map();
  ADCODE.forEach((item) => {
    ADCODE_MAP.set(item.adcode, item);
  });

  const adCodeMap = {
    北京市: 110000,
    天津市: 120000,
    河北省: 130000,
    山西省: 140000,
    内蒙古自治区: 150000,
    辽宁省: 210000,
    吉林省: 220000,
    黑龙江省: 230000,
    上海市: 310000,
    江苏省: 320000,
    浙江省: 330000,
    安徽省: 340000,
    福建省: 350000,
    江西省: 360000,
    山东省: 370000,
    河南省: 410000,
    湖北省: 420000,
    湖南省: 430000,
    广东省: 440000,
    广西壮族自治区: 450000,
    海南省: 460000,
    重庆市: 500000,
    四川省: 510000,
    贵州省: 520000,
    云南省: 530000,
    西藏自治区: 540000,
    陕西省: 610000,
    甘肃省: 620000,
    青海省: 630000,
    宁夏回族自治区: 640000,
    新疆维吾尔自治区: 650000,
    台湾省: 710000,
    香港特别行政区: 810000,
    澳门特别行政区: 820000,
  };

  // 地图相关逻辑
  let baseEarth = null;

  // 重置
  const resize = () => {
    baseEarth.resize();
  };

  const { requestData } = useFileLoader();
  const { transfromGeoJSON } = useConversionStandardData();
  const { getBoundingBox } = useCoord();
  const { createCountryFlatLine, createAreaLine } = useCountry();
  const { initCSS2DRender, create2DTag, create2DMark } = useCSS2DRender();
  const { createLightPillar, setLightPillarColor } = useMapMarkedLightPillar({
    scaleFactor: 3,
  });

  const texture = new THREE.TextureLoader();
  const textureMap = texture.load("/imges/superMap/gz-map.jpg");
  const texturefxMap = texture.load("/imges/superMap/gz-map-fx.jpg");
  const rotatingApertureTexture = texture.load(
    "/imges/superMap/rotatingAperture.png"
  );
  const rotatingPointTexture = texture.load("/imges/superMap/rotating-point2.png");
  const circlePoint = texture.load("/imges/superMap/circle-point.png");
  const sceneBg = texture.load("/imges/superMap/scene-bg2.png");
  textureMap.wrapS = texturefxMap.wrapS = THREE.RepeatWrapping;
  textureMap.wrapT = texturefxMap.wrapT = THREE.RepeatWrapping;
  textureMap.flipY = texturefxMap.flipY = false;
  textureMap.rotation = texturefxMap.rotation = THREE.MathUtils.degToRad(45);
  const scale = 0.0;
  textureMap.repeat.set(scale, scale);
  texturefxMap.repeat.set(scale, scale);

  const color = new THREE.Color("#29445d");
  // json数据中的code映射组
  let groupCodeMap = {};
  // 光标也可以针对单个省
  let lightGroup = null;
  const guiParams = {
    topColor: "#29445d",
    topOpacity: 0.81,
    sideColor: "#4e8da2",
    sideOpacity: 0.9,
    // scale: 0.0,
    markColor: 0xe10909,
    showBackground: true,
    adcodeMap: 510000,
    showCharts: false,
    showAperture: false,
    rotatingApertureMesh: null,
    rotatingPointMesh: null,
    circlePointMesh: null,
  };
  let backgroundMesh = null;
  // 地图拉伸设置
  const extrudeSettings = {
    depth: 1,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelThickness: 0.1,
  };

  // 为已上报时-顶部和侧边材质
  const topFaceMaterial = new THREE.MeshPhongMaterial({
    color: "#2890f0",
    // emissive: color,
    // combine: THREE.MultiplyOperation,
    transparent: true,
    opacity: 0.81,
  });
  const sideMaterial = new THREE.MeshLambertMaterial({
    color: "#4e8da2",
    transparent: true,
    opacity: 0.9,
  });
  const bottomZ = -0.2;
  // 初始化gui
  const initGui = (container) => {
    const gui = new GUI();
    gui.addColor(guiParams, "topColor").onChange((val) => {
      console.log("topColor", val, topFaceMaterial);
      if (topFaceMaterial) {
        topFaceMaterial.color = new THREE.Color(val);
      }
    });
    gui.add(guiParams, "topOpacity", 0.1, 1, 0.01).onChange((val) => {
      if (topFaceMaterial) {
        topFaceMaterial.opacity = val;
      }
    });
    gui.addColor(guiParams, "sideColor").onChange((val) => {
      if (sideMaterial) {
        sideMaterial.color = new THREE.Color(val);
      }
    });
    gui.add(guiParams, "sideOpacity", 0.1, 1, 0.01).onChange((val) => {
      if (topFaceMaterial) {
        sideMaterial.opacity = val;
      }
    });
    gui.addColor(guiParams, "markColor").onChange((val) => {
      console.log(val);
      // setLightPillarColor(lightGroup, val);
    });
    // gui.add(guiParams, "scale", 0, 1).onChange((val) => {
    //   textureMap.repeat.set(val, val);
    //   texturefxMap.repeat.set(val, val);
    // });
    gui.add(guiParams, "adcodeMap", adCodeMap).onChange((val) => {
      console.log(val); // 15000
      console.log(groupCodeMap);
      setLightPillarColor(groupCodeMap[val], guiParams.markColor);
    });
    gui.add(guiParams, "showBackground").onChange((val) => {
      backgroundMesh.visible = val;
    });
    gui.add(guiParams, "showCharts").onChange((val) => {
      showCharts.value = val;
    });
    gui.add(guiParams, "showAperture").onChange((val) => {
      guiParams.rotatingApertureMesh.visible = val;
      guiParams.rotatingPointMesh.visible = val;
      guiParams.circlePointMesh.visible = val;
    });

    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0px";
    gui.domElement.style.left = "0px";
    gui.domElement.style.zIndex = "99";
    container.appendChild(gui.domElement) ; 
  };
  // 初始化旋转光圈
  const initRotatingAperture = (scene, width) => {
    let plane = new THREE.PlaneBufferGeometry(width, width);
    let material = new THREE.MeshBasicMaterial({
      map: rotatingApertureTexture,
      transparent: true,
      opacity: 1,
      depthTest: true,
    });
    let mesh = new THREE.Mesh(plane, material);
    mesh.position.set(...centerXY, 0);
    mesh.scale.set(1.1, 1.1, 1.1);
    scene.add(mesh);
    return mesh;
  };
  // 初始化旋转点
  const initRotatingPoint = (scene, width) => {
    let plane = new THREE.PlaneBufferGeometry(width, width);
    let material = new THREE.MeshBasicMaterial({
      map: rotatingPointTexture,
      transparent: true,
      opacity: 1,
      depthTest: true,
    });
    let mesh = new THREE.Mesh(plane, material);
    mesh.position.set(...centerXY, bottomZ - 0.02);
    mesh.scale.set(1.1, 1.1, 1.1);
    scene.add(mesh);
    return mesh;
  };
  // 初始化背景
  const initSceneBg = (scene, width) => {
    let plane = new THREE.PlaneBufferGeometry(width * 3, width * 3);
    let material = new THREE.MeshBasicMaterial({
      // color: 0x061920,
      // color: 0xffffff,
      map: sceneBg,
      transparent: true,
      opacity: 1,
      depthTest: true,
    });

    backgroundMesh = new THREE.Mesh(plane, material);
    backgroundMesh.position.set(...centerXY, bottomZ - 0.2);
    scene.add(backgroundMesh);
    scene.fog = new THREE.Fog(0xffffff, 2, 90);
  };

  // 初始化背景
  const initSceneImag = (scene, url, size) => {
    new THREE.TextureLoader().load(url, (texture) => {
      const img = texture.image;
      let height = (img && img.height) || 1080;
      let width = (img && img.width) || 1920;
      console.log("size", height, width); // 1080*1920
      height = size * height;
      width = size * width;
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        // side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const geom = new THREE.PlaneGeometry(width, height);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...centerXY, bottomZ + 0.1);
      mesh.position.y += 2.5;
      mesh.position.x += 0.9;
      // mesh.receiveShadow = true; // 设置接受阴影
      scene.add(mesh);

      // 创建镜面
      const mirrorOptions = {
        clipBias: 0.03,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        transparent: true,
        opacity: 0.5,
      };
      const mirror = new Reflector(geom, mirrorOptions);
      // mirror.receiveShadow = true; // 设置接受阴影
      mirror.position.set(...centerXY, bottomZ - 0.2);
      mirror.position.y += 2.5;
      mirror.position.x += 0.9;
      scene.add(mirror);
    });
    scene.fog = new THREE.Fog(0xffffff, 2, 90);
  };

  // 初始化中国轮廓地图
  const ChinaOutlineParams = {
    // 需要的参数
    lines: [],
    positions: null,
    opacitys: null,
    points: null,
    geometry: null,
    // 速度控制
    currentPos: 0,
    currentPos1: 1800,
    currentPos2: 3600,
    pointSpeed: 10,
    // 追光控制
    pointSize: 3,
    pointColor: "#ffffff",
  };
  const initChinaOutline = async (scene) => {
    let indexBol = true;

    /**
     * 边框 图形绘制
     * @param polygon 多边形 点数组
     * @param color 材质颜色
     * */
    // function lineDraw(polygon, color) {
    //   const lineGeometry = new THREE.BufferGeometry();
    //   const pointsArray = new Array();
    //   polygon.forEach((row) => {
    //     const [x, y] = row;
    //     // 创建三维点
    //     pointsArray.push(new THREE.Vector3(x, -y, 0));
    //     console.log(indexBol);
    //     if (indexBol) {
    //       ChinaOutlineParams.lines.push([x, -y, 0]);
    //     }
    //   });
    //   indexBol = false;
    //   // 放入多个点
    //   lineGeometry.setFromPoints(pointsArray);

    //   const lineMaterial = new THREE.LineBasicMaterial({
    //     color: color,
    //   });
    //   return new THREE.Line(lineGeometry, lineMaterial);
    // }
    // 只是要追光效果的话不需要画地图
    function lineDraw(polygon) {
      polygon.forEach((row) => {
        const [x, y] = row;
        // 创建三维点
        ChinaOutlineParams.lines.push([x, -y, 0]);
        // 想增加点密度来实现更细腻的追光效果，但是效果不理想
        // ChinaOutlineParams.lines.push([x + 0.05, -y, 0]);
        // ChinaOutlineParams.lines.push([x - 0.05, -y, 0]);
        // ChinaOutlineParams.lines.push([x + 0.12, -y, 0]);
        // ChinaOutlineParams.lines.push([x - 0.12, -y, 0]);
      });
      indexBol = false;
    }

    const chinaData = await requestData("/json/superMap/中国轮廓.json");
    console.log("中国轮廓数据", chinaData);

    // 中国边界
    const feature = chinaData.features[0];
    // const province = new THREE.Object3D();
    // province.properties = feature.properties.name;
    // 点数据
    const coordinates = feature.geometry.coordinates;
    coordinates.forEach((coordinate) => {
      // coordinate 多边形数据
      coordinate.forEach((rows) => {
        const line = lineDraw(rows, 0xe10909);
        // province.add(line);
      });
    });

    // province.position.set(0, 0, 2);
    // province.rotation.set(0, Math.PI, Math.PI);
    // scene.add(province);

    // 着色器相关
    ChinaOutlineParams.geometry = new THREE.BufferGeometry();
    ChinaOutlineParams.positions = new Float32Array(
      ChinaOutlineParams.lines.flat(1)
    );
    // 设置顶点
    ChinaOutlineParams.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(ChinaOutlineParams.positions, 3)
    );
    // 设置 粒子透明度为 0
    ChinaOutlineParams.opacitys = new Float32Array(
      ChinaOutlineParams.positions.length
    ).map(() => 0);
    ChinaOutlineParams.geometry.setAttribute(
      "aOpacity",
      new THREE.BufferAttribute(ChinaOutlineParams.opacitys, 1)
    );

    const vertexShader = `
          attribute float aOpacity;
          uniform float uSize;
          varying float vOpacity;
  
          void main(){
              gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
              gl_PointSize = uSize;
  
              vOpacity=aOpacity;
          }
          `;

    const fragmentShader = `
          varying float vOpacity;
          uniform vec3 uColor;
  
          float invert(float n){
              return 1.-n;
          }
  
          void main(){
            if(vOpacity <=0.2){
                discard;
            }
            vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
            vec2 cUv=2.*uv-1.;
            vec4 color=vec4(1./length(cUv));
            color*=vOpacity;
            color.rgb*=uColor;
            gl_FragColor=color;
          }
          `;
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // 设置透明
      // emissive: 0xff0000,
      // lending: THREE.AdditiveBlending, //在使用此材质显示对象时要使用何种混合。加法
      uniforms: {
        uSize: {
          value: ChinaOutlineParams.pointSize,
        },
        uColor: {
          value: new THREE.Color(ChinaOutlineParams.pointColor),
        },
      },
    });
    ChinaOutlineParams.points = new THREE.Points(
      ChinaOutlineParams.geometry,
      material
    );
    scene.add(ChinaOutlineParams.points);

    ChinaOutlineParams.points.position.set(0, 0, 1.01);
    ChinaOutlineParams.points.rotation.set(0, Math.PI, Math.PI);
    //UI设计  12秒1圈   长度大概是 64/360
    // 渲染
    function render() {
      // console.log(ChinaOutlineParams.currentPos, ChinaOutlineParams.lines);
      if (
        ChinaOutlineParams.points &&
        ChinaOutlineParams.geometry.attributes.position
      ) {
        ChinaOutlineParams.currentPos += ChinaOutlineParams.pointSpeed;
        for (let i = 0; i < ChinaOutlineParams.pointSpeed; i++) {
          ChinaOutlineParams.opacitys[
            (ChinaOutlineParams.currentPos - i) %
              ChinaOutlineParams.lines.length
          ] = 0;
        }

        for (let i = 0; i < 888; i++) {
          ChinaOutlineParams.opacitys[
            (ChinaOutlineParams.currentPos + i) %
              ChinaOutlineParams.lines.length
          ] = i / 50 > 2 ? 2 : i / 50;
        }

        ChinaOutlineParams.currentPos1 += ChinaOutlineParams.pointSpeed;
        for (let i = 0; i < ChinaOutlineParams.pointSpeed; i++) {
          ChinaOutlineParams.opacitys[
            (ChinaOutlineParams.currentPos1 - i) %
              ChinaOutlineParams.lines.length
          ] = 0;
        }

        for (let i = 0; i < 888; i++) {
          ChinaOutlineParams.opacitys[
            (ChinaOutlineParams.currentPos1 + i) %
              ChinaOutlineParams.lines.length
          ] = i / 50 > 2 ? 2 : i / 50;
        }

        ChinaOutlineParams.currentPos2 += ChinaOutlineParams.pointSpeed;
        for (let i = 0; i < ChinaOutlineParams.pointSpeed; i++) {
          ChinaOutlineParams.opacitys[
            (ChinaOutlineParams.currentPos2 - i) %
              ChinaOutlineParams.lines.length
          ] = 0;
        }

        for (let i = 0; i < 300; i++) {
          ChinaOutlineParams.opacitys[
            (ChinaOutlineParams.currentPos2 + i) %
              ChinaOutlineParams.lines.length
          ] = i / 50 > 2 ? 2 : i / 50;
        }
        ChinaOutlineParams.geometry.attributes.aOpacity.needsUpdate = true;
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  };
  // 初始化原点
  const initCirclePoint = (scene, width) => {
    let plane = new THREE.PlaneBufferGeometry(width, width);
    let material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      map: circlePoint,
      transparent: true,
      opacity: 1,
      // depthTest: false,
    });
    let mesh = new THREE.Mesh(plane, material);
    mesh.position.set(...centerXY, bottomZ - 0.1);
    // let mesh2 = mesh.clone()
    // mesh2.position.set(...centerXY, bottomZ - 0.001)
    scene.add(mesh);
    return mesh;
  };
  // 初始化粒子
  const initParticle = (scene, bound) => {
    // 获取中心点和中间地图大小
    let { center, size } = bound;
    // 构建范围，中间地图的2倍
    let minX = center.x - size.x;
    let maxX = center.x + size.x;
    let minY = center.y - size.y;
    let maxY = center.y + size.y;
    let minZ = -6;
    let maxZ = 6;

    let particleArr = [];
    for (let i = 0; i < 16; i++) {
      const particle = createSequenceFrame({
        image: "./imges/superMap/上升粒子1.png",
        width: 180,
        height: 189,
        frame: 9,
        column: 9,
        row: 1,
        speed: 0.5,
      });
      let particleScale = random(5, 10) / 1000;
      particle.scale.set(particleScale, particleScale, particleScale);
      particle.rotation.x = Math.PI / 2;
      let x = random(minX, maxX);
      let y = random(minY, maxY);
      let z = random(minZ, maxZ);
      particle.position.set(x, y, z);
      particleArr.push(particle);
    }
    scene.add(...particleArr);
    return particleArr;
  };
  // 创建顶部底部边线
  const initBorderLine = (data, mapGroup) => {
    let lineTop = createCountryFlatLine(
      data,
      {
        // color: 0xffffff,
        color: 0x969ca2,
        linewidth: 0.0008,
        transparent: true,
        depthTest: false,
      },
      "Line2"
    );
    // lineTop.position.z = extrudeSettings.depth;
    lineTop.position.z += extrudeSettings.depth + 0.1;
    let lineBottom = createCountryFlatLine(
      data,
      {
        color: 0xa9a7a7,
        linewidth: 0.001,
        transparent: true,
        depthTest: false,
      },
      "Line2"
    );
    lineBottom.position.z = 0.305;
    //  添加边线
    mapGroup.add(lineTop);
    console.log("大边线", lineTop);
    // mapGroup.add(lineBottom);
  };
  // 创建顶部描边边线
  const initStrokeLine = (data, mapGroup) => {
    let lineTop = createAreaLine(
      data,
      {
        color: "#adf5ff",
        linewidth: 0.0012,
        transparent: true,
        depthTest: false,
      },
      "Line2"
    );
    lineTop.position.z = extrudeSettings.depth + 0.65;
    //  添加边线
    console.log("小边线", lineTop);
    mapGroup.add(lineTop);
  };
  // 创建光柱
  const initLightPoint = (properties, mapGroup) => {
    if (!properties.markSite) {
      return false;
    }
    // 创建光柱
    let heightScaleFactor = 4 + random(1, 5) / 5;
    let lightCenter = properties.markSite;
    lightGroup = createLightPillar(...lightCenter, heightScaleFactor);
    lightGroup.position.z = extrudeSettings.depth + 0.1;
    mapGroup.add(lightGroup);
    return lightGroup;
  };
  // 创建标签
  const initLabel = (properties, scene) => {
    if (!properties.labelSite) {
      return false;
    }
    // 设置标签的显示内容和位置
    var label = create2DTag("标签", "map-32-label");
    scene.add(label);
    let labelCenter = properties.labelSite;
    label.show(
      properties.name,
      new THREE.Vector3(...labelCenter, extrudeSettings.depth + 0.31)
    );
  };

  // 创建2D标点
  const initMark = (properties, scene) => {
    if (!properties.markSite) {
      return false;
    }
    // 设置标签的显示内容和位置
    const mark = create2DMark();
    scene.add(mark);
    let markCenter = properties.markSite;
    mark.show(
      "/texture/旋转点位.webp",
      new THREE.Vector3(...markCenter, extrudeSettings.depth + 0.3),
      properties.markSize || 120
    );
  };

  // 图表相关逻辑
  const timeDate = ref(null);
  const userName = ref(null);
  const showCharts = ref(false);
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

      // 中国地图数据
      let provinceData = await requestData("/json/superMap/中华人民共和国.json");
      console.log("原始地图数据", provinceData);
      provinceData = transfromGeoJSON(provinceData);

      class CurrentMap3d extends Map3d {
        constructor(props) {
          super(props);
        }
        initCamera() {
          let { width, height } = this.options;
          let rate = width / height;
          // 设置45°的透视相机,更符合人眼观察
          this.camera = new THREE.PerspectiveCamera(45, rate, 0.001, 90000000);
          this.camera.up.set(0, 0, 1);
          // 中国地图
          this.camera.position.set(102.49, 11.97, 42.95); //相机在Three.js坐标系中的位置
          this.camera.lookAt(...centerXY, 0);
        }
        // 使用 GSAP 控制相机位置变化
        startEntranceAnimation() {
          // gsap.to(this.mapGroup.children, {
          //   opacity: 1, // 目标透明度
          //   duration: 2, // 动画持续时间
          //   delay: 5, // 延迟一定时间后开始动画
          //   // stagger: 0.1, // 每个元素动画之间的延迟时间
          //   ease: "power2.inOut", // 缓动函数
          // });

          const targetPosition = new THREE.Vector3(...centerXY, 0);
          // 使用 GSAP 控制相机位置变化
          gsap.to(this.camera.position, {
            x: 105.54, // 相机目标 x 坐标
            y: 21.36, // 相机目标 y 坐标
            z: 52.69, // 相机目标 z 坐标
            delay: 0.3, // 延迟一定时间后开始动画
            duration: 2, // 动画持续时间
            ease: "power2.inOut", // 缓动函数
            onUpdate: () => {
              this.camera.lookAt(targetPosition);
            },
          });

          gsap.to(this.scene.fog, {
            far: 1000,
            duration: 2,
            delay: 0.3,
            ease: "power2.inOut", // 缓动函数
          });
        }

        initModel() {
          try {
            // 创建组
            this.mapGroup = new THREE.Group();
            // 标签 初始化
            this.css2dRender = initCSS2DRender(this.options, this.container);

            provinceData.features.forEach((elem, index) => {
              // 定一个省份对象
              const province = new THREE.Object3D();
              // 坐标
              const coordinates = elem.geometry.coordinates;
              // city 属性
              const properties = elem.properties;
              console.log("当前省份配置", ADCODE_MAP.get(properties.adcode));
              const currentConfig =
                ADCODE_MAP.get(properties.adcode) || properties;

              // 循环坐标
              coordinates.forEach((multiPolygon) => {
                multiPolygon.forEach((polygon) => {
                  const shape = new THREE.Shape();
                  // 绘制shape
                  for (let i = 0; i < polygon.length; i++) {
                    let [x, y] = polygon[i];
                    if (i === 0) {
                      shape.moveTo(x, y);
                    }
                    shape.lineTo(x, y);
                  }
                  const geometry = new THREE.ExtrudeGeometry(
                    shape,
                    extrudeSettings
                  );

                  // const color = COLOR_ARR[Math.round(Math.random())]; // 测试颜色
                  let curTopMaterial = null;
                  let curSideMaterial = null;
                  // 设置材质
                  if (currentConfig && currentConfig.reportStatus !== 1) {
                    curTopMaterial = new THREE.MeshPhongMaterial({
                      color: currentConfig.topColor || "#0f1214",
                      // emissive: color,
                      // combine: THREE.MultiplyOperation,
                      transparent: true,
                      opacity: 0.81,
                    });
                    curSideMaterial = new THREE.MeshLambertMaterial({
                      color: currentConfig.sideColor || "#8cb9e8",
                      transparent: true,
                      opacity: 0.9,
                    });
                  } else {
                    curTopMaterial = topFaceMaterial;
                    curSideMaterial = sideMaterial;
                  }

                  const mesh = new THREE.Mesh(geometry, [
                    curTopMaterial,
                    curSideMaterial,
                  ]);

                  // 已上报的省份凸出来
                  if (currentConfig && currentConfig.reportStatus === 1) {
                    initStrokeLine(polygon, province);

                    // 方案1 凹凸效果 缺点：没有更强烈的层次感
                    mesh.scale.set(1, 1, 1.5);

                    // 方案2 在复制一个，修改材质
                    // const mesh2 = new THREE.Mesh(geometry, [
                    //   new THREE.MeshPhongMaterial({
                    //     color: "#19647d",
                    //     transparent: true,
                    //     opacity: 0.75,
                    //   }),
                    //   new THREE.MeshLambertMaterial({
                    //     color: "#061e27",
                    //     transparent: true,
                    //     opacity: 0.9,
                    //   }),
                    // ]);
                    // mesh2.position.z = extrudeSettings.depth;
                    // province.add(mesh2);
                  }
                  // mesh.material.opacity = 0; // 初始透明度为 0，无效
                  province.add(mesh);
                });
              });
              // 将每个省份的地图对象添加到总的地图组 mapGroup 中
              this.mapGroup.add(province);
              // 创建标点和标签
              // const curGroup = initLightPoint(currentConfig, this.mapGroup);
              initLabel(currentConfig, this.scene);
              // initMark(currentConfig, this.scene);
              // console.log("elem", elem); {type: 'Feature', properties: {name:"北京市",adcode:11000,level: "province",center: [116.405285, 39.904989]}, geometry: {…}
              // if (elem.properties && elem.properties.level === "province") {
              //   groupCodeMap[elem.properties.adcode] = curGroup;
              // }
            });
            // 创建上下边框
            initBorderLine(provinceData, this.mapGroup);
            console.log("this.mapGroup", this.mapGroup);

            let earthGroupBound = getBoundingBox(this.mapGroup);
            centerXY = [earthGroupBound.center.x, earthGroupBound.center.y + 8];
            let { size } = earthGroupBound;
            let width = size.x < size.y ? size.y + 1 : size.x + 1;
            // 添加背景，修饰元素
            // this.rotatingApertureMesh = guiParams.rotatingApertureMesh =
            //   initRotatingAperture(this.scene, width);
            // this.rotatingPointMesh = guiParams.rotatingPointMesh =
            //   initRotatingPoint(this.scene, width - 2);
            // this.circlePointMesh = guiParams.circlePointMesh = initCirclePoint(
            //   this.scene,
            //   width
            // );
            // this.rotatingApertureMesh.visible =
            //   this.rotatingPointMesh.visible =
            //   this.circlePointMesh.visible =
            //     guiParams.showAperture;

            if (guiParams.showBackground) {
              initSceneImag(this.scene, "/imges/superMap/scene-bg2.png", 0.063);
              // initSceneBg(this.scene, 40);
            }
            initChinaOutline(this.scene);
            console.log(ChinaOutlineParams);

            // 将组添加到场景中
            this.scene.add(this.mapGroup);
            // this.particleArr = initParticle(this.scene, earthGroupBound);
            initGui(this.container);
            // setLightPillarColor(
            //   groupCodeMap[guiParams.adcodeMap],
            //   guiParams.markColor
            // );
          } catch (error) {
            console.log(error);
          }
        }
        getDataRenderMap() {}

        destroy() {}
        initControls() {
          super.initControls();
          this.controls.target = new THREE.Vector3(...centerXY, 0);
        }
        initLight() {
          //   平行光1
          let directionalLight1 = new THREE.DirectionalLight(0x7af4ff, 1);
          directionalLight1.position.set(...centerXY, 30);
          //   平行光2
          let directionalLight2 = new THREE.DirectionalLight(0x7af4ff, 1);
          directionalLight2.position.set(...centerXY, 30);
          // 环境光
          let ambientLight = new THREE.AmbientLight(0x7af4ff, 1);
          // TODO：版本问题，聚光灯展示不出来
          // 聚光灯,颜色，光照强度，光源照射的最大距离，光线照射范围的角度，聚光锥的半影衰减百分比，沿着光照距离的衰减量
          let spotLight = new THREE.SpotLight(
            0x1af0ff,
            1.8,
            200,
            Math.PI / 3,
            0,
            2
          );
          spotLight.position.set(...centerXY, 25);
          spotLight.target.position.set(...centerXY, 0); // 设置聚光灯的目标位置
          this.addObject(spotLight.target); // 需要将目标的位置加入到场景中
          spotLight.penumbra = 0.45; // 设置聚光灯的边缘模糊程度

          // 将光源添加到场景中
          // this.addObject(directionalLight1);
          this.addObject(directionalLight2);
          this.addObject(ambientLight);
          this.addObject(spotLight);
        }
        initRenderer() {
          super.initRenderer();
          // this.renderer.autoClear = false;
          // this.renderer.outputEncoding = THREE.sRGBEncoding

          // {
          //   let { width, height } = this.options;
          //   // 添加后期处理效果
          //   this.composer = new EffectComposer(this.renderer);
          //   this.composer.setSize(width, height);
          //   const renderPass = new RenderPass(this.scene, this.camera);
          //   this.composer.addPass(renderPass);

          //   // 配置UnrealBloomPass
          //   const bloomPass = new UnrealBloomPass(
          //     // 泛光的画布大小
          //     new THREE.Vector2(width, height),
          //     // 泛光效果的强度
          //     0.4,
          //     // 泛光效果的半径
          //     0.4,
          //     // 泛光效果的阈值
          //     0.6
          //   );
          //   this.composer.addPass(bloomPass);
          // }
        }
        loop() {
          this.animationStop = window.requestAnimationFrame(() => {
            this.loop();
          });
          // 这里是你自己业务上需要的code

          // 在每一帧渲染之后获取相机的实时位置
          // var cameraPosition = this.camera.position.clone();
          // console.log("Camera Position:", cameraPosition);

          this.renderer.render(this.scene, this.camera);
          // 控制相机旋转缩放的更新
          if (this.options.controls.visibel && this.controls) {
            // this.controls.target.set(...centerXY, 0)
            this.controls.update();
          }
          // 统计更新
          if (this.options.statsVisibel) this.stats.update();
          if (guiParams.showAperture && this.rotatingApertureMesh) {
            this.rotatingApertureMesh.rotation.z += 0.0005;
          }
          if (guiParams.showAperture && this.rotatingPointMesh) {
            this.rotatingPointMesh.rotation.z -= 0.0005;
          }
          // 渲染标签
          if (this.css2dRender) {
            this.css2dRender.render(this.scene, this.camera);
          }
          // 粒子上升
          // if (this.particleArr.length) {
          //   for (let i = 0; i < this.particleArr.length; i++) {
          //     this.particleArr[i].updateSequenceFrame();
          //     this.particleArr[i].position.z += 0.01;
          //     if (this.particleArr[i].position.z >= 6) {
          //       this.particleArr[i].position.z = -6;
          //     }
          //   }
          // }
          TWEEN.update();
          if (this.composer) {
            this.composer.render();
          }
          // console.log(this.camera.position)
        }
        resize() {
          super.resize();
          // 这里是你自己业务上需要的code
          this.renderer.render(this.scene, this.camera);
          this.renderer.setPixelRatio(window.devicePixelRatio);

          if (this.css2dRender) {
            this.css2dRender.setSize(this.options.width, this.options.height);
          }
        }
      }

      baseEarth = new CurrentMap3d({
        container: "#container",
        axesVisibel: true,
        controls: {
          enableDamping: true, // 阻尼
          maxPolarAngle: (Math.PI / 2) * 0.98,
        },
      });
      baseEarth.run();
      baseEarth.startEntranceAnimation();
      window.addEventListener("resize", resize);

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
