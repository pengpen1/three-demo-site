import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { eventBus } from "@/utils";
import exampleMd from "@/servers/view/DataFlow/dataFlow.md?raw";
import renderedJs from "@/servers/view/DataFlow/useDataFlowServers.js?raw";
import renderedTemplate from "@/view/DataFlow.vue?raw";
import markdownIt from "markdown-it";
import Prism from "prismjs";

export default function useDataFlowServers({ containerRef }) {
  // 相关变量
  let container;
  let camera, scene, renderer;
  const splineHelperObjects = [];
  let splinePointsLength = 4;
  const positions = [];
  const point = new THREE.Vector3();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const onUpPosition = new THREE.Vector2();
  const onDownPosition = new THREE.Vector2();

  const geometry = new THREE.BoxGeometry(20, 20, 20);
  let transformControl;

  const ARC_SEGMENTS = 200;

  const splines = {};

  const params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline,
  };

  function addSplineObject(position) {
    const material = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
    });
    const object = new THREE.Mesh(geometry, material);

    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600;
      object.position.z = Math.random() * 800 - 400;
    }

    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    splineHelperObjects.push(object);
    return object;
  }

  function addPoint() {
    splinePointsLength++;

    positions.push(addSplineObject().position);

    updateSplineOutline();

    render();
  }

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

    render();
  }

  function updateSplineOutline() {
    for (const k in splines) {
      const spline = splines[k];

      const splineMesh = spline.mesh;
      const position = splineMesh.geometry.attributes.position;

      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1);
        spline.getPoint(t, point);
        position.setXYZ(i, point.x, point.y, point.z);
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

    console.log(strplace.join(",\n"));
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

  function render() {
    splines.uniform.mesh.visible = params.uniform;
    splines.centripetal.mesh.visible = params.centripetal;
    splines.chordal.mesh.visible = params.chordal;
    renderer.render(scene, camera);
  }

  function onPointerDown(event) {
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;
  }

  function onPointerUp(event) {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      transformControl.detach();
      render();
    }
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(splineHelperObjects, false);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (object !== transformControl.object) {
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
      scene.background = new THREE.Color(0xf0f0f0);

      camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.set(0, 250, 1000);
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
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      scene.add(light);

      const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
      planeGeometry.rotateX(-Math.PI / 2);
      const planeMaterial = new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: 0.2,
      });

      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.y = -200;
      plane.receiveShadow = true;
      scene.add(plane);

      const helper = new THREE.GridHelper(2000, 100);
      helper.position.y = -199;
      helper.material.opacity = 0.25;
      helper.material.transparent = true;
      scene.add(helper);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.useLegacyLights = false;
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      const gui = new GUI();

      gui.add(params, "uniform").onChange(render);
      gui
        .add(params, "tension", 0, 1)
        .step(0.01)
        .onChange(function (value) {
          splines.uniform.tension = value;
          updateSplineOutline();
          render();
        });
      gui.add(params, "centripetal").onChange(render);
      gui.add(params, "chordal").onChange(render);
      gui.add(params, "addPoint");
      gui.add(params, "removePoint");
      gui.add(params, "exportSpline");
      gui.open();

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.damping = 0.2;
      controls.addEventListener("change", render);

      transformControl = new TransformControls(camera, renderer.domElement);
      transformControl.addEventListener("change", render);
      transformControl.addEventListener("dragging-changed", function (event) {
        controls.enabled = !event.value;
      });
      scene.add(transformControl);

      transformControl.addEventListener("objectChange", function () {
        updateSplineOutline();
      });

      /*******
       * Curves
       *********/

      for (let i = 0; i < splinePointsLength; i++) {
        addSplineObject(positions[i]);
      }

      positions.length = 0;

      for (let i = 0; i < splinePointsLength; i++) {
        positions.push(splineHelperObjects[i].position);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3)
      );

      let curve = new THREE.CatmullRomCurve3(positions);
      curve.curveType = "catmullrom";
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0xff0000,
          opacity: 0.35,
        })
      );
      curve.mesh.castShadow = true;
      splines.uniform = curve;

      curve = new THREE.CatmullRomCurve3(positions);
      curve.curveType = "centripetal";
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0x00ff00,
          opacity: 0.35,
        })
      );
      curve.mesh.castShadow = true;
      splines.centripetal = curve;

      curve = new THREE.CatmullRomCurve3(positions);
      curve.curveType = "chordal";
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0x0000ff,
          opacity: 0.35,
        })
      );
      curve.mesh.castShadow = true;
      splines.chordal = curve;

      for (const k in splines) {
        const spline = splines[k];
        scene.add(spline.mesh);
      }

      load([
        new THREE.Vector3(
          289.76843686945404,
          452.51481137238443,
          56.10018915737797
        ),
        new THREE.Vector3(
          -53.56300074753207,
          171.49711742836848,
          -14.495472686253045
        ),
        new THREE.Vector3(
          -91.40118730204415,
          176.4306956436485,
          -6.958271935582161
        ),
        new THREE.Vector3(
          -383.785318791128,
          491.1365363371675,
          47.869296953772746
        ),
      ]);

      render();

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
  };
}
