<script setup>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

/**
 * [디자인 포인트 1] 차트 옵션 설정
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    // 범례 디자인 (INCOME, EXPENSE)
    legend: {
      display: true,
      position: 'top',
      align: 'end', // 우측 상단 정렬
      labels: {
        color: '#aaaaaa', // 글자 색상
        usePointStyle: true, // 점 형태의 범례
        pointStyle: 'circle',
        boxWidth: 8,
        padding: 20,
      },
    },
    // 풍선 도움말 디자인
    tooltip: {
      backgroundColor: '#333333',
      titleColor: '#ffffff',
      bodyColor: '#dddddd',
      cornerRadius: 8,
      padding: 12,
    },
  },
  // [디자인 포인트 2] 축 스타일링
  scales: {
    x: {
      grid: {
        display: false, // X축 그리드 숨김
      },
      ticks: {
        color: '#666666', // 월별 라벨 색상 (01월...)
        font: { size: 12 },
      },
    },
    y: {
      display: false, // Y축 숨김 (디자인 참고)
      grid: { display: false },
    },
  },
};
</script>

<template>
  <div class="bar-chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.bar-chart-container {
  height: 100%;
  width: 100%;
}
</style>
