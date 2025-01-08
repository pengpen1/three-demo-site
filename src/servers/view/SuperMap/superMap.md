### 知识点

更多基础知识可以移步到我的博客[查看](https://pengpen1.github.io/2024/03/28/three.js-3D%E5%9C%B0%E5%9B%BE(%E4%B8%80))

```js
camera.up.set(0, 0, 1); // 设置相机上方向为z轴
```

这样在对于地图这样需要用z轴表示高度的场景，就方便观察，默认情况是y轴向上，z轴对着屏幕。



- [x] 优化追尾效果

```js
          // 方案2.2
          const segmentLength = 200; // 每次绘制500个点

          // 计算当前应该显示到哪个点
          let currentPoints = [];
          for (let i = 0; i < segmentLength; i++) {
            // 计算索引，如果超过点集的长度则从前面取
            let pointIndex =
              (ChinaOutlineParams.lineProgress + i) %
              ChinaOutlineParams.Vector3Lines.length;
            currentPoints.push(ChinaOutlineParams.Vector3Lines[pointIndex]);
          }

          ChinaOutlineParams.lineProgress =
            (ChinaOutlineParams.lineProgress + 3) %
            ChinaOutlineParams.Vector3Lines.length; // 每次更新时索引增加，超过点集长度则从0重新开始

          // 更新几何体的顶点数据
          ChinaOutlineParams.topGeometry.setFromPoints(currentPoints);
```

先得到轮廓的点位数据，再用一个变量记录索引，每次requestAnimationFrame中自增，然后通过索引和指定绘制数量完成追光效果



- [x] 鼠标悬浮高亮

为什么有些区域无法获取？

并不是区域无法获取，而是数据的原因，有些一个区有三个多边形，我们在赋值map.adcode时，就只赋值了一个多边形的区域



- [x] 下钻到区级

自定义区？？https://datav.aliyun.com/portal/school/atlas/area_selector?spm=a2crr.23498931.0.0.4ad815ddHMMHNH



- [ ] line2追光

```
    coordinates[0].forEach((rows) => {
      // createVector3(rows, ChinaOutlineParams.Vector3Lines, "line1");
      createVector3(rows, ChinaOutlineParams.Vector3Lines);
    });

    // 顶部亮线条
    const topLineMaterial = new LineMaterial({
      color: 0xffffff, // 可以调整为动态变化的颜色
      opacity: 1, // 透明度
      transparent: true, // 使线段半透明
      linewidth: 0.0025,
    });

    ChinaOutlineParams.topGeometry = new LineGeometry();
    ChinaOutlineParams.topGeometry.setPositions(
      ChinaOutlineParams.Vector3Lines
    );
    ChinaOutlineParams.topLineMesh = new Line2(
      ChinaOutlineParams.topGeometry,
      topLineMaterial
    );

    ChinaOutlineParams.topLineMesh.computeLineDistances();
```



- [ ] CatmullRomCurve3 处理线条，别太坚硬
- [ ] 动画效果
- [ ] 封装地图皮肤



学到的技巧：

- three里面文字是贴图，将文字生成ttf格式的文件，用three的ttf加载工具加载进来，以贴图的方式放到地图上。
- renderOrder，设置一个较高的渲染顺序，防止弹框被标牌等物体遮挡住
- 动画结束在渲染，太重要了，找了半小时的错，就是因为动画之前塞进去了undefined，然后后面在设置就出问题了
- 要注意controls的中心点，会覆盖camera的lookAt，导致动画出现的时候是正确的，动画结束给闪过去了。。。



```js
      function render() {
        if (ChinaOutlineParams.topGeometry && animationEnd) {
            。。。
            ChinaOutlineParams.topGeometry.setFromPoints(currentPoints);
        }
```

css2，标签不随场景缩放进行变化，css3随场景缩放进行变化

BufferGeometry



### 下钻思路

我得封装个初始化的函数、根据code获取点位数据的函数

双击检测点位，存在就拿到code，然后重新初始化，这里要注意清除dom、清除射线检测的数组、还有些动画要特殊处理，如追光效果，他会重新绘制





### 衍生疑问

**1.关于聚光灯无法显示问题**

如果代码一样，但是场景中确并未出现聚光灯，多半就是版本问题，下面演示下0.136.0版本和0.165.0版本的区别

```js
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
          this.addObject(spotLight);
```



```js
      let lineMaterial = new THREE.LineBasicMaterial({
        color: 0x1af0ff, // 可以调整为动态变化的颜色
        linewidth: 2, // 线宽
        opacity: 0.8, // 透明度
        transparent: true, // 使线段半透明
      });

      // 生成线段几何体
      let geometry = new THREE.BufferGeometry().setFromPoints(
        ChinaOutlineParams.lines
      );

      // 创建线条
      ChinaOutlineParams.line = new THREE.Line(geometry, lineMaterial);
      scene.add(ChinaOutlineParams.line);

      ChinaOutlineParams.line.position.set(0, 0, 1.01);
      ChinaOutlineParams.line.rotation.set(0, Math.PI, Math.PI);
```



**2.调查position为0.0.0？？**



**3.线宽？**

要升级版本



**4.动画会瞬移问题**

我们现在的动画：

```js
          gsap
            .to(this.camera.position, {
              x: target.x, // 相机目标 x 坐标
              y: target.y, // 相机目标 y 坐标
              z: target.z, // 相机目标 z 坐标
              delay: 0.3, // 延迟一定时间后开始动画
              duration: 2, // 动画持续时间
              ease: "power2.inOut", // 缓动函数
              onUpdate: () => {
                this.camera.lookAt(targetLookAt);
              },
            })
            .then(() => {
              animationEnd = true;
            });
```

相当于慢慢移动位置，然后lookAt一直不变，但是再开始动画时，我们改变了lookAt，这会导致有一瞬间的瞬移

最后，我在初始化模型那，加了判断，直接改变相机的初始lookAt，这样在物体还没被放到场景里面前就改变了lookAt，就不会有瞬移效果了。

```js
            if (modelLevel === 2 && currentConfig) {
              currentConfig.cameraSite = [
                earthGroupBound.center.x,
                earthGroupBound.center.y,
                earthGroupBound.center.z,
              ];
              this.camera.lookAt(
                new THREE.Vector3(...currentConfig.cameraSite)
              );
            } else {
              this.camera.position.set(102.49, 11.97, 22.95);
              this.camera.lookAt(new THREE.Vector3(...centerXY, 0));
            }
```

如果你还想要加上控制器，则必须同时更新控制器的中心：

```js
            // 使用 GSAP 控制相机位置变化
            gsap
              .to(this.camera.position, {
                x: target.x, // 相机目标 x 坐标
                y: target.y, // 相机目标 y 坐标
                z: target.z, // 相机目标 z 坐标
                delay: 0.3, // 延迟一定时间后开始动画
                duration: 2, // 动画持续时间
                ease: "power2.inOut", // 缓动函数
                onUpdate: () => {
                  this.camera.lookAt(targetLookAt);
                  if (this.options.controls.visibel) {
                    this.controls.target = targetLookAt;
                  }
                },
              })
              .then(() => {
                animationEnd = true;
              });
```





**5.追光越来越快问题**

```js
      // 下一次重绘之前调用，如果就放在这的话，会一直调用，导致速度越来越快
      // requestAnimationFrame(render);
```

因为每次重新初始化追光，都调用了 requestAnimationFrame，导致回调列表里面一直在增加