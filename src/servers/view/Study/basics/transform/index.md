# Transform

1. There are 4 properties to transform objects

- position
- scale
- rotation
- quaternion 四元素

2. All classes that inherit from the `Object3D` possess those properties, like `PerspectiveCamera` or Mesh(所有从继承自`Objuect3D`的类都具有这些属性)

3. Those properties will be compiled in matrices.(这些属性将要被编译成矩阵)

4. As for the meaning of 1 unit, it's up to you. 1 can be 1 centimeter, 1 meter, or even 1 kilometer. I recommend that you adapt the unit to what you want to build. If you're going to create a house, you probably should think of 1 unit as 1 meter. (1单位的含义不是固定的，应该根据场景来适应)

5. The position property is not any object. It's an instance of the `Vector3` class. While this class has an x, a y, and a z property, it also has many useful methods.(三维向量)

6. To change the values, instead of changing x, y and z separately, you can also use the set(...) method（set方法统一设置x,y,z值）

7. You can use the self-evident rotation property, but you can also use the less obvious quaternion property. Three.js supports both, and updating one will automatically update the other.(rotation和quaternion会互相自动更新，设置quaternion会相应更改rotation的值)

8. The rotation property also has x, y, and z properties, but instead of a `Vector3`, it's a `Euler`. When you change the x, y, and z properties of a Euler, you can imagine putting a stick through your object's center in the axis's direction and then rotating that object on that stick.(旋转的属性值，可以想象一个棍子沿轴方向穿管对象中心，然后绕着棍子旋转)

9. Is it easy? Yes, but when you combine those rotations, you might end up with strange results. Why? Because, while you rotate the x axis, you also change the other axes' orientation. The rotation applies in the following order: x, y, and then z. That can result in weird behaviors like one named gimbal lock when one axis has no more effect, all because of the previous ones.(当你旋转 x 轴时，你也会改变其他轴的方向。旋转按以下顺序应用：x、y，然后是 z。这可能会导致奇怪的行为，例如当一个轴不再有效时，称为万向节锁定的行为，这都是因为前一个轴)                     We can change this order by using the `reorder(...)` method `object.rotation.reorder('YXZ')`(可以使用reorder(...) 方法调节顺序)                               While [Euler](https://threejs.org/docs/index.html#api/en/math/Euler) is easier to understand, this order problem can cause issues. And this is why most engines and 3D softwares use another solution named [Quaternion](https://threejs.org/docs/#api/en/math/Quaternion).(虽然`Euler`更容易理解，但这个顺序问题可能会导致问题。这就是为什么大多数引擎和 3D 软件使用另一种名为 Quaternion 的解决方案)

10. [Object3D](https://threejs.org/docs/#api/en/core/Object3D) instances have an excellent method named `lookAt(...)` that lets you ask an object to look at something. The object will automatically rotate its `-z` axis toward the target you provided. No complicated maths needed.

    You can use it to rotate the camera toward an object, orientate a cannon to face an enemy, or move the character's eyes to an object.

    The parameter is the target and must be a [Vector3](https://threejs.org/docs/#api/en/math/Vector3). You can create one just to try it:

    ```js
    camera.lookAt(new THREE.Vector3(0, - 1, 0))
    camera.lookAt(mesh.position)
    ```

    `Object3D` 实例有一个名为 lookAt的方法，可以要求对象朝向（观察方向）某位置，参数必须是`Vector3`

11.  group分组也可以先变换，然后再加入对象。The order doesn't really matter, as long as it's valid JavaScript.





# New vocabulary

1. inherit 继承
1. quaternion  四元素
1. matrices 矩阵
1. meaning 含义
1. adapt 适应
1. instead 代替
1. separately 分别



# Question

**1.camera使用lookAt方法时会改变自身位置吗？**

不会改变



**2.加入group后，物体的坐标变成相对于group的坐标了吗？** 已测试

将 3D 物体加入`Group`后，物体的坐标不会自动变成相对于`Group`的坐标，它仍然保留其相对于世界坐标原点的坐标，但是`Group`的变换会影响物体在世界坐标中的位置。

我自己测试的结果是，物体本身的position值并没有变化，但是在场景中实际表现结果是叠加了Group的变化的，类似于物体本身的位置为（x1,y1,z1），不管加入Group打印出来都是这个值，但是加入后实际的位置为：（x1 + Group.position.x , y2 + Group.position.y ,z1 + Group.position.z ）
