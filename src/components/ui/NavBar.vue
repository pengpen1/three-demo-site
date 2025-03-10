<template>
  <el-aside width="auto" :style="{ width: isCollapsed ? '64px' : '200px' }">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      :collapse="isCollapsed"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :router="true"
    >
      <MenuItem v-for="menu in menus" :key="menu.name" :menu="menu"> </MenuItem>
    </el-menu>

    <el-button link @click="toggleCollapse" class="collapse-button">
      <el-icon>
        <ArrowRight v-if="isCollapsed" />
        <ArrowLeft v-else />
      </el-icon>
    </el-button>
  </el-aside>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watchEffect } from "vue";
import { routes } from "../../router";
import router from "../../router";
import { eventBus } from "@/utils";
import MenuItem from "@/components/ui/MenuItem.vue";

const activeIndex = ref("/");
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  nextTick(() => {
    eventBus.emit("collapseChange", isCollapsed.value);
  });
};
const menus = computed(() => {
  return routes.filter((item) => {
    return !item.meta.hide;
  });
});

watchEffect(() => {
  // TODO: 这里需要优化，调查为什么会先到"/"，再跳到实际路由
  activeIndex.value = router.currentRoute.value.path || "/";
});
</script>

<style scoped lang="scss">
.el-aside {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
.el-menu-vertical {
  height: 100%;
}
.collapse-button {
  position: fixed;
  z-index: 10;
  bottom: 10px;
  // left: 50%;
  transform: translateX(-50%);
  color: #fff !important;
  // transition: all 0.3s;
  &:hover {
    color: #30bfd8 !important;
  }
}
</style>
