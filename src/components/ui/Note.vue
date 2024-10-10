<template>
  <div class="note" :style="style">
    <!-- 章节菜单 -->
    <div v-if="data.length" class="menu-wrap">
      <div
        v-for="item in data"
        :key="item.id"
        :class="{ 'menu-item': true, 'menu-item-active': item.id === activeId }"
        @click="scrollTo(item.id)"
      >
        <div class="menu-item-title">{{ item.title }}</div>
      </div>
    </div>
    <el-scrollbar
      class="scrollbar"
      id="scrollArea"
      ref="container"
      @scroll="updateScroll"
    >
      <template v-if="data.length">
        <div
          v-for="item in data"
          :key="item.id"
          class="note-item"
          :id="`wrap` + item.id"
        >
          <h2 :id="`title` + item.id">{{ item.title }}</h2>
          <template v-if="item.type === 'html'">
            <div style="text-align: left" v-html="item.content"></div>
          </template>
          <template v-else-if="item.type === 'code:js'">
            <!-- match-braces:括号匹配 -->
            <pre><code class="language-javascript match-braces data-prismjs-copy">{{ item.content }}</code></pre>
          </template>
          <template v-else-if="item.type === 'code:vue'">
            <pre><code class="language-javascript match-braces data-prismjs-copy">{{ item.content }}</code></pre>
          </template>
          <template v-else>
            <div>{{ item.content }}</div>
          </template>
        </div>
      </template>
      <template v-else>
        <h2>暂无数据</h2>
      </template>
    </el-scrollbar>
    <el-backtop
      target=".note .el-scrollbar__wrap"
      :right="100"
      :visibility-height="50"
      :bottom="100"
    />
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
  watch,
  nextTick,
} from "vue";
import Prism from "prismjs";

// TODO：完善章节菜单功能
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: Array,
});
const emit = defineEmits([]);
const activeId = ref(0);
const observer = ref(null);
const container = ref(null);
const notes = ref(null);

const style = computed(() => {
  if (!props.visible) return { display: "none" };
  return {
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    "z-index": 10,
    "background-color": "#ffffff",
  };
});

const scrollTo = (id) => {
  activeId.value = id;
  const chapter = document.querySelector(`#title${id}`);
  chapter && chapter.scrollIntoView({ behavior: "instant" }); // instant | smooth
};
watch(
  () => props.visible,
  () => {
    if (props.visible) {
      nextTick(() => {
        notes.value = document.querySelectorAll(".note-item");
      });
    }
  }
);

const updateScroll = ({ scrollTop }) => {
  notes.value.forEach((sec) => {
    // let top = content.value.scrollTop; // Window.scrollY返回文档在垂直方向已滚动的像素值 e.scrollTop
    let offset = sec.offsetTop - 150; // 返回当前元素相对于其 offsetParent 元素的顶部内边距的距离
    let height = sec.offsetHeight; // 返回该元素的像素高度，高度包含该元素的垂直内边距和边框，且是一个整数
    console.log(scrollTop, offset, height);
    let id = sec.getAttribute("id").replace("wrap", "");

    if (scrollTop >= offset && scrollTop < offset + height) {
      activeId.value = Number(id);
      console.log("activeId", activeId.value);
    }
  });
};

onMounted(() => {
  // Prism.js 通常在页面加载时对代码块进行高亮，而通过 Vue 的动态渲染（如 v-for）或 v-html 渲染内容时
  // Prism.js 可能不会检测到这些新的代码块，所以手动调用渲染样式
  Prism.highlightAll();
  if (props.data.length) {
    scrollTo(props.data[0].id);
  }

  const options = {
    root: document.querySelector("#scrollArea.scrollbar"), // 视口
    rootMargin: "0px",
    threshold: 0.5, // 章节可见度阈值，达到50%时执行
  };

  // 方案1：使用交叉观察器
  // observer.value = new IntersectionObserver((entries) => {
  //   entries.forEach((entry) => {
  //     // entry是一个IntersectionObserverEntry对象的数组；entry.isIntersecting 表示目标元素是否可见
  //     if (entry.isIntersecting) {
  //       console.log("章节可见", entry);
  //       activeId.value = Number(
  //         entry.target.getAttribute("id").replace("title", "")
  //       ); // 更新当前激活章节
  //     }
  //   });
  // }, options);
  // if (props.data.length) {
  //   props.data.forEach((item) => {
  //     const e = document.querySelector(`#title${item.id}`);
  //     if (e) {
  //       observer.value.observe(e);
  //     }
  //   });
  // }

  // 方案2：使用滚动事件
  notes.value = document.querySelectorAll("note-item");
});
onBeforeUnmount(() => {
  // 断开观察
  // observer.value && observer.value.disconnect();
});

defineExpose({});
</script>

<style scoped lang="scss">
.note {
  overflow: hidden;
  padding: 8px;
  .scrollbar {
    height: calc(100% - 45px - 16px);
  }

  .menu-wrap {
    width: 100%;
    background: rgb(28, 30, 33);
    box-shadow: 0 2px 6px -6px white;
    // border-bottom: 1px solid #eaeaea;
    // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #ffffff;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    position: sticky;
    top: 0px;
    z-index: 11;
    .menu-item {
      padding: 10px;
      cursor: pointer;
      .menu-item-title {
        border-bottom: 2px solid rgb(28, 30, 33);
      }
      &:hover {
        .menu-item-title {
          border-bottom: 2px solid rgb(66, 211, 146);
        }
      }
      &-title {
        font-size: 18px;
        font-weight: 500;
      }
    }
    .menu-item-active {
      color: rgba(235, 235, 235, 0.6);
      .menu-item-title {
        border-bottom: 2px solid rgb(66, 211, 146);
      }
    }
  }
}
</style>
