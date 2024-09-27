<script setup>
import { ref } from "vue";
import useReadmeServers from "@/servers/view/Readme/useReadmeServers.js";

const { renderedMarkdown } = useReadmeServers();
</script>

<template>
  <div class="read-me">
    <div style="text-align: left" v-html="renderedMarkdown"></div>
  </div>
</template>

<style scoped lang="scss">
.read-me {
  position: relative;
}
</style>
