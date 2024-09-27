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
    <slot name="collapse" v-else> 折叠后显示的内容 </slot>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  defineEmits,
  defineProps,
  onBeforeUnmount,
  onMounted,
  defineExpose,
} from "vue";

// TODO：当前模式4只会触发一次，因为isHovered在鼠标移开后被设置为了false >>> 后续增加模式5，重复使用模式4
const props = defineProps({
  top: {
    type: Number,
    default: 100,
  },
  // 模式：
  // 1.默认模式，鼠标悬浮展开，移开折叠
  // 2.持久性展开模式
  // 3.持久性折叠模式
  // 4.单次-定时器缩小模式，先为展示模式，second秒后变为折叠模式(刚进入时触发)
  // 5.重复-定时器缩小模式，先为展示模式，second秒后变为折叠模式
  model: {
    type: Number,
    default: 1,
  },
  // 只有模式为4时生效
  second: Number,
});
const emit = defineEmits(["close"]);

const isShow = ref(true);
const isHovered = ref(props.model === 2 || props.model === 4);
const timer = ref(null);

const startTimer = () => {
  if ((props.model === 4 || props.model === 5) && props.second) {
    clearTimer();
    timer.value = setTimeout(() => {
      console.log("timer end");
      isHovered.value = false;
      timer.value = null;
      buttonStyle.value = getStyle();
    }, props.second * 1000);
  }
};

const clearTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value);
    timer.value = null;
  }
};

const getStyle = () => {
  switch (props.model) {
    case 2:
      isHovered.value = true;
      break;
    case 3:
      isHovered.value = false;
      break;
    default:
      break;
  }
  return {
    opacity: isHovered.value ? "1" : "0.5",
    //   transform: isHovered.value ? 'scale(1.2)' : 'scale(0.8)',
    width: isHovered.value ? "120px" : "24px",
    fontSize: isHovered.value ? "16px" : "12px",
    lineHeight: isHovered.value ? "16px" : "12px",
    padding: isHovered.value ? "8px 12px" : "2px 6px",
    justifyContent: isHovered.value ? "space-between" : "center",
    height: "20px",
    top: `${props.top}px`,
    right: "0px",
    position: "fixed",
    zIndex: "9999",
    transition: "all 0.3s",
  };
};
const buttonStyle = ref(getStyle());

const onMouseOver = () => {
  isHovered.value = true;
  buttonStyle.value = getStyle();

  if ((props.model === 4 || props.model === 5) && props.second) {
    console.log("onMouseOver: end timer");
    clearTimer(); // 鼠标悬浮时清除定时器
  }
};
const onMouseLeave = () => {
  isHovered.value = false;
  buttonStyle.value = getStyle();

  if ((props.model === 4 || props.model === 5) && props.second) {
    console.log("onMouseLeave: start timer");
    if (props.model === 5) {
      isHovered.value = true;
      buttonStyle.value = getStyle();
    }
    startTimer(); // 鼠标离开时重新启动定时器
  }
};
const clickCloseHandler = () => {
  isShow.value = false;
  emit("close");
};

onMounted(() => {
  if (props.model === 4 || props.model === 5) {
    isHovered.value = true;
    startTimer();
    // 确保在初始化时根据悬浮状态设置样式
    buttonStyle.value = getStyle();
  }
});
onBeforeUnmount(() => {
  clearTimer();
});

defineExpose({});
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
