import { defineAsyncComponent } from 'vue';

const Floating = defineAsyncComponent(() => import('@/components/Floating.vue'));
const DragFloating = defineAsyncComponent(() => import('@/components/DragFloating.vue'));

const components = {
  Floating,
  DragFloating
};

export default {
  install(app) {
    // 注册全局组件
    Object.keys(components).forEach((componentName) => {
      app.component(componentName, components[componentName]);
    })
  }
};
 