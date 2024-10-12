### 版本升级

博客中的[照片和粒子](https://pengpen1.github.io/3Dworld/particles/index)我使用的是**r62** 版本的three.js，版本过于老旧，影响性能，这里升级成 **r125** 版本，来看看有哪些改动吧。

- 将 `THREE.Geometry` 替换为 `THREE.BufferGeometry`（后者在性能和资源管理上具有更好的表现，特别是在处理 WebGL 渲染的时候）。
- 将 `THREE.ParticleSystem` 替换为 `THREE.Points`。
- 处理 `ShaderMaterial` 中的 `attributes`，新版本的 `THREE.ShaderMaterial` 中 `attributes` 不再直接定义在 `material` 中，而是通过 `BufferGeometry` 来管理数据。



### 代码讲解

TODO