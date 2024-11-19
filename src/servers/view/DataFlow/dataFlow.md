### 知识点

**1.样条曲线（Spline Curve）**

样条曲线是计算机图形学中常用的一种曲线，它可以通过一系列控制点来定义，并且可以平滑地连接这些点。



**2.归一化设备坐标**

在 WebGL 的渲染过程中，视口坐标通常以归一化设备坐标（NDC, Normalized Device Coordinates）表示，这种坐标范围是：

- **X 轴**：`-1`（左侧）到 `+1`（右侧）。
- **Y 轴**：`-1`（底部）到 `+1`（顶部）。

归一化设备坐标的原因：

1. **统一性**：使不同分辨率的设备都可以使用统一的坐标系。
2. **简化计算**：归一化后，所有坐标都可以直接映射到 WebGL 的裁剪空间，无需额外考虑设备的分辨率或视口大小。



**3.归一化坐标的计算过程，以全屏为例：**

以浏览器可视窗口的左上角 `(0, 0)` 为原点的绝对坐标，窗口宽度为 `window.innerWidth`，高度为 `window.innerHeight`。

鼠标事件的坐标为 `event.clientX` 和 `event.clientY`。

```js
pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
```

**公式解析：**

1. X 坐标归一化：
   - `event.clientX / window.innerWidth`：将鼠标的水平位置映射到 `[0, 1]`。
   - 乘以 `2` 后减去 `1`：将 `[0, 1]` 转换到 `[-1, 1]`。
2. Y 坐标归一化：
   - `event.clientY / window.innerHeight`：将鼠标的垂直位置映射到 `[0, 1]`。
   - 前面加负号：因为 WebGL 中 Y 轴的正方向是向上，而屏幕坐标的 Y 轴正方向是向下。WebGL 的裁剪空间 中，原点 (0, 0, 0) 是渲染区域的正中间，在这个空间中，所有顶点的坐标必须在范围 `[-1, 1]` 内。如果顶点的坐标超出这个范围，就会被裁剪。
   - 乘以 `2` 后加 `1`：将 `[0, 1]` 转换到 `[-1, 1]`。



### 代码讲解

本效果主要由样条曲线、 变换控制器、立方体构成。



**1.曲线实现**

`CatmullRomCurve3`本质上是一个数学算法的实现，用于根据给定的控制点（`positions`数组）计算出一条平滑的曲线。它基于 Catmull - Rom 样条曲线的数学原理，会在内部进行复杂的计算来确定曲线上的点的位置。要画出具体的线，我们可以先计算出点位，然后用`Line`画出来：

```js
const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -10, 0, 10 ),
	new THREE.Vector3( -5, 5, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 5, -5, 5 ),
	new THREE.Vector3( 10, 0, 10 )
] );

const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );

const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

const curveObject = new THREE.Line( geometry, material );
```

或者像本示例中一样，给曲线提供一个框架，并利用曲线计算出的点的位置信息来更新几何对象

```js
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
          color: 0xff0000,
          opacity: 0.35,
        })
      );
```



**2.数据流动效果实现**

理论上有三种方案：

- 设置虚线材质，LineDashedMaterial，在渲染循环中动态调整 dashOffset
- 材质LineBasicMaterial，使用有流动效果的贴图，在渲染循环中动态调整 offset
- 自定义着色器



代码中用的着色器，这里就精简下：

