import { defineAsyncComponent } from 'vue';

const Floating = defineAsyncComponent(() => import('@/components/ui/Floating.vue'));
const DragFloating = defineAsyncComponent(() => import('@/components/ui/DragFloating.vue'));
const Note = defineAsyncComponent(() => import('@/components/ui/Note.vue'));


const components = {
  Floating,
  DragFloating,
  Note,
};

export default {
  install(app) {
    // 注册全局组件
    Object.keys(components).forEach((componentName) => {
      app.component(componentName, components[componentName]);
    })
  }
};
 