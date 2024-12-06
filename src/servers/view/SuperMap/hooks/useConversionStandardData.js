const useConversionStandardData = () => {
  /**
   * 转换geoJson数据,将单个数组转为多维数组
   * @param {*} worldData geo数据
   * @returns
   */
  const transfromGeoJSON = (worldData) => {
    const features = worldData.features;
    for (let i = 0; i < features.length; i++) {
      const element = features[i];
      // 将Polygon处理跟MultiPolygon一样的数据结构
      if (element.geometry.type === "Polygon") {
        element.geometry.coordinates = [element.geometry.coordinates];
      }
    }
    return worldData;
  };
  /**
   * 转换路网数据，跟世界数据保持一致的格式
   * @param {*} roadData
   * @returns
   */
  const transformGeoRoad = (roadData) => {
    const features = roadData.features;
    for (let i = 0; i < features.length; i++) {
      const element = features[i];
      //LineString处理跟MultiLineString一样的数据结构
      if (element.geometry.type === "LineString") {
        element.geometry.coordinates = [[element.geometry.coordinates]];
      } else {
        element.geometry.coordinates = [element.geometry.coordinates];
      }
    }
    return roadData;
  };
  return { transfromGeoJSON, transformGeoRoad };
};
export default useConversionStandardData;
