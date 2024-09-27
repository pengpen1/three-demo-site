<script setup>
import { ref } from "vue";
import useIndexServers from "@/servers/view/Index/useIndexServers.js";
import renderedJs from "@/servers/view/Index/useIndexServers.js?raw";

const containerRef = ref(null);
const { isShow, clickHandler, closeHandler, renderedMarkdown } =
  useIndexServers({ containerRef });
</script>

<template>
  <div class="index">
    <div>
      <!-- <p>(双击可进入全屏，效果更佳哦)</p> -->

      <div class="wrap">
        <div id="world" ref="containerRef"></div>
      </div>
    </div>

    <div :class="{ show: isShow, hide: !isShow, normal: true }">
      <h2>源码</h2>
      <pre><code class="language-javascript match-braces data-prismjs-copy">{{ renderedJs }}</code></pre>
      <h2>笔记</h2>
      <div style="text-align: left" v-html="renderedMarkdown"></div>
    </div>

    <Floating @close="closeHandler" :model="5" :second="2">
      <template v-slot:expand>
        <span class="text" @click="clickHandler">{{
          isShow ? "收起笔记" : "查看笔记"
        }}</span>
      </template>
      <template v-slot:collapse>
        <span @click="clickHandler" style="cursor: pointer"
          ><font-awesome-icon :icon="['fas', 'book']"
        /></span>
      </template>
    </Floating>
  </div>
</template>

<style scoped lang="scss">
.index {
  position: relative;
}
.show {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-color: #ffffff;
}
.hide {
  display: none;
}
.wrap {
  position: relative;
  width: 100%;
}
#world {
  width: 100%;
  height: calc(100vh - 40px);
  overflow: hidden;
}
.text {
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
  // margin: 0 auto; 这个也行，用flex的话需要加上100%，占满分配的空间
}
</style>
