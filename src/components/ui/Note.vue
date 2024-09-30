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
    <el-scrollbar class="scrollbar" id="scrollArea">
      <template v-if="data.length">
        <div v-for="item in data" :key="item.id">
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
  chapter && chapter.scrollIntoView({ behavior: "smooth" });
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

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("章节可见", entry);
        activeId.value = Number(entry.target.getAttribute("id").replace("title", "")); // 更新当前激活章节
      }
    });
  }, options);

  // 观察每个章节标题
  if (props.data.length) {
    props.data.forEach((item) => {
      const e = document.querySelector(`#title${item.id}`);
      if (e) {
        observer.value.observe(e);
      }
    });
  }
});
onBeforeUnmount(() => {
  // 断开观察
  observer.value && observer.value.disconnect();
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
    background-color: #ffffff;
    border-bottom: 1px solid #eaeaea;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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
      &:hover {
        background-color: #f5f5f5;
      }
      &-title {
        font-size: 18px;
        font-weight: 500;
      }
    }
    .menu-item-active {
      color: rgb(48, 231, 255);
    }
  }
}
</style>
