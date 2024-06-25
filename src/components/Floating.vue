<template>
  <div
    v-if="isShow"
    class="floating-button"
    :style="buttonStyle"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <!-- 这里放置按钮的内容 -->
    <slot name="expand" v-if="isHovered"> 展开后显示内容 </slot>

    <!-- 尾部，关闭按钮 -->
    <div v-if="isHovered" class="floating-button-tail">
      <div class="vertical-line"></div>
      <font-awesome-icon
        class="close-icon"
        :icon="['fas', 'xmark']"
        @click="clickCloseHandler"
      />
    </div>
    <slot name="collapse" v-else> 笔记 </slot>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from "vue";

const emit = defineEmits(["close"]);

const isShow = ref(true);
const top = ref(100); // 初始位置
const isHovered = ref(false);

const buttonStyle = computed(() => {
  return {
    opacity: isHovered.value ? "1" : "0.5",
    //   transform: isHovered.value ? 'scale(1.2)' : 'scale(0.8)',
    width: isHovered.value ? "120px" : "24px",
    fontSize: isHovered.value ? "16px" : "12px",
    lineHeight: isHovered.value ? "16px" : "12px",
    padding: isHovered.value ? "8px 12px" : "2px 6px",
    justifyContent: isHovered.value ? "space-between" : "center",
    height: "20px",
    top: `${top.value}px`,
    right: "0px",
    position: "fixed",
    transition: "all 0.3s",
  };
});

const onMouseOver = () => {
  isHovered.value = true;
};
const onMouseLeave = () => {
  isHovered.value = false;
};
const clickCloseHandler = () => {
  isShow.value = false;
  emit("close");
};
</script>

<style scoped lang="scss">
.floating-button {
  background-color: #ff6600; /* 按钮的背景色 */
  padding: 8px 12px; /* 按钮的内边距 */
  border-radius: 5px; /* 按钮的圆角 */
  color: white; /* 按钮的文字颜色 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* 按钮的阴影 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}
.close-icon {
  padding: 4px;
  cursor: pointer;
  color: rgb(41, 40, 40);
  font-size: 16px;
  &:hover {
    color: #ffffff;
  }
}
.floating-button-tail {
  display: flex;
  align-items: center;
  margin-left: 8px;

  .vertical-line {
    width: 2px;
    height: 16px;
    background-color: rgb(41, 40, 40);
    margin-right: 6px;
  }
}
</style>
