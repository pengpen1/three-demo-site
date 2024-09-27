import { reactive, ref, onMounted, onBeforeUnmount, computed } from "vue";
import exampleMd from "@/servers/view/Readme/index.md?raw";
import markdownIt from "markdown-it";

export default function useReadmeServers() {
  // 获取md
  const renderedMarkdown = computed(() => {
    const md = markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    return md.render(exampleMd);
  });

  return { renderedMarkdown };
}
