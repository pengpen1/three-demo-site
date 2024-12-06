// 引入Three.js

/**
 * 经纬度坐标转球面坐标
 * @param {地球半径} R
 * @param {经度(角度值)} longitude
 * @param {维度(角度值)} latitude
 */
export function lon2xyz(R, longitude, latitude) {
  let lon = (longitude * Math.PI) / 180; //转弧度值
  const lat = (latitude * Math.PI) / 180; //转弧度值
  lon = -lon; // three.js坐标系z坐标轴对应经度-90度，而不是90度

  // 经纬度坐标转球面坐标计算公式
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  // 返回球面坐标
  return {
    x: x,
    y: y,
    z: z,
  };
}

export const isType = function (type, value) {
  return Object.prototype.toString.call(value) === `[object ${type}]`;
};
/**
 * 判断是否为对象
 */
export const isObject = function (value) {
  return isType("Object", value);
};
/**
 * @description deepClone() 深拷贝-最终版：解决循环引用的问题
 * @param {*} target 对象
 * @example
 *      const obj1 = {
 *          a: 1,
 *          b: ["e", "f", "g"],
 *          c: { h: { i: 2 } },
 *      };
 *      obj1.b.push(obj1.c);
 *      obj1.c.j = obj1.b;
 *
 *      const obj2 = deepClone(obj1);
 *      obj2.b.push("h");
 *      console.log(obj1, obj2);
 *      console.log(obj2.c === obj1.c);
 */
export function deepClone(target, map = new Map()) {
  // target 不能为空，并且是一个对象
  if (target != null && isObject(target)) {
    // 在克隆数据前，进行判断是否克隆过,已克隆就返回克隆的值
    let cache = map.get(target);
    if (cache) {
      return cache;
    }
    // 判断是否为数组
    const isArray = Array.isArray(target);
    const result = isArray ? [] : {};
    // 将新结果存入缓存中
    cache = map.set(target, result);
    // 如果是数组
    if (isArray) {
      // 循环数组，
      target.forEach((item, index) => {
        // 如果item是对象，再次递归
        result[index] = deepClone(item, cache);
      });
    } else {
      // 如果是对象
      Object.keys(target).forEach((key) => {
        if (isObject(result[key])) {
          result[key] = deepClone(target[key], cache);
        } else {
          result[key] = target[key];
        }
      });
    }
    return result;
  } else {
    return target;
  }
}

export function deepMerge(target, source) {
  target = deepClone(target);
  for (const key in source) {
    if (key in target) {
      // 对象的处理
      if (isObject(source[key])) {
        if (!isObject(target[key])) {
          target[key] = source[key];
        } else {
          target[key] = deepMerge(target[key], source[key]);
        }
      } else {
        target[key] = source[key];
      }
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
// 随机数
export const random = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
/**
 * 获取样式
 * @param {*} el
 * @param {*} ruleName
 * @returns
 */
export function getStyle(el, ruleName) {
  return window.getComputedStyle(el)[ruleName];
}
