import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import useCoord from "@/servers/view/SuperMap/hooks/useCoord.js";
import { deepMerge, random } from "@/servers/view/SuperMap/utils";
/**
 *
 * @param {object} {
 *  pointTextureUrl:标记点的图片url
 *  lightHaloTextureUrl:光圈的URL
 *  lightPillarUrl:光柱的URL
 *  scaleFactor:1 缩放系数，用来调整标记点和光圈的缩放大小
 * }
 *
 * @returns
 */
export default function useMarkedLightPillar(options) {
  const { geoSphereCoord } = useCoord();
  // 默认参数
  let defaultOptions = {
    // pointTextureUrl: "/texture/旋转点位.webp",
    pointTextureUrl: "/texture/标注.png",
    lightHaloTextureUrl: "/texture/标注光圈.png",
    lightPillarUrl: "/texture/光柱.png",
    scaleFactor: 1, // 缩放系数
  };
  defaultOptions = deepMerge(defaultOptions, options);
  // 纹理加载器
  const textureLoader = new THREE.TextureLoader();
  // 射线拾取对象
  const raycaster = new THREE.Raycaster();
  let containerWidth = window.width;
  let containerHeight = window.height;
  // 对象属性
  let getBoundingClientRect = null;
  /**
   * 创建标记点
   * @param {*} R 地球半径，根据R来进行缩放
   * @returns
   */
  const createPointMesh = () => {
    // 标记点：几何体，材质，
    const geometry = new THREE.PlaneBufferGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(defaultOptions.pointTextureUrl),
      color: 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false, //禁止写入深度缓冲区数据
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = "createPointMesh";
    // 缩放
    const scale = 0.15 * defaultOptions.scaleFactor;
    mesh.scale.set(scale, scale, scale);
    return mesh;
  };
  /**
   * 创建光圈
   * @param {*} R 地球半径，根据R来进行缩放
   * @returns
   */
  const createLightHalo = () => {
    // 标记点：几何体，材质，
    const geometry = new THREE.PlaneBufferGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(defaultOptions.lightHaloTextureUrl),
      color: 0x00ffff,
      side: THREE.DoubleSide,
      opacity: 0,
      transparent: true,
      depthWrite: false, //禁止写入深度缓冲区数据
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = "createLightHalo";
    // 缩放
    const scale = 2.5;
    mesh.scale.set(scale, scale, scale);
    // 动画延迟时间
    const delay = random(0, 2000);
    // 动画：透明度缩放动画
    mesh.tween1 = new TWEEN.Tween({ scale: scale, opacity: 0 })
      .to({ scale: scale * 1.5, opacity: 1 }, 1000)
      .delay(delay)
      .onUpdate((params) => {
        let { scale, opacity } = params;
        mesh.scale.set(scale, scale, scale);
        mesh.material.opacity = opacity;
      });
    mesh.tween2 = new TWEEN.Tween({ scale: scale * 1.5, opacity: 1 })
      .to({ scale: scale * 2, opacity: 0 }, 1000)
      .onUpdate((params) => {
        let { scale, opacity } = params;
        mesh.scale.set(scale, scale, scale);
        mesh.material.opacity = opacity;
      });
    mesh.tween1.chain(mesh.tween2);
    mesh.tween2.chain(mesh.tween1);
    mesh.tween1.start();
    return mesh;
  };
  /**
   * 复制光柱并旋转
   * @param {*} object 源光柱
   * @param {*} count  光柱总数量，包含复制光柱以及源光柱
   * @returns [...]
   */
  const createCopiesWithRotation = (object, count) => {
    let copies = [];
    copies.push(object); // 将原始对象放入数组

    for (let i = 1; i < count; i++) {
      let copy = object.clone(); // 克隆对象
      copy.name = "createLightPillar" + (i + 1);
      let rotationAngle = (Math.PI * i) / count; // 计算旋转角度
      copy.rotateZ(rotationAngle); // 旋转复制体
      copies.push(copy); // 将复制体放入数组
    }

    return copies;
  };
  /**
   * 创建光柱
   * @param {*} lon
   * @param {*} lat
   * @param {*} heightScaleFactor 光柱高度的缩放系数
   * @returns
   */
  const createLightPillar = (lon, lat, heightScaleFactor = 1) => {
    let group = new THREE.Group();
    // 柱体高度
    const height = heightScaleFactor;
    // 柱体的geo,6.19=柱体图片高度/宽度的倍数
    const geometry = new THREE.PlaneBufferGeometry(height / 6.219, height);
    // 柱体旋转90度，垂直于Y轴
    geometry.rotateX(Math.PI / 2);
    // 柱体的z轴移动高度一半对齐中心点
    geometry.translate(0, 0, height / 2);
    // 柱子材质
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(defaultOptions.lightPillarUrl),
      color: 0x00ffff,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    // 光柱01
    let light01 = new THREE.Mesh(geometry, material);
    // light01.frustumCulled = false;
    light01.name = "createLightPillar01";
    // // 光柱02：复制光柱01
    // let light02 = light01.clone();
    // light02.name = "createLightPillar02";
    // // 光柱02，旋转90°，跟 光柱01交叉
    // light02.rotateZ(Math.PI / 2);
    // 创建底部标点
    const bottomMesh = createPointMesh();
    // 创建光圈
    const lightHalo = createLightHalo();
    // 将光柱和标点添加到组里
    group.add(bottomMesh, lightHalo, ...createCopiesWithRotation(light01, 2));
    // 设置组对象的姿态
    // group = setMeshQuaternion(group, R, lon, lat)
    group.position.set(lon, lat, 0);
    return group;
  };
  /**
   * 设置光柱颜色
   * @param {*} group
   * @param {*} color
   */
  const setLightPillarColor = (group, color) => {
    group.children.forEach((item) => {
      item.material.color = new THREE.Color(color);
    });
  };
  /**
   * 设置网格的位置及姿态
   * @param {*} mesh
   * @param {*} R
   * @param {*} lon
   * @param {*} lat
   * @returns
   */
  const setMeshQuaternion = (mesh, R, lon, lat) => {
    const { x, y, z } = geoSphereCoord(R, lon, lat);
    mesh.position.set(x, y, z);
    // 姿态设置
    // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
    let meshVector = new THREE.Vector3(x, y, z).normalize();
    // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
    let normal = new THREE.Vector3(0, 0, 1);
    // 四元数属性.quaternion表示mesh的角度状态
    //.setFromUnitVectors();计算两个向量之间构成的四元数值
    mesh.quaternion.setFromUnitVectors(normal, meshVector);
    return mesh;
  };
  /**
   * 射线拾取，返回选中的mesh
   * @param {*} event
   * @param {*} container
   * @param {*} camera
   * @param {*} mesh // 光柱group
   * @returns
   */
  const getRaycasterObj = (event, container, camera, mesh) => {
    //屏幕坐标转WebGL标准设备坐标
    if (!getBoundingClientRect) {
      getBoundingClientRect = container.getBoundingClientRect();
      containerWidth = container.offsetWidth;
      containerHeight = container.offsetHeight;
    }
    var x =
      ((event.clientX - getBoundingClientRect.left) / containerWidth) * 2 - 1;
    var y =
      -((event.clientY - getBoundingClientRect.top) / containerHeight) * 2 + 1;

    //通过鼠标单击位置标准设备坐标和相机参数计算射线投射器`Raycaster`的射线属性.ray
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    //返回.intersectObjects()参数中射线选中的网格模型对象
    // 未选中对象返回空数组[],选中一个数组1个元素，选中两个数组两个元素
    var intersects = raycaster.intersectObjects(mesh);
    return intersects;
  };
  /**
   * 选择光柱，返回选择的对象
   * @param {*} event
   * @param {*} container
   * @param {*} camera
   * @param {*} mesh
   * @returns 返回选择的对象
   */
  const chooseLightPillar = (event, container, camera, mesh) => {
    event.preventDefault();
    // 获取拾取的对象数组
    let intersects = getRaycasterObj(event, container, camera, mesh);
    // 大于0说明，说明选中了mesh,返回对象
    if (intersects.length > 0) {
      return intersects[0];
    }
    return null;
  };
  return {
    createLightPillar,
    setLightPillarColor,
    chooseLightPillar,
  };
}
