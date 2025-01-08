import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { eventBus, getAssetUrl } from "@/utils";
import exampleMd from "@/servers/view/DataFlow/dataFlow.md?raw";
import renderedJs from "@/servers/view/DataFlow/useDataFlowServers.js?raw";
import renderedTemplate from "@/view/DataFlow.vue?raw";
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
  let container;
  let camera, scene, renderer;
  const splineHelperObjects = [];
  let splinePointsLength = 4;
  const positions = [];
  const point = new THREE.Vector3();

  const raycaster = new THREE.Raycaster(); // 光线投射
  const pointer = new THREE.Vector2();
  const onUpPosition = new THREE.Vector2();
  const onDownPosition = new THREE.Vector2();

  const geometry = new THREE.BoxGeometry(20, 20, 20);
  let lineDashedMaterial = null;
  let shaderMaterial = null;
  let transformControl;

  const ARC_SEGMENTS = 200;

  const splines = {};

  const params = {
    uniform: false,
    tension: 0.5,
    centripetal: false,
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

  function addSplineObject(position, index) {
    let material = null;
    if (index) {
      material = new THREE.MeshBasicMaterial({
        map: textureMap[index], // 纹理贴图
      });
    } else {
      material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff,
      });
    }

    const multiple = Math.random() * 4 + 1;
    const geometryTemp = geometry.clone().scale(multiple, multiple, multiple);
    const object = new THREE.Mesh(geometryTemp, material);

    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 500;
      object.position.z = Math.random() * 800 - 400;
    }

    object.castShadow = true; // 是否被渲染到阴影贴图中
    object.receiveShadow = true; // 材质是否接收阴影
    scene.add(object);
    splineHelperObjects.push(object);
    return object;

    // gltfLoader.load('/glb/dataFlow/database.glb', function (gltf) {
    //   const model = gltf.scene;  // 获取加载的模型对象
    //   scene.add(model);  // 将模型添加到场景中

    // if (position) {
    //   model.position.copy(position);
    // } else {
    //   model.position.x = Math.random() * 1000 - 500;
    //   model.position.y = Math.random() * 500;
    //   model.position.z = Math.random() * 800 - 400;
    // }
    // }, undefined, function (error) {
    //   console.error('Error loading GLB model:', error);
    // });
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

    // 动态调整 dashOffset 使虚线看起来在移动，but没有成功
    lineDashedMaterial && (lineDashedMaterial.dashOffset -= 0.1); // 调整速度
    // 着色器成功了
    shaderMaterial && (shaderMaterial.uniforms.uTime.value = time * 0.001); // 将时间转换为秒

    splines.uniform.mesh.visible = params.uniform;
    splines.centripetal.mesh.visible = params.centripetal;
    splines.chordal.mesh.visible = params.chordal;
    renderer.render(scene, camera);
  }

  function onPointerDown(event) {
    console.log("onPointerDown", container.offsetWidth, container.offsetHeight);
    // 相对于浏览器的可视区域（即视口）的位置，不受页面滚动影响
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;
  }

  function onPointerUp(event) {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    // 实现单击取消控制器
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      transformControl.detach();
      // render();
    }
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
    const intersects = raycaster.intersectObjects(splineHelperObjects, false);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (object !== transformControl.object) {
        // 变换控制器的对象只会存在一个
        transformControl.attach(object);
      }
    }
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
      camera.position.set(0, 550, 800);
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

      const gui = new GUI();

      // gui.add(params, "uniform").onChange(render);
      gui
        .add(params, "tension", 0, 1)
        .step(0.01)
        .onChange(function (value) {
          splines.uniform.tension = value;
          updateSplineOutline();
          // render();
        });
      // gui.add(params, "centripetal").onChange(render);
      // gui.add(params, "chordal").onChange(render);
      gui.add(params, "addPoint");
      gui.add(params, "removePoint");
      gui.add(params, "exportSpline");
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "0px";
      gui.domElement.style.left = "0px";
      gui.domElement.style.zIndex = "9999";
      container.appendChild(gui.domElement);
      gui.open();

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.damping = 0.2;
      // controls.addEventListener("change", render);

      transformControl = new TransformControls(camera, renderer.domElement);
      // transformControl.addEventListener("change", render);
      transformControl.addEventListener("dragging-changed", function (event) {
        console.log("dragging-changed", event.value);
        // 防止在拖动时更新摄像机位置
        controls.enabled = !event.value;
      });
      scene.add(transformControl);

      transformControl.addEventListener("objectChange", function () {
        updateSplineOutline();
      });

      /*******
       * Curves
       *********/
      // 生成 splinePointsLength 个位置随机的立方体
      for (let i = 0; i < splinePointsLength; i++) {
        addSplineObject(positions[i], i + 1);
      }

      // 置空
      positions.length = 0;

      // 更新
      for (let i = 0; i < splinePointsLength; i++) {
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
      curve.curveType = "catmullrom"; // 曲线类型:centripetal（向心参数化）弯曲较小，曲线更加平滑和稳定 |catmullrom（均匀参数化）较为敏感，可能不平滑 | chordal（弦参数化）弯曲较大，曲线更加尖锐和动态
      //  geometry提供了一个框架，告诉渲染器需要处理多少个顶点以及它们的基本属性（如每个顶点有三个坐标分量）
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0xff0000, // 红色
          opacity: 0.35,
        })
      );
      curve.mesh.castShadow = true;
      splines.uniform = curve;

      curve = new THREE.CatmullRomCurve3(positions);
      curve.curveType = "centripetal"; // 绿色
      lineDashedMaterial = new THREE.LineDashedMaterial({
        color: 0x00ff00, // 绿色
        dashSize: 15, // 虚线长度
        gapSize: 10, // 虚线间隙
        linewidth: 5, // 线宽（注意：在大多数平台上，WebGL 不支持 linewidth > 1）
        opacity: 1,
        transparent: true,
      });
      curve.mesh = new THREE.Line(geometry.clone(), lineDashedMaterial);
      curve.mesh.castShadow = true;
      splines.centripetal = curve;

      curve = new THREE.CatmullRomCurve3(positions);
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
      //   new THREE.Vector3(
      //     289.76843686945404,
      //     452.51481137238443,
      //     56.10018915737797
      //   ),
      //   new THREE.Vector3(
      //     -53.56300074753207,
      //     171.49711742836848,
      //     -14.495472686253045
      //   ),
      //   new THREE.Vector3(
      //     -91.40118730204415,
      //     176.4306956436485,
      //     -6.958271935582161
      //   ),
      //   new THREE.Vector3(
      //     -383.785318791128,
      //     491.1365363371675,
      //     47.869296953772746
      //   ),
      // ]);

      // 随机位置
      updateSplineOutline();

      //   事件监听
      window.addEventListener("resize", onWindowResize);
      eventBus.on("collapseChange", onWindowResize);
      document.addEventListener("dblclick", onWindowDblclick);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      // 拖动事件
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointermove", onPointerMove);

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
