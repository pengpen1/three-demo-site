<template>
  <el-container>
    <nav-bar />
    <el-main><router-view></router-view></el-main>
  </el-container>
</template>

<script>
import { defineComponent } from "vue";
import NavBar from "./components/NavBar.vue";

export default defineComponent({
  components: {
    NavBar,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
