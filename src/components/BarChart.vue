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

// 부모로부터 데이터를 전달받음
defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true } },
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
