import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { eventBus } from "@/utils";
import exampleMd from "@/servers/view/Photo/photo.md?raw";
import renderedJs from "@/servers/view/Photo/usePhotoServers.js?raw";
import renderedTemplate from "@/view/Photo.vue?raw";
import markdownIt from "markdown-it";
import Prism from "prismjs";

export default function usePhotoServers({ containerRef }) {
  // 相关变量
  var container;
  var camera, scene, renderer;
  var controls;

  var shaderUniforms;

  var particles = [];
  var particleSystem;

  var imageWidth = 1920;
  var imageHeight = 1080;
  var imageData = null;

  var animationTime = 0;
  var animationDelta = 0.03;

  const vertexShader = `
  uniform float amplitude;
  attribute vec3 vertexColor;
  varying vec4 varColor;

  void main() {
    varColor = vec4(vertexColor, 1.0);

    vec4 pos = vec4(position, 1.0);
    pos.z *= amplitude;

    vec4 mvPosition = modelViewMatrix * pos;

    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

  const fragmentShader = `
  varying vec4 varColor;

  void main() {
    gl_FragColor = varColor;
  }
`;

  function createScene() {
    container = document.getElementById("world");

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      20,
      container.offsetWidth / container.offsetHeight,
      1,
      10000
    );
    camera.position.z = 4000;
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 1);

    container.appendChild(renderer.domElement);
  }

  function createControls() {
    // 轨道控制器，使相机围绕目标进行轨道运动（旋转|缩放|平移）
    controls = new OrbitControls(camera, container);
    controls.maxPolarAngle = Math.PI; // 相机垂直旋转角度的上限
    controls.autoRotate = false; // 自动旋转
    controls.enableDamping = true; // 开启阻尼
  }

  function createPixelData() {
    var image = document.createElement("img");
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    image.crossOrigin = "Anonymous";
    image.onload = function () {
      image.width = canvas.width = imageWidth;
      image.height = canvas.height = imageHeight;
      console.log(image.height);

      context.fillStyle = context.createPattern(image, "no-repeat");
      context.fillRect(0, 0, imageWidth, imageHeight);

      imageData = context.getImageData(0, 0, imageWidth, imageHeight).data;

      createParticles();
      tick();
    };

    image.src =
      "https://cdn.jsdelivr.net/gh/pengpen1/blog-images/v2-340221b5186a86636cd3d17e355359b2_r.png";
    // image.src =
    //   "https://cdn.jsdelivr.net/gh/pengpen1/blog-images/cd2cd9b696a257c1e94c669c5c8e7a7.jpg";
  }

  function createParticles() {
    var colors = [];
    var weights = [0.2126, 0.7152, 0.0722];
    var c = 0;

    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(imageWidth * imageHeight * 3);
    var vertexColors = new Float32Array(imageWidth * imageHeight * 3);

    var x = imageWidth * -0.5;
    var y = imageHeight * 0.5;

    var zRange = 400;
    var index = 0;

    for (var i = 0; i < imageHeight; i++) {
      for (var j = 0; j < imageWidth; j++) {
        var r = imageData[c] / 255;
        var g = imageData[c + 1] / 255;
        var b = imageData[c + 2] / 255;

        var color = new THREE.Color(r, g, b);
        colors.push(color);

        var weight = r * weights[0] + g * weights[1] + b * weights[2];
        var z = zRange * -0.5 + zRange * weight;

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        vertexColors[index * 3] = r;
        vertexColors[index * 3 + 1] = g;
        vertexColors[index * 3 + 2] = b;

        index++;
        c += 4;
        x++;
      }
      x = imageWidth * -0.5;
      y--;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "vertexColor",
      new THREE.BufferAttribute(vertexColors, 3)
    );

    shaderUniforms = {
      amplitude: {
        value: 0.5,
      },
    };

    var shaderMaterial = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader,
      fragmentShader,
      vertexColors: true,
    });

    particleSystem = new THREE.Points(geometry, shaderMaterial);
    scene.add(particleSystem);
  }

  function tick() {
    requestAnimationFrame(tick);
    update();
    render();
  }

  function update() {
    shaderUniforms.amplitude.value = Math.sin(animationTime);
    animationTime += animationDelta;
    controls && controls.update();
  }

  function render() {
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
    // const md = new MarkdownIt();
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
      createScene();
      createControls();
      createPixelData();

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
    // 浏览器的本地全屏模式（F11）下面这个监听不到
    document.removeEventListener("fullscreenchange", onFullscreenChange);
    // 但是监听键盘点击事件也有问题，全屏模式下，浏览器的某些默认行为可能会覆盖事件监听器
    // 倒是可以用定时器判断 window.innerHeight === screen.height && window.innerWidth === screen.width
    // document.addEventListener("keydown", onKeyDownF11Change);
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
