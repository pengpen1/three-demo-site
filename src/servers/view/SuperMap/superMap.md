### 知识点

**射线检测物体**

```js
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
    console.log(intersects);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      createGlowEffect(object.position);

      // 在模型顶部显示文本标签
      const textLabel = createTextLabel("Hello World!", object.position);
      scene.add(textLabel); // 将文本标签添加到场景中
      debugger;
    }
  }
```

这个检测得到的结果一直都是空数组，原因是当你检测的模型是 `group` 类型（即它包含了多个子物体），`group` 的 `position` 是相对于父物体的位置。如果你在 `intersectObjects` 中开启 `recursive`，则会递归检查子物体，因此返回的 `intersects` 中的 `object` 就会是某个子物体。这时，`position` 可能是 `(0,0,0)`，因为子物体的 `position` 可能是相对于父物体的局部坐标。

解决方案：需要获取物体的 **全局位置**，即包括父物体的变换后的位置。

总结：对 `group` 或其他包含子物体的对象进行射线检测时，必须通过递归（`recursive: true`）来确保子物体被检测。使用 `getWorldPosition()` 来获取物体在世界坐标系中的位置，而不是局部位置，避免因为父物体变换导致的坐标问题。



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


