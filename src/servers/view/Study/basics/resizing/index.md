# Resizing

### 一、resizing identity

- Data repository (数据仓库)
- Architect of Spaces （空间建筑师）
- Linear Transformation Wizard (线性变换魔法师)



Data repository：Storing equation coefficients、**彩色图像像素存储（多通道）**、**灰度图像像素存储（单通道）**

Architect of Spaces：秩为2的矩阵，根据不同的x,y系数，在二维坐标轴中就能构建出任意一点。同理，秩为3的矩阵，根据不同的x、y、z系数，就能在三位坐标轴中构建出三维空间，甚至是四维空间

Linear Transformation Wizard：

旋转矩阵，当且仅当它是**正交矩阵**（绕原点的旋转，旋转不会改变向量的长度和向量之间的角度）并且它的**行列式是1**（改变空间的方向，而不会改变空间的体积）。矩阵值乘以一个三维坐标，得到的结果坐标。点构成线，线构成面，所以矩阵可以对三维物体进行旋转。

投影矩阵，projection resizing，需要满足自身的平方等于自己。投影矩阵乘以一个三维坐标？会将z轴的值归零。待验证



### 二、resizing multiplication

- 行列点积 （想象矩阵第一个身份，存储方程式系数）

第一个矩阵的**列数**必须是等于第二个矩阵的**行数**。

相乘的结果具有第一个矩阵的 **行数** 和第二个矩阵的 **列数**。

我们把 1×3 矩阵乘以 3×4 矩阵（留意两个矩阵都有 3），相乘的结果是个 1×4 矩阵

一般：把**m×n**矩阵与**n×p**矩阵相乘，**n** 必须相同，相乘结果是**m×p**矩阵。

- 列向量组合

需要特殊条件？



### 三、Rank

```text
 非零子式的最高阶数就是秩 
```



# New vocabulary

1. coefficient 系数



# Question

**1.camera使用lookAt方法时会改变自身位置吗？**

不会改变



# reference

- https://www.ruanyifeng.com/blog/2015/09/resizing-multiplication.html
- https://www.shuxuele.com/algebra/resizing-multiplying.html
- https://zhuanlan.zhihu.com/p/362082020
