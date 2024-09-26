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
    <div v-show="!isShow">
      <!-- <p>(双击可进入全屏，效果更佳哦)</p> -->

      <div class="wrap">
        <div id="world" ref="containerRef"></div>
      </div>
    </div>

    <div  v-show="isShow">
      <h2>源码</h2>
      <pre><code class="language-javascript match-braces data-prismjs-copy">{{ renderedJs }}</code></pre>
      <h2>笔记</h2>
      <div style="text-align: left" v-html="renderedMarkdown"></div>
    </div>

    <Floating @close="closeHandler">
      <template v-slot:expand>
        <span class="text" @click="clickHandler">查看笔记</span>
      </template>
      <template v-slot:collapse>
        <span><font-awesome-icon :icon="['fas', 'book']" /></span>
      </template>
    </Floating>
  </div>
</template>

<style scoped lang="scss">
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
