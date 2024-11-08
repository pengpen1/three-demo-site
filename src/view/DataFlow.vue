<script setup>
import { ref } from "vue";
import useDataFlowServers from "@/servers/view/DataFlow/useDataFlowServers.js";

const containerRef = ref(null);
const {
  isShow,
  clickHandler,
  closeHandler,
  renderedMarkdown,
  noteProps,
  wrap,
} = useDataFlowServers({ containerRef });
</script>

<template>
  <div class="dataflow">
    <div>
      <!-- <p>(双击可进入全屏，效果更佳哦)</p> -->

      <div class="wrap" ref="wrap">
        <div id="container" ref="containerRef"></div>
      </div>
    </div>

    <Note v-bind="noteProps"></Note>

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
.dataflow {
  position: relative;
}
.wrap {
  position: relative;
  width: 100%;
}
#container {
  width: 100%;
  height: calc(100vh - 40px);
  overflow: hidden;
}
.text {
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
}
</style>