```js
// 创建TubeGeometry实现宽线条
const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.5, 8, false);
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uColor1: { value: new THREE.Color(0xff0000) },
    uColor2: { value: new THREE.Color(0x0000ff) },
  },
  vertexShader: `
    uniform float uTime;
    varying float vFlow;
    void main() {
      vFlow = mod(-position.x + uTime * 10.0, 10.0) / 10.0; // 反转流动方向
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
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
const tubeMesh = new THREE.Mesh(tubeGeometry, shaderMaterial);
scene.add(tubeMesh);

// 动画更新
function animate(deltaTime) {
  shaderMaterial.uniforms.uTime.value += deltaTime * 0.1; // 控制时间流逝速度
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate(0);
```



演示下第二种方案：

```js
// 假设你已经有一个three.js的场景、摄像机和渲染器初始化好了

// 1. 准备流动效果的纹理
const textureLoader = new THREE.TextureLoader();
const flowTexture = textureLoader.load('path/to/your/flow_texture.png'); // 替换为你的纹理路径

flowTexture.wrapS = THREE.RepeatWrapping; // 允许在 U 方向重复
flowTexture.wrapT = THREE.ClampToEdgeWrapping; // T 方向不重复
flowTexture.repeat.set(ARC_SEGMENTS / 10, 1); // 根据需要调整重复次数

// 2. 创建 BufferGeometry 并设置顶点位置和 UV 坐标
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(ARC_SEGMENTS * 3);
const uvs = new Float32Array(ARC_SEGMENTS * 2);

// 创建 CatmullRomCurve3
const curve = new THREE.CatmullRomCurve3(positionsArray);
curve.curveType = 'catmullrom'; // 可以选择 'centripetal', 'chordal', 'catmullrom'
const curvePoints = curve.getPoints(ARC_SEGMENTS);

// 设置顶点位置和 UV 坐标
for (let i = 0; i < curvePoints.length; i++) {
  positions[i * 3] = curvePoints[i].x;
  positions[i * 3 + 1] = curvePoints[i].y;
  positions[i * 3 + 2] = curvePoints[i].z;
  
  uvs[i * 2] = i / (curvePoints.length - 1); // U 坐标
  uvs[i * 2 + 1] = 0;                      // V 坐标（所有为 0）
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

// 3. 创建 LineBasicMaterial 并应用纹理
const material = new THREE.LineBasicMaterial({
  map: flowTexture,
  color: 0xffffff,       // 使用纹理的颜色
  transparent: true,
  opacity: 0.35
});

// 4. 创建 Line 并添加到场景中
const line = new THREE.Line(geometry, material);
line.castShadow = true;
scene.add(line);

// 5. 在渲染循环中动态调整纹理偏移
function animate(time) {
  requestAnimationFrame(animate);
  
  // 动态调整纹理的 offset，实现流动效果
  flowTexture.offset.x += 0.01; // 调整速度
  
  renderer.render(scene, camera);
}
animate();
```



**3.数据库贴图实现**

https://cloud.tencent.com/developer/article/2226685



### 衍生疑问

**1.如何使线条更粗**

https://threejs.org/examples/webgl_lines_fat.html

- **使用 THREE.TubeGeometry**
  用曲线生成一个管道形状，这样看起来就像更宽的线条。实现方法如下：

```js
const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.5, 8, false); // radius: 0.5
const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tubeMesh);
```



**2.数据流动方向控制**

现在主要是通过vFlow控制，从vFlow的计算公式就可以看出，我们可以反转时间或改变坐标轴的影响来调整方向

```js
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
```

```js
shaderMaterial.uniforms.uTime.value -= deltaTime; // 改为递减
```



**3.顶点着色器详解**

```js
uniform float uTime;  // 从 JavaScript 传递的时间变量，控制动画流动
varying float vFlow;  // 顶点到片段的变量，用于传递每个顶点的“流动”信息

void main() {
  vFlow = mod(position.x + uTime * 10.0, 10.0) / 10.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**uniform float uTime**
从外部传入的时间变量，控制流动动画。`uTime` 在 JavaScript 中通过 `shaderMaterial.uniforms.uTime.value` 更新。

**vec3** 表示一个包含三个浮点数的向量，常用于表示三维坐标、颜色（RGB）等。

**vec4** 表示一个包含四个浮点数的向量，常用于表示齐次坐标（x, y, z, w）或颜色（RGBA）。w：齐次坐标的分量，通常设为 `1.0` 表示标准化，在渲染管线的后续阶段，`w` 会用于透视除法来完成从裁剪空间到屏幕空间的映射。。

**varying float vFlow**
用于在顶点着色器和片段着色器之间传递数据。每个顶点计算的 `vFlow` 会插值到片段中。

**mod()**
取模运算，用于实现循环效果。例如 `mod(a, b)` 的结果是 `a` 除以 `b` 的余数。

**projectionMatrix 和 modelViewMatrix**

- `projectionMatrix`：投影矩阵，将三维坐标映射到屏幕坐标。
- `modelViewMatrix`：模型视图矩阵，描述对象在世界空间中的位置和方向。

**gl_Position**
最终计算每个顶点的位置，并将其传递给渲染管线，顶点着色器的必须输出变量，类型为 `vec4`。定义当前顶点在裁剪空间中的位置，供光栅化阶段使用。
如果未正确设置 `gl_Position`，渲染管线将无法知道顶点的位置，导致渲染失败。

**gl_FragColor**

片段着色器的可选输出变量，类型为 `vec4`。定义当前片段的颜色。在现代 OpenGL 或 WebGL 2.0 中，使用自定义输出（通过 `layout` 语法）逐渐取代 `gl_FragColor`，但在 WebGL 1.0 中仍然常用。

查看更多，可以去[官网](https://threejs.org/docs/index.html?q=ShaderMaterial#api/zh/materials/ShaderMaterial)、WebGL 1.0 规范、OpenGL ES 2.0 Shading Language

也可观看视频：https://www.youtube.com/watch?v=oKbCaj1J6EI