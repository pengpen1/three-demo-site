import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { eventBus } from "@/utils";
import exampleMd from "@/servers/view/DataFlow2/dataFlow2.md?raw";
import renderedJs from "@/servers/view/DataFlow2/useDataFlow2Servers.js?raw";
import renderedTemplate from "@/view/DataFlow2.vue?raw";
import markdownIt from "markdown-it";
import Prism from "prismjs";
import background from "@/assets/common/img/dataFlow/background.png";
import texture1 from "@/assets/common/img/dataFlow/texture-1.png";
import texture2 from "@/assets/common/img/dataFlow/texture-2.png";
import texture3 from "@/assets/common/img/dataFlow/texture-3.png";
import texture4 from "@/assets/common/img/dataFlow/texture-4.png";

export default function useDataFlowServers({ containerRef }) {
  // 相关变量
  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();
  const wrap = ref(null);
  let container, css2dRender;
  let camera, scene, renderer, ring, textLabel;
  const splineHelperObjects = [];
  let splinePointsLength = 4;
  const positions = [];
  const point = new THREE.Vector3();

  const raycaster = new THREE.Raycaster(); // 光线投射
  const pointer = new THREE.Vector2();

  const geometry = new THREE.BoxGeometry(20, 20, 20);
  let lineDashedMaterial = null;
  let shaderMaterial = null;
  let transformControl;

  const ARC_SEGMENTS = 200;

  const splines = {};

  const params = {
    tension: 0.5,
    chordal: true,
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline,
  };

  const textureMap = {
    1: textureLoader.load(texture1),
    2: textureLoader.load(texture2),
    3: textureLoader.load(texture3),
    4: textureLoader.load(texture4),
  };

  // 从右到左
  const modelConfig = [
    {
      url: "/glb/dataFlow/computer.glb",
      scale: 5,
      rotation: [0, 0, 0],
      text: "数据展示",
      position: new THREE.Vector3(100, 76, 56),
      labelPosition: new THREE.Vector3(105, 82, 56),
    },
    {
      url: "/glb/dataFlow/data_center_low-poly.glb",
      scale: 1,
      rotation: [0, 0, 0],
      text: "数据存储",
      position: new THREE.Vector3(50, 76, -14),
      labelPosition: new THREE.Vector3(55, 82, -14),
    },
    {
      url: "/glb/dataFlow/database.glb",
      scale: 20,
      rotation: [0, 0, 0],
      text: "数据处理",
      position: new THREE.Vector3(-50, 76, -6),
      labelPosition: new THREE.Vector3(-50, 82, -6),
    },
    {
      url: "/glb/dataFlow/computer.glb",
      scale: 5,
      rotation: [0, 0, 0],
      text: "数据采集",
      position: new THREE.Vector3(-100, 76, 47),
      labelPosition: new THREE.Vector3(-105, 82, 47),
    },
  ];

  function loadGLTFModel(url) {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        url, // 模型文件路径
        (gltf) => {
          resolve(gltf); // 模型加载成功，返回模型数据
        },
        undefined, // 加载进度回调
        (error) => {
          reject(error); // 加载失败，返回错误信息
        }
      );
    });
  }

  function destroyObject(object) {
    // 1. 从场景中移除物体
    scene.remove(object);

    // 2. 销毁物体的几何体
    if (object.geometry) {
      object.geometry.dispose();
    }

    // 3. 销毁物体的材质
    if (object.material) {
      if (Array.isArray(object.material)) {
        // 如果有多个材质，则遍历销毁
        object.material.forEach((material) => {
          material.dispose();
        });
      } else {
        // 单个材质
        object.material.dispose();
      }
    }

    // 4. 如果物体使用了纹理，销毁纹理
    if (object.material && object.material.map) {
      object.material.map.dispose();
    }
  }

  function createTextLabel(text, position) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.color = "white";
    div.style.fontSize = "20px";
    div.textContent = text;

    const label = new CSS2DObject(div);
    label.position.set(position.x, position.y, position.z);
    return label;
  }

  /**
   * 初始化标签-
   * @param {*} options 参数
   * @param {*} container canvas内容容器
   * @returns
   */
  const initCSS2DRender = (options, container) => {
    const { width, height } = options; // 获取世界的宽高
    const css2dRender = new CSS2DRenderer(); // 实例化css2d渲染器
    css2dRender.setSize(width, height); // 设置渲染器的尺寸
    css2dRender.domElement.style.position = "absolute"; // 设置定位位置
    css2dRender.domElement.style.zIndex = 100; // 设置层级
    css2dRender.domElement.style.left = "0px";
    css2dRender.domElement.style.top = "0px";
    css2dRender.domElement.style.pointerEvents = "none"; // 设置不能背选中
    container.appendChild(css2dRender.domElement); // 插入到容器当中
    return css2dRender;
  };
  /**
   * 创建2d标签
   * @param {*} name  标签内容
   * @param {*} className 标签class
   * @returns
   */
  const create2DTag = (name = "", className = "") => {
    const tag = document.createElement("div");
    // tag.innerHTML = name;
    tag.className = className;
    tag.style.pointerEvents = "none";
    tag.style.visibility = "hidden";
    tag.style.position = "absolute";
    // 如果className不存在，用以下样式
    if (!className) {
      tag.style.padding = "4px";
      tag.style.color = "#fff";
      tag.style.fontSize = "12px";
      tag.style.textAlign = "center";
      tag.style.background = "rgba(0,0,0,0.6)";
      // tag.style.borderRadius = "4px";
    }
    const label = new CSS2DObject(tag);
    /**
     * 标签初始化，
     * @param {*} name 显示内容
     * @param {*} point 显示坐标
     */
    label.init = (name, point) => {
      const labelWrap = document.createElement("div");
      labelWrap.innerHTML = name;
      labelWrap.style.color = "#fff";
      labelWrap.style.background = "rgba(198,195,195,0.6)";
      labelWrap.style.padding = "2px 4px";

      // const otherWrap = document.createElement("div");
      // otherWrap.innerHTML = "拼音或者上报情况";
      // otherWrap.style.color = "#fff";
      // otherWrap.style.padding = "2px 4px";

      // label.element.append(labelWrap, otherWrap);
      label.element.append(labelWrap);
      // label.element.style.visibility = "visible";
      label.element.style.display = "flex";
      label.position.copy(point);
    };
    /**
     * 隐藏
     */
    label.hide = () => {
      label.element.style.visibility = "hidden";
    };
    /**
     * 显示
     */
    label.show = () => {
      label.element.style.visibility = "visible";
    };
    return label;
  };

  // 递归遍历模型的所有子物体并设置每个子物体的aperturePosition
  function setAperturePositions(
    object,
    key = "aperturePosition",
    value,
    visited = new Set()
  ) {
    if (visited.has(object)) return; // 避免重复遍历
    visited.add(object); // 标记物体已访问

    if (object.isMesh) {
      // 如果是网格模型，则计算并设置aperturePosition
      if (value instanceof THREE.Vector3) {
        object[key] = value;
      } else if (value instanceof Array) {
        const position = new THREE.Vector3(...value);
        object[key] = position;
      }
    }

    // 递归遍历子物体,对象以及后代中执行的回调函数
    object.traverse((child) => {
      setAperturePositions(child, key, value, visited); // 遍历子物体
    });
  }

  async function addSplineObject(position, index) {
    let config = modelConfig[3];
    if (index || index === 0) {
      config = modelConfig[index % modelConfig.length];
    }

    const gltf = await loadGLTFModel(config.url);
    const model = gltf.scene; // 获取加载的模型对象
    model.castShadow = true; // 是否被渲染到阴影贴图中
    model.receiveShadow = true; // 是否接收阴影
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true; // 给每个 mesh 设置投射阴影
        child.receiveShadow = true; // 给每个 mesh 设置接收阴影
      }
    });
    setAperturePositions(model, "aperturePosition", config.position); // 设置 aperturePosition
    scene.add(model); // 将模型添加到场景中
    model.scale.set(config.scale, config.scale, config.scale);
    splineHelperObjects.push(model);

    if (position) {
      model.position.copy(position);
    } else {
      model.position.copy(config.position);
    }

    return model;

    // gltfLoader.load(
    //   config.url,
    //   function (gltf) {
    //     const model = gltf.scene; // 获取加载的模型对象
    //     model.castShadow = true; // 是否被渲染到阴影贴图中
    //     scene.add(model); // 将模型添加到场景中
    //     splineHelperObjects.push(model);

    //     if (position) {
    //       model.position.copy(position);
    //     } else {
    //       model.position.x = Math.random() * 1000 - 500;
    //       model.position.y = Math.random() * 500;
    //       model.position.z = Math.random() * 800 - 400;
    //     }
    //   },
    //   undefined,
    //   function (error) {
    //     console.error("Error loading GLB model:", error);
    //   }
    // );
  }

  // 创建底部光圈效果
  function createGlowEffect(position) {
    const geometry = new THREE.RingGeometry(24, 30, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide, // 设置材质为双面可见
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.set(position.x, position.y - 0.5, position.z); // 设置光圈的位置
    ring.rotation.x = -Math.PI / 2; // 使光圈平放
    scene.add(ring); // 将光圈添加到场景
    return ring;
  }

  // 增加点
  function addPoint() {
    splinePointsLength++;

    positions.push(addSplineObject().position);

    updateSplineOutline();

    // render();
  }

  // 删除点
  function removePoint() {
    if (splinePointsLength <= 4) {
      return;
    }

    const point = splineHelperObjects.pop();
    splinePointsLength--;
    positions.pop();

    if (transformControl.object === point) transformControl.detach();
    scene.remove(point);

    updateSplineOutline();

    // render();
  }

  // 更新曲线
  function updateSplineOutline() {
    for (const k in splines) {
      const spline = splines[k];

      const splineMesh = spline.mesh;
      const position = splineMesh.geometry.attributes.position;

      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1);
        spline.getPoint(t, point); // 获取样条曲线在t处的点,t表示样条曲线上的一个位置，0表示曲线的起点，1表示曲线的终点
        position.setXYZ(i, point.x, point.y, point.z); //  更新 position 属性中的第 i 个点的坐标
      }

      position.needsUpdate = true;
    }
  }

  function exportSpline() {
    const strplace = [];

    for (let i = 0; i < splinePointsLength; i++) {
      const p = splineHelperObjects[i].position;
      strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);
    }

    console.log(strplace.join(",\n")); // \t缩进
    const code = "[" + strplace.join(",\n\t") + "]";
    prompt("copy and paste code", code);
  }

  function load(new_positions) {
    while (new_positions.length > positions.length) {
      addPoint();
    }

    while (new_positions.length < positions.length) {
      removePoint();
    }

    for (let i = 0; i < positions.length; i++) {
      positions[i].copy(new_positions[i]);
    }

    updateSplineOutline();
  }

  // function render() {
  //   splines.uniform.mesh.visible = params.uniform;
  //   splines.centripetal.mesh.visible = params.centripetal;
  //   splines.chordal.mesh.visible = params.chordal;
  //   renderer.render(scene, camera);
  // }

  function animate(time) {
    requestAnimationFrame(animate);

    shaderMaterial && (shaderMaterial.uniforms.uTime.value = time * 0.001); // 将时间转换为秒

    if (splines.chordal) {
      splines.chordal.mesh.visible = params.chordal;
    }

    if (css2dRender) {
      css2dRender.render(scene, camera);
    }

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
  function onPointerMove(event) {
    // 获取 canvas 的边界矩形信息
    const rect = renderer.domElement.getBoundingClientRect();

    // 计算相对于 canvas 的归一化设备坐标，x 和 y 范围在 (-1, 1)
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 通过摄像机和归一化的坐标更新射线，参数1是标准化设备坐标中鼠标的二维坐标 —— X分量与Y分量应当在-1到1之间，参数2射线所来源的摄像机
    raycaster.setFromCamera(pointer, camera);

    // 计算物体和射线的焦点，参数2递归若为true，则同时也会检测所有物体的后代。否则将只会检测对象本身的相交部分。默认值为true。
    const intersects = raycaster.intersectObjects(splineHelperObjects, true);
    if (intersects.length > 0) {
      // const object = intersects[0].object;
      // // 获取选中物体的全局位置
      // const worldPosition = new THREE.Vector3();
      // object.getWorldPosition(worldPosition);
      // createGlowEffect(worldPosition);

      const object = intersects[0].object;
      if (ring) {
        destroyObject(ring);
      }
      ring = createGlowEffect(object.aperturePosition);

      // 在模型顶部显示文本标签
      if (textLabel) {
        destroyObject(textLabel);
      }
      const textPosition = new THREE.Vector3();
      textPosition.copy(object.aperturePosition);
      textPosition.y += 15;
      textLabel = createTextLabel(
        `流入：512G
        流出：466G`,
        textPosition
      );
      scene.add(textLabel); // 将文本标签添加到场景中
    }
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
      css2dRender = initCSS2DRender(
        {
          width: container.offsetWidth,
          height: container.offsetHeight,
        },
        container
      );

      scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xf0f0f0); // 设置场景背景颜色
      // 设置全景图
      textureLoader.load(
        background,
        // onLoad 回调
        (texture) => {
          scene.background = texture;
          scene.environment = texture;
          // render();
        },
        // onProgress 回调
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // onError 回调
        (error) => {
          console.error("An error occurred while loading the texture", error);
        }
      );

      camera = new THREE.PerspectiveCamera(
        70,
        container.offsetWidth / container.offsetHeight,
        1,
        10000
      );
      camera.position.set(0, 150, 150);
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
      const axes = new THREE.AxesHelper(800);
      scene.add(axes);

      // 创建网格
      // const helper = new THREE.GridHelper(2000, 100);
      // helper.position.y = -199;
      // helper.material.opacity = 0.25;
      // helper.material.transparent = true;
      // scene.add(helper);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.useLegacyLights = false;
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.damping = 0.2;
      // controls.addEventListener("change", render);

      /*******
       * Curves
       *********/
      // 生成 splinePointsLength 个位置随机的立方体
      for (let i = 0; i < splinePointsLength; i++) {
        await addSplineObject(positions[i], i);
      }

      // 置空
      positions.length = 0;

      // 更新
      for (let i = 0; i < splineHelperObjects.length; i++) {
        positions.push(splineHelperObjects[i].position);
      }

      const geometry = new THREE.BufferGeometry();
      // itemSize = 3 因为每个顶点都是一个三元组
      // 类型化数组（Typed Array）。它用于处理二进制数据缓冲区，其中每个元素都被视为 32 - bit（4 字节）的浮点数。每个元素的初始值为0
      // 生成200个顶点的缓冲几何体
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3)
      );

      let curve = new THREE.CatmullRomCurve3(positions);
      curve.curveType = "chordal"; // 蓝色
      // 创建自定义 ShaderMaterial
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0.0 },
          uColor1: { value: new THREE.Color(0xff0000) },
          uColor2: { value: new THREE.Color(0x0000ff) },
        },
        // 顶点着色器：计算每个顶点的流动位置 vFlow，通过 mod 和 uTime 实现循环效果。
        vertexShader: `
    uniform float uTime;
    varying float vFlow;
    void main() {
      vFlow = mod(-position.x + uTime * 10.0, 10.0) / 10.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
        // 片段着色器：根据 vFlow 混合两种颜色，创建流动的颜色变化效果
        fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying float vFlow;
    void main() {
      gl_FragColor = vec4(mix(uColor1, uColor2, vFlow), 1.0);
    }
  `,
        transparent: true,
      });
      curve.mesh = new THREE.Line(
        geometry.clone(),
        shaderMaterial
        // new THREE.LineBasicMaterial({
        //   color: 0x0000ff,
        //   opacity: 0.35,
        // })
      );
      curve.mesh.castShadow = true;
      splines.chordal = curve;

      for (const k in splines) {
        const spline = splines[k];
        scene.add(spline.mesh);
      }

      // 固定位置
      // load([
      //   new THREE.Vector3(100, 76, 56),
      //   new THREE.Vector3(50, 76, -14),
      //   new THREE.Vector3(-50, 76, -6),
      //   new THREE.Vector3(-100, 76, 47),
      // ]);

      updateSplineOutline();

      modelConfig.forEach((item) => {
        const label = create2DTag();
        scene.add(label);
        label.init(item.text, item.position);
        label.show();
      });

      function throttle(fn, delay) {
        let lastTime = 0;

        return function (...args) {
          const now = Date.now();
          if (now - lastTime >= delay) {
            lastTime = now;
            fn(...args);
          }
        };
      }

      //   事件监听
      window.addEventListener("resize", onWindowResize);
      eventBus.on("collapseChange", onWindowResize);
      document.addEventListener("dblclick", onWindowDblclick);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      document.addEventListener("pointermove", throttle(onPointerMove, 100));

      Prism.highlightAll();
    } catch (e) {
      console.log(e);
    }
  };

  //初始化
  onMounted(async () => {
    await init();
    // render();
    animate();
  });

  // 卸载
  onBeforeUnmount(() => {
    window.removeEventListener("resize", onWindowResize);
    eventBus.off("collapseChange", onWindowResize);
    document.removeEventListener("dblclick", onWindowDblclick);
    document.removeEventListener("fullscreenchange", onFullscreenChange);
    document.removeEventListener("fullscreenchange", onPointerMove);
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
