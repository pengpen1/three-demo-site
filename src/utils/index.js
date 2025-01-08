import eventBus from "./eventBus";

const getAssetUrl = (assetPath) => {
  return `${import.meta.env.BASE_URL}${assetPath}`;
};

export {
  eventBus,
  // ... 其他需要导出的模块
  getAssetUrl,
};
