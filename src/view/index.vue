<script setup>
import { ref } from "vue";
import useIndexServers from "@/servers/view/Index/useIndexServers.js";

const containerRef = ref(null);
useIndexServers({ containerRef });
</script>

<template>
  <div class="index">
    <!-- <p>(双击可进入全屏，效果更佳哦；试试拖动鼠标吧)</p> -->

    <div class="wrap">
      <div id="world" ref="containerRef"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
body {
  overflow: hidden;
  margin: 0;
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
</style>
