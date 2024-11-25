import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { eventBus } from "@/utils";
import exampleMd from "@/servers/view/Building/building.md?raw";
import renderedJs from "@/servers/view/Building/useBuildingServers.js?raw";
import renderedTemplate from "@/view/Building.vue?raw";
import markdownIt from "markdown-it";
import Prism from "prismjs";
import background from "@/assets/common/img/dataFlow/background.png";

export default function useBuildingServers({ containerRef }) {
  // 相关变量
  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();
  const wrap = ref(null);
  let container;
  let camera, scene, renderer, model;

  const addModel = (position) => {
    gltfLoader.load(
      "/glb/building/office_building.glb",
      function (gltf) {
        model = gltf.scene; // 获取加载的模型对象
        scene.add(model); // 将模型添加到场景中

        if (position) {
          model.position.copy(position);
        } else {
          // 检查模型的尺寸并适当缩放
          //   model.scale.set(0.5, 0.5, 0.5); // 可以尝试调整缩放，确保模型大小合适
          model.position.set(0, 100, 0);
          model.rotation.y = Math.PI;
        }

        console.log("model", model);

        renderer.render(scene, camera);
      },
      undefined,
      function (error) {
        console.error("Error loading GLB model:", error);
      }
    );
  };

  // function render() {
  //   splines.uniform.mesh.visible = params.uniform;
  //   splines.centripetal.mesh.visible = params.centripetal;
  //   splines.chordal.mesh.visible = params.chordal;
  //   renderer.render(scene, camera);
  // }

  function animate(time) {
    requestAnimationFrame(animate);
    // console.log("animate", time);
    renderer.render(scene, camera);
  }

  // 事件处理
  function onWindowDblclick() {
    console.log("1", container.offsetWidth, container.offsetHeight);
    // 判断是否已经进入全屏模式
    // 进入全屏模式
    if (document.fullscreenElement) {
      document.exitFullscreen();
      if (container) {
        // 将容器元素返回初始大小
        container.style.position = "relative";
        container.style.top = 0;
        container.style.left = 0;
        container.style.width = "100%";
        container.style.height = "calc(100vh - 40px)";
        container.style.zPhoto = 0; // 确保容器在最前面
      }
    } else {
      document.documentElement.requestFullscreen();
      if (container) {
        // 将容器元素占满全屏
        container.style.position = "fixed";
        container.style.top = 0;
        container.style.left = 0;
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.zPhoto = 9; // 确保容器在最前面
      }
    }
    console.log("2", container.offsetWidth, container.offsetHeight); // 1920 919
    // 更新camera的aspect比例
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    // 更新renderer的大小
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }
  function onWindowResize() {
    // onWindowDblclick实际只是起到更新dom元素的作用，requestFullscreen返回的是Promise所以有延迟，更新renderer的大小实际是靠resize事件
    console.log(4, container.offsetWidth, container.offsetHeight);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    // 更新renderer的大小
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    // render();
  }
  function onFullscreenChange() {
    if (document.fullscreenElement) {
      // 如果进入全屏
      container.style.position = "fixed";
      container.style.top = 0;
      container.style.left = 0;
      container.style.width = "100vw";
      container.style.height = "100vh";
      container.style.zPhoto = 9; // 确保容器在最前面
    } else {
      // 如果退出全屏
      container.style.position = "relative";
      container.style.width = "100%";
      container.style.height = "calc(100vh - 40px)";
      container.style.zPhoto = 0; // 还原zPhoto
    }

    console.log(3, container.offsetWidth, container.offsetHeight);
    // 更新相机和渲染器设置
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

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
      container = document.getElementById("container");

      scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xf0f0f0); // 设置场景背景颜色
      // 设置全景图
    //   textureLoader.load(
    //     background,
    //     // onLoad 回调
    //     (texture) => {
    //       scene.background = texture;
    //       scene.environment = texture;
    //       // render();
    //     },
    //     // onProgress 回调
    //     (xhr) => {
    //       console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    //     },
    //     // onError 回调
    //     (error) => {
    //       console.error("An error occurred while loading the texture", error);
    //     }
    //   );

      camera = new THREE.PerspectiveCamera(
        70,
        container.offsetWidth / container.offsetHeight,
        1,
        10000
      );
      camera.position.set(0, 50, 300);
      scene.add(camera);

      scene.add(new THREE.AmbientLight(0xf0f0f0, 3));
      const light = new THREE.SpotLight(0xffffff, 4.5);
      light.position.set(0, 1500, 200);
      light.angle = Math.PI * 0.2;
      light.decay = 0;
      light.castShadow = true;
      light.shadow.camera.near = 200;
      light.shadow.camera.far = 2000;
      light.shadow.bias = -0.000222;
      // 默认值是 512x512 像素，较低的分辨率会导致阴影边缘出现锯齿或模糊
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      scene.add(light);

      // 创建接收阴影的平面
      const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
      planeGeometry.rotateX(-Math.PI / 2);
      // 此材质接收阴影，但在其他方面完全透明
      const planeMaterial = new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: 0.2,
      });

      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.y = -200;
      plane.receiveShadow = true;
      scene.add(plane);

      // 辅助观察坐标系
      // 红R、绿G、蓝B分别对应坐标系的x、y、z轴，对于three.js的3D坐标系默认y轴朝上。
    //   const axes = new THREE.AxesHelper(800);
    //   scene.add(axes);

      addModel();

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.useLegacyLights = false;
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.damping = 0.2;

      //   事件监听
      window.addEventListener("resize", onWindowResize);
      eventBus.on("collapseChange", onWindowResize);
      document.addEventListener("dblclick", onWindowDblclick);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      Prism.highlightAll();
    } catch (e) {
      console.log(e);
    }
  };

  //初始化
  onMounted(async () => {
    init();
    // render();
    animate();
  });

  // 卸载
  onBeforeUnmount(() => {
    window.removeEventListener("resize", onWindowResize);
    eventBus.off("collapseChange", onWindowResize);
    document.removeEventListener("dblclick", onWindowDblclick);
    document.removeEventListener("fullscreenchange", onFullscreenChange);
  });

  return {
    clickHandler,
    closeHandler,
    isShow,
    exampleMd,
    renderedMarkdown,
    noteProps,
    wrap,
  };
}
