<template>
  <template v-if="menu.children && menu.children.length">
    <el-sub-menu :index="menu.path" :show-timeout="0" :hide-timeout="0">
      <template #title>
        <font-awesome-icon :icon="menu.meta.icon ?? ['fas', 'splotch']" />
        <span class="title">{{ menu.meta.title }}</span>
      </template>

      <menu-item
        v-for="(item, key) in menu.children"
        :key="key"
        :menu="item"
      />
    </el-sub-menu>
  </template>

  <template v-else>
    <el-menu-item :index="menu.path" v-bind="menu.menuProps">
      <font-awesome-icon :icon="menu.meta.icon ?? ['fas', 'splotch']" />
      <template #title>
        <span class="title">{{ menu.meta.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup>
import MenuItem from "@/components/ui/MenuItem.vue";

// TODO:不支持相当路径
const props = defineProps({
  menu: {
    type: Object,
    default: () => ({}),
  },
});


</script>

<style scoped lang="scss">
.title {
  display: inline-block;
  margin-left: 8px;
}
</style>
