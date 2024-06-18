<template>
  <el-aside width="auto" :style="{ width: isCollapsed ? '64px' : '140px' }">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      :collapse="isCollapsed"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :router="true"
    >
      <el-menu-item index="/">
        <el-icon><House /></el-icon>
        <span slot="title"> 首页 </span>
      </el-menu-item>
      <el-menu-item index="/test">
        <el-icon><Clock /></el-icon>
        <span slot="title">测试 </span>
      </el-menu-item>
    </el-menu>

    <el-button link @click="toggleCollapse" class="collapse-button">
      <el-icon color="#fff">
        <ArrowRight v-if="isCollapsed" />
        <ArrowLeft v-else />
      </el-icon>
    </el-button>
  </el-aside>
</template>

<script setup>
import { ref , computed} from "vue";
import { routes } from "../router";

const activeIndex = ref("/");
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
const menus = computed(() => routes)
</script>

<style scoped lang="scss">
.el-aside {
  overflow: hidden;
  position: relative;
}
.el-menu-vertical {
  height: 100vh;
}
.collapse-button{
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.3s;
}
</style>
