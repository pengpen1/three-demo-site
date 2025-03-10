# Introduction

## What is WebGl?

- JavaScript API
- Renders triangles at a remarkable speed
- result can be drawn in a `canvas`
- Compatible with most modern browsers
- Uses the Graphic Processing Unit(GPU)



GPU 速度虽然比CPU稍慢，但可以进行数千次并行计算

定位点，绘制三角形，像素点着色，这些指令位于着色器内，像与GPU对话一样来定位物体并绘制颜色。但是这真的很难，于是出现了`three.js`，它大大简化了这一过程，作者是`Mr.doob`。

Three.js drastically simplify the process of all of this.Now the library is really stable.



Four elements：

- A scene that will contain objects
- Some objects
- A camera
- A renderer



The scene is like a container. You place your objects, models, particles, lights, etc. in it, and at some point, you ask Three.js to render that scene.

 A [Mesh](https://threejs.org/docs/#api/en/objects/Mesh) is the combination of a geometry (the shape) and a material (how it looks).

The camera is not visible. It's more like a theoretical point of view. When we will do a render of your scene, it will be from that camera's point of view.

You can have multiple cameras just like on a movie set, and you can switch between those cameras as you please. Usually, we only use one camera.





## Essay

1. GPU运行顶点着色器对于每个顶点都是并行的
2. 终端命令，pwd当前工作路径，ls列表



# Preparation

1. 安装`glsl-literal`扩展，高亮提示



# New vocabulary

1. stuff 东西
2. drastically 急剧的
3. simplify 简化
4. theoretical 理论

