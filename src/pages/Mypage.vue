<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import BarChart from '@/components/BarChart.vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
);

const isLoaded = ref(false);
const pieData = ref(null);
const barData = ref(null);

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/db');
    const { categories, transactions } = response.data;

    // 1. [Pie Chart] 카테고리별 지출 합계
    const expenseByCategory = {};
    categories.forEach((cat) => (expenseByCategory[cat.id] = 0));

    transactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        expenseByCategory[t.category_id] += t.amount;
      }
    });

    pieData.value = {
      labels: categories.map((c) => c.name),
      datasets: [
        {
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FFA07A',
            '#20B2AA',
            '#87CEFA',
          ],
          data: categories.map((c) => expenseByCategory[c.id]),
        },
      ],
    };

    // 2. [Bar Chart] 월별 수입/지출 합계
    const monthlyData = {};
    transactions.forEach((t) => {
      const month = t.transaction_date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
      if (t.type === 'INCOME') monthlyData[month].income += t.amount;
      else monthlyData[month].expense += t.amount;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    barData.value = {
      labels: sortedMonths,
      datasets: [
        {
          label: '수입',
          backgroundColor: '#36A2EB',
          data: sortedMonths.map((m) => monthlyData[m].income),
        },
        {
          label: '지출',
          backgroundColor: '#FF6384',
          data: sortedMonths.map((m) => monthlyData[m].expense),
        },
      ],
    };

    isLoaded.value = true;
  } catch (error) {
    console.error('데이터 로드 에러:', error);
  }
};

onMounted(fetchData);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<template>
  <div class="my-page-container">
    <h2>📊 나의 소비 리포트</h2>
    <div v-if="isLoaded" class="content-grid">
      <section class="chart-card">
        <h3>💰 월별 수입/지출 비교</h3>
        <div class="chart-wrapper">
          <BarChart :chart-data="barData" />
        </div>
      </section>

      <section class="chart-card">
        <h3>🍕 카테고리별 지출 비율</h3>
        <div class="chart-wrapper">
          <Pie :data="pieData" :options="chartOptions" />
        </div>
      </section>
    </div>
    <div v-else class="loading">데이터를 불러오는 중...</div>
  </div>
</template>

<style scoped>
.my-page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
.chart-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.chart-wrapper {
  height: 350px;
  margin-top: 15px;
}
.loading {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2rem;
}
</style>
