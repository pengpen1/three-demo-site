<template>
  <div
    v-if="isShow"
    class="floating-button"
    :style="buttonStyle"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <!-- 这里放置按钮的内容 -->
    <slot name="expand" v-if="isHovered"> 展开后显示内容 </slot>

    <!-- 尾部，关闭按钮 -->
    <div v-if="isHovered" class="floating-button-tail">
      <div class="vertical-line"></div>
      <font-awesome-icon class="close-icon" :icon="['fas', 'xmark']" />
    </div>
    <slot name="collapse" v-else> 笔记 </slot>
  </div>
</template>

<script setup>
// TODO: 拖拽功能
// TODO: 附加功能功能
import { ref, computed, defineEmits } from "vue";

const emit = defineEmits(["close"]);

const isShow = ref(true);
const top = ref(100); // 初始位置
const isHovered = ref(false);
const isDragging = ref(false);
const startY = ref(0);
const startTop = ref(0);

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
    zIndex: "9999",
    transition: "all 0.3s",
    cursor: isDragging.value ? "grabbing" : "grab",
  };
});

const onMouseOver = () => {
  isHovered.value = true;
};
const onMouseLeave = () => {
  if (!isDragging.value) {
    isHovered.value = false;
  }
};
const onMouseDown = (event) => {
  console.log("onMouseDown", event.target.tagName);
  // 因为做点击事件会触发MouseDown，从而导致意外情况，所以直接在MouseDown中判断是否是点击事件
  // 除了这样做还可以增加@mousedown.stop来阻止事件冒泡，防止父级元素触发鼠标事件
  if (event.target.tagName === "path" || event.target.tagName === "svg") {
    clickCloseHandle();
  }
  isDragging.value = true;
  startY.value = event.clientY;
  startTop.value = top.value;
};
const onMouseUp = () => {
  console.log("onMouseUp");
  isDragging.value = false;
  isHovered.value = false;
};
const onMouseMove = (event) => {
  if (isDragging.value) {
    const deltaY = event.clientY - startY.value;
    top.value = startTop.value + deltaY;
  }
};
const clickCloseHandle = () => {
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
