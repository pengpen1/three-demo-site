import { ref } from "vue";
import * as THREE from "three";
const useFileLoader = () => {
  // 进度
  const progress = ref(0);
  /**
   * 请求方法
   * @param {*} url 请求地址
   * @returns {Object} 返回数据
   */
  const requestData = async (url) => {
    try {
      // 文件加载器
      const loader = new THREE.FileLoader();
      // 请求数据
      let data = await loader.loadAsync(url, (event) => {
        const { loaded, total } = event;
        progress.value = ((loaded / total) * 100).toFixed(0);
      });
      // 数据转换-字符转为json
      data = JSON.parse(data);

      return data;
    } catch (error) {
      console.log(error);
    }
  };
  return {
    requestData,
    progress,
  };
};
export default useFileLoader;
