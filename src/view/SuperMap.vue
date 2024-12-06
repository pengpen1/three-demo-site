<script setup>
import { ref } from "vue";
import useSuperMapServers from "@/servers/view/SuperMap/useSuperMapServers.js";
import LeftBuiding from "@/components/view/SuperMap/left/LeftBuiding.vue";
import RightBuiding from "@/components/view/SuperMap/right/RightBuiding.vue";

const containerRef = ref(null);
const {
  isShow,
  clickHandler,
  closeHandler,
  renderedMarkdown,
  noteProps,
  showCharts,
  displayData,
  userName,
  timeDate,
} = useSuperMapServers({ containerRef });
</script>

<template>
  <div class="supermap">
    <div>
      <!-- <p>(双击可进入全屏，效果更佳哦)</p> -->

      <!-- 顶部 -->
      <div class="navigation" v-if="showCharts">
        <div class="navigation_ul">
          <div class="navigation_ul_menu navigation_ul_menu_left">
            <div
              class="navigation_li"
              v-for="item in displayData.menuData1"
              @click="displayData.handleClick(item)"
              :class="item.active ? 'navigation_li_te' : ''"
              :key="item.id"
            >
              <span
                style="
                  color: #fff;
                  height: 100%;
                  width: 100%;
                  display: block;
                  text-decoration: none;
                "
              >
                {{ item.name }}</span
              >
            </div>
          </div>

          <div class="navigation_main">
            <div class="navigation_name">超级地图</div>
          </div>

          <div class="navigation_ul_menu navigation_ul_menu_right">
            <div
              class="navigation_li navigation_li_Right"
              v-for="item in displayData.menuData2"
              @click="handleClick(item)"
              :class="item.active ? 'navigation_li_Right_te' : ''"
              :key="item.id"
            >
              <span
                style="
                  color: #fff;
                  height: 100%;
                  width: 100%;
                  display: block;
                  text-decoration: none;
                "
              >
                {{ item.name }}</span
              >
            </div>
          </div>
          <div class="imgs_setting"></div>
        </div>
        <div class="navigation_left"></div>
        <div class="navigation_right">
          <div class="navigation_tips_name" ref="userName">
            <!-- 铃声 -->
            <div class="navigation_tips">
              <!-- <span>1</span> -->
            </div>
            <div class="navigation_name">root</div>
          </div>
          <div class="date" ref="timeDate">
            <div class="date_text">
              {{ displayData.nowDate }}
            </div>
            <!-- <div class="date_text">
						10:00
					</div> -->
            <!-- <div class="date_text">
						农历九月初六
					</div> -->
          </div>
        </div>
      </div>
      <!-- 左侧图表 -->
      <div class="index_left" v-if="showCharts">
        <!-- 左边 统计图 -->
        <leftBuiding></leftBuiding>
      </div>
      <!-- 右侧图表 -->
      <div class="index_right" v-if="showCharts">
        <rightBuiding></rightBuiding>
      </div>
      <!-- 地图 -->
      <div class="contengt-wrap">
        <div id="container" class="is-full" ref="containerRef"></div>
      </div>
    </div>

    <Note v-bind="noteProps"></Note>

    <Floating @close="closeHandler" :model="5" :second="2">
      <template v-slot:expand>
        <span class="text" @click="clickHandler">{{
          isShow ? "收起笔记" : "查看笔记"
        }}</span>
      </template>
      <template v-slot:collapse>
        <span @click="clickHandler" style="cursor: pointer"
          ><font-awesome-icon :icon="['fas', 'book']"
        /></span>
      </template>
    </Floating>
  </div>
</template>

<style scoped lang="scss">
.supermap {
  position: relative;
  overflow: hidden;
  background-color: #414141;
  height: 100%;
}
.contengt-wrap {
  position: relative;
  width: 100%;
}
#container {
  width: 100%;
  height: calc(100vh - 40px);
  overflow: hidden;
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
}
.map-32-label {
  padding: 4px;
  color: #fff;
  font-size: 12px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: row;
}
.text {
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

/* 导航栏 */
.supermap .navigation {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  height: 80px;
  width: 100%;
  background-image: url(/imges/building/shang.png);
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.navigation .navigation_ul {
  /* margin-top: .5%; */
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}
.navigation .navigation_ul .navigation_ul_menu {
  position: relative;
  display: flex;
}

.navigation .navigation_left {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 20%;
}
.navigation .navigation_right {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.navigation .navigation_right .navigation_tips_name {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: right;
}
/* 提示 */
.navigation .navigation_right .navigation_tips {
  cursor: pointer;
  width: 20px;
  height: 23px;
  background-image: url(/imges/building/lingSheng.png);
  background-size: 100% 100%;
}

.navigation .navigation_right .date {
  position: relative;
  margin-top: 5px;
  display: flex;
  margin-left: auto;
  margin-right: 3%;
  width: 60%;
  justify-content: right;
}
.navigation .navigation_right .date .date_text {
  margin: 0 5px;
  font-size: 12px;
  color: #0798d7;
}

.navigation_name {
  cursor: pointer;
  margin-right: 3%;
  padding: 0 3%;
  font-size: 14px;
  color: #fff;
}
.navigation .navigation_ul .navigation_li {
  /* margin: 0 3px; */
  position: relative;
  z-index: 1;
  width: 120px;
  height: 34px;
  line-height: 34px;
  font-size: 16px;
  text-align: center;
  color: #fff;
  /* background-color: aliceblue; */
  background: url(/imges/building/Button.png) no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
.navigation .navigation_ul .navigation_li_Right {
  background: url(/imges/building/you_button.png) no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li_te {
  background: url(/imges/building/Button2.png) no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li_Right_te {
  background: url(/imges/building/you_button2.png) no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li:hover {
  background: url(/imges/building/Button2.png) no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_li_Right:hover {
  background: url(/imges/building/you_button2.png) no-repeat;
  background-size: 100% 100%;
}
.navigation .navigation_ul .navigation_main {
  position: relative;
  height: 100%;
  width: 320px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.navigation .navigation_ul .navigation_name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  font-size: 20px;
  height: 95%;
  padding-bottom: 5%;
  color: #09b7ff;
  font-size: 22px;
  font-weight: 700;
  /* background-color: rgba(255,255,255,.4); */
}
.navigation .navigation_ul .imgs_setting {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  margin: auto;
  width: 75%;
  height: 55%;
  background: url("/imges/main_title.png") no-repeat;
  background-size: 100% 100%;
}

/* 内容 */
.supermap .index_left {
  position: absolute;
  z-index: 3;
  opacity: 1;
  left: 0;
  top: 0;
  width: 20%;
  height: 100%;
}
.supermap .index_right {
  position: absolute;
  z-index: 2;
  opacity: 1;
  right: 0;
  top: 0;
  width: 20%;
  height: 100%;
}

.supermap .floor_right {
  position: absolute;
  z-index: 2;
  opacity: 1;
  right: 20%;
  width: 4%;
  height: 100%;
  /* background-color: #fff; */

  bottom: 0;
}
.supermap .operation_left {
  position: absolute;
  z-index: 2;
  opacity: 1;
  left: 20%;
  width: 98px;
  height: 50%;
  /* background-color: #fff; */
  bottom: 0;
  top: 0;
  margin: auto 0;
  overflow: hidden;
}
</style>
