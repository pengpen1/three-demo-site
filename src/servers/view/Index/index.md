**概要：**因为要学习three.js，又不能总拿公司的项目当实验场所，索性就新起个项目当作演示场，这里顺便记录下步骤。



### 创建项目

本次技术选型准备采用最新版本的vue3、vite、element-plus

```shell
npm init vite@latest
```

执行该命令后，系统会询问一些问题，如项目名称、使用的框架（选择 Vue）、是否使用 TypeScript 等

![](https://cdn.jsdelivr.net/gh/pengpen1/blog-images/20240618140009.png)

然后试试项目能否跑起来，没问题的话，删除脚手架默认提供的页面组件，并按照自己的架构设计创建文件夹，最后把README.md文件加上：

![](https://cdn.jsdelivr.net/gh/pengpen1/blog-images/20240618140249.png)

然后我们在GitHub或者其他远程托管仓库中简历新仓库

![](https://cdn.jsdelivr.net/gh/pengpen1/blog-images/20240618135440.png)

然后用git命令初始化一下我们的项目、添加暂存区、提交、重命名主分支(有些版本默认是master)、设置远程仓库地址、推送到远程仓库

```shell
git init
git add .
git commit -m "[init]初始化项目结构"
git branch -M main
git remote add origin https://github.com/pengpen1/three-demo-site.git
git push -u origin main
```

然后在GitHub刷新一下就能看到我们新建的项目啦

![](https://cdn.jsdelivr.net/gh/pengpen1/blog-images/20240619102818.png)



### 问题记录

**1.使用element-plus提供的布局组件进行布局时，右边出现意料之外的滚动条**

这个问题的原因是在初始化css中，对body加了10的padding，导致高度溢出造成的。在我手写布局的时候，发现一个有趣的问题，如下：

```vue
  <!-- <el-container>
    <nav-bar />
    <el-main><router-view></router-view></el-main>
  </el-container> -->

  <!-- 手写布局 -->
  <div class="container">
      <nav-bar />
    <section class="main-container">
      <router-view></router-view>
    </section>
  </div>
```

项目布局是一样的，父容器加上`display: flex;`，左子容器固定宽度，右子容器` flex: 1;`，理想中应该是就算在子容器的宽度发生变化，右子容器的宽度也应该是自适应的，也就是填充剩余的宽度。但是只有el-main成功，手写宽度没有任何变化。

然后我对比与el-main样式上的区别，发现是这个属性造成的这种现象：`overflow: auto;`，查了一下，是因为加 `overflow: auto` 后，`.main-container` 会触发 BFC，BFC除了可以清除浮动，还对布局有影响，调整一个元素的尺寸（比如 `nav-bar` 的宽度），其他 flex 子元素会正确地重新计算和调整大小。



### 项目展示

![](https://cdn.jsdelivr.net/gh/pengpen1/blog-images/20240620093606.png)

[项目地址](https://github.com/pengpen1/three-demo-site)


