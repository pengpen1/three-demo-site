import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
// import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
// import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";
import { eventBus } from "@/utils";
import exampleMd from "@/servers/view/Index/index.md?raw";
import markdownIt from "markdown-it";
import Prism from "prismjs";

export default function useIndexServers({ containerRef }) {
  // 相关变量
  let container, camera, scene, renderer, controls;
  let gu = {
    time: { value: 0 },
  };
  let sizes = [];
  let shift = [];
  let pushShift = () => {
    shift.push(
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2,
      (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
      Math.random() * 0.9 + 0.1
    );
  };
  let pts = new Array(50000).fill().map((p) => {
    sizes.push(Math.random() * 1.5 + 0.5);
    pushShift();
    return new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(Math.random() * 0.5 + 9.5);
  });
  for (let i = 0; i < 100000; i++) {
    let r = 10,
      R = 40;
    let rand = Math.pow(Math.random(), 1.5);
    let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
    pts.push(
      new THREE.Vector3().setFromCylindricalCoords(
        radius,
        Math.random() * 2 * Math.PI,
        (Math.random() - 0.5) * 2
      )
    );
    sizes.push(Math.random() * 1.5 + 0.5);
    pushShift();
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
        container.style.zIndex = 0; // 确保容器在最前面
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
        container.style.zIndex = 9; // 确保容器在最前面
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
      container.style.zIndex = 9; // 确保容器在最前面
    } else {
      // 如果退出全屏
      container.style.position = "relative";
      container.style.width = "100%";
      container.style.height = "calc(100vh - 40px)";
      container.style.zIndex = 0; // 还原zIndex
    }

    console.log(3, container.offsetWidth, container.offsetHeight);
    // 更新相机和渲染器设置
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

  function onKeyDownF11Change(event) {
    if (event.key === "F11") {
      console.log("F11 pressed");
      onFullscreenChange();
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
    // const md = new MarkdownIt();
    const md = markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    return md.render(exampleMd);
  });

  const init = async () => {
    try {
      container = containerRef.value || document.getElementById("world");
      const HEIGHT = container.offsetHeight;
      const WIDTH = container.offsetWidth;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x160016);
      camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 1000);
      camera.position.set(0, 4, 21);
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(WIDTH, HEIGHT);
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;

      let g = new THREE.BufferGeometry().setFromPoints(pts);
      g.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
      g.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));
      let m = new THREE.PointsMaterial({
        size: 0.125,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        onBeforeCompile: (shader) => {
          shader.uniforms.time = gu.time;
          shader.vertexShader = `
          uniform float time;
          attribute float sizes;
          attribute vec4 shift;
          varying vec3 vColor;
          ${shader.vertexShader}
        `
            .replace(`gl_PointSize = size;`, `gl_PointSize = size * sizes;`)
            .replace(
              `#include <color_vertex>`,
              `#include <color_vertex>
            float d = length(abs(position) / vec3(40., 10., 40));
            d = clamp(d, 0., 1.);
            vColor = mix(vec3(227., 155., 0.), vec3(100., 50., 255.), d) / 255.;
          `
            )
            .replace(
              `#include <begin_vertex>`,
              `#include <begin_vertex>
            float t = time;
            float moveT = mod(shift.x + shift.z * t, PI2);
            float moveS = mod(shift.y + shift.z * t, PI2);
            transformed += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.w;
          `
            );
          //console.log(shader.vertexShader);
          shader.fragmentShader = `
          varying vec3 vColor;
          ${shader.fragmentShader}
        `
            .replace(
              `#include <clipping_planes_fragment>`,
              `#include <clipping_planes_fragment>
            float d = length(gl_PointCoord.xy - 0.5);
            //if (d > 0.5) discard;
          `
            )
            .replace(
              `vec4 diffuseColor = vec4( diffuse, opacity );`,
              `vec4 diffuseColor = vec4( vColor, smoothstep(0.5, 0.1, d)/* * 0.5 + 0.5*/ );`
            );
          //console.log(shader.fragmentShader);
        },
      });
      let p = new THREE.Points(g, m);
      p.rotation.order = "ZYX";
      p.rotation.z = 0.2;
      scene.add(p);

      let clock = new THREE.Clock();

      renderer.setAnimationLoop(() => {
        controls.update();
        let t = clock.getElapsedTime() * 0.5;
        gu.time.value = t * Math.PI;
        p.rotation.y = t * 0.05;
        renderer.render(scene, camera);
      });

      window.addEventListener("resize", onWindowResize);
      eventBus.on("collapseChange", onWindowResize);
      document.addEventListener("dblclick", onWindowDblclick);
      document.addEventListener("fullscreenchange", onFullscreenChange); // 会在使用Fullscreen API时进入或退出全屏模式后触发
      // document.addEventListener("keydown", onKeyDownF11Change);

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
    // 浏览器的本地全屏模式（F11）下面这个监听不到
    document.removeEventListener("fullscreenchange", onFullscreenChange);
    // 但是监听键盘点击事件也有问题，全屏模式下，浏览器的某些默认行为可能会覆盖事件监听器
    // 倒是可以用定时器判断 window.innerHeight === screen.height && window.innerWidth === screen.width
    // document.addEventListener("keydown", onKeyDownF11Change);
  });

  return { clickHandler, closeHandler, isShow, exampleMd, renderedMarkdown };
}
