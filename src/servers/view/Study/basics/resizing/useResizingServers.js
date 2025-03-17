import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import exampleMd from "@/servers/view/Study/basics/resizing/index.md?raw";
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/default.css"; // 引入默认样式

export default function useReadmeServers() {
  // 获取md
  const renderedMarkdown = computed(() => {
    const md = markdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return ""; // 默认转义处理
      },
    });
    return md.render(exampleMd);
  });

  return { renderedMarkdown };
}
