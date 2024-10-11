<template>
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
</template>

<script>
import { defineComponent } from "vue";
import NavBar from "./components/ui/NavBar.vue";

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

.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
}
.main-container {
  flex: 1;
  flex-basis: auto;
  display: block;
  box-sizing: border-box;
  /* overflow: auto不加会影响自适应 */
  overflow: auto;
  background-color: #f5f5f5;
  padding: 20px;
  height: 100%;
  /* border-left: 1px solid #eaeaea; */
}
</style>
