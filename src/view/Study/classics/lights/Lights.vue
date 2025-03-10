<script setup>
import { ref } from "vue";
import useReadmeServers from "@/servers/view/Study/classics/lights/useLightsServers";

const { renderedMarkdown } = useReadmeServers();
</script>

<template>
  <div class="read-me">
    <div
      style="text-align: left"
      v-html="renderedMarkdown"
      class="markdown-body"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.read-me {
  position: relative;
  .markdown-body {
    min-width: 200px;
    max-width: 790px;
    margin: 0 auto;
    padding: 30px;
  }
}
</style>
