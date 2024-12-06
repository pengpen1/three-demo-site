<!-- 智慧楼宇 左 统计图 -->
<template>
  <div class="left_buiding">
    <div class="chart_li dynamic_dyke">
      <div class="chart_li_img"></div>
      <div class="chart_title">各类资产数量</div>
      <div class="chart_content">
        <div
          class="building_li"
          v-for="(item, index) in fireControl"
          :key="index"
        >
          <div class="building_text">
            {{ item.name }}
          </div>
          <div class="building_chart">
            <div
              class="chart_display"
              :style="{ width: item.percentage }"
            ></div>
            <span>{{ item.value }}</span>
          </div>
          <div class="building_value">
            {{ item.percentage }}
          </div>
        </div>
      </div>
    </div>
    <div class="chart_li dynamic_energy">
      <div class="chart_li_img"></div>
      <div class="chart_title">资产统计</div>
      <div class="chart_content">
        <div class="energy_li">
          <div class="energy_text">
            重要资产:
            <span>236个</span>
          </div>
          <div class="energy_container">
            <div class="energy_chart">
              <div class="energy_display"></div>
              <span>236个</span>
            </div>
            <!-- <div class="energy_value">
							70%
						</div> -->
          </div>
        </div>

        <div class="energy_li">
          <div class="energy_text">
            敏感资产:
            <span>62个</span>
          </div>
          <div class="energy_container">
            <div class="energy_chart">
              <div class="energy_display"></div>
              <span>62个</span>
            </div>
            <!-- <div class="energy_value">
							90%
						</div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="chart_li dynamic_havc">
      <div class="chart_li_img"></div>
      <div class="chart_title">最新风险</div>
      <div class="chart_content">
        <div class="chart_content">
          <div
            class="building_li"
            v-for="(item, index) in havcData"
            :key="index"
          >
            <div class="building_text">
              {{ item.name }}
            </div>
            <div class="building_chart">
              <div
                class="chart_display"
                :style="{ width: item.percentage, backgroundColor: item.color }"
              ></div>
              <span>{{ item.value }}</span>
            </div>
            <div class="building_value">
              {{ item.percentage }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chart_li dynamic_electric">
      <div class="chart_li_img"></div>
      <div class="chart_title">风险类型分布</div>
      <div class="chart_content">
        <div class="distributing">
          <div class="distributing_li">
            <div id="ball_chart" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart2" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart3" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart4" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart5" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart6" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart7" style="width: 100%; height: 100%"></div>
          </div>
          <div class="distributing_li">
            <div id="ball_chart8" style="width: 100%; height: 100%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import leftBuiding from "./leftBuiding.js";
export default leftBuiding;
</script>

<style>
@import url("leftBuiding.css");
</style>
