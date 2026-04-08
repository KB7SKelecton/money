<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import BarChart from '@/components/BarChart.vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

const isLoaded = ref(false);
const rawData = ref({ transactions: [], categories: [] });
const currentDate = ref(new Date());

const barData = ref(null);
const doughnutData = ref(null);
const categorySummary = ref([]);
const totalMonthlyExpense = ref(0);

// 시안 기반 포인트 컬러
const colors = ['#f8a70c', '#fab809', '#6e6053', '#8b7e74', '#4a443f'];

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#ffffff', font: { size: 14, weight: '600' } },
    },
    y: { display: false },
  },
};

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/db');
    rawData.value = response.data;
    updateDashboard();
    isLoaded.value = true;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
};

const changeMonth = (offset) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  currentDate.value = newDate;
};

watch(currentDate, () => updateDashboard());

const updateDashboard = () => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const monthlyMap = {};
  for (let i = 3; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}월`;
    monthlyMap[key] = { income: 0, expense: 0 };
  }

  rawData.value.transactions.forEach((t) => {
    const d = new Date(t.transaction_date);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}월`;
    if (monthlyMap[key]) {
      if (t.type === 'INCOME') monthlyMap[key].income += t.amount;
      else monthlyMap[key].expense += t.amount;
    }
  });

  const sortedLabels = Object.keys(monthlyMap);
  barData.value = {
    labels: sortedLabels,
    datasets: [
      {
        label: '수입',
        backgroundColor: '#f8a70c',
        data: sortedLabels.map((m) => monthlyMap[m].income),
        borderRadius: 8,
      },
      {
        label: '지출',
        backgroundColor: '#6e6053',
        data: sortedLabels.map((m) => monthlyMap[m].expense),
        borderRadius: 8,
      },
    ],
  };

  const currentTransactions = rawData.value.transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const expenseByCat = {};
  rawData.value.categories.forEach(
    (c) => (expenseByCat[c.id] = { name: c.name, amount: 0 }),
  );

  let currentTotal = 0;
  currentTransactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      if (expenseByCat[t.category_id]) {
        expenseByCat[t.category_id].amount += t.amount;
        currentTotal += t.amount;
      }
    });
  totalMonthlyExpense.value = currentTotal;

  const sorted = Object.values(expenseByCat)
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const top4 = sorted.slice(0, 4);
  const othersAmt = sorted.slice(4).reduce((sum, c) => sum + c.amount, 0);
  const finalDonut = [...top4];
  if (othersAmt > 0) finalDonut.push({ name: '기타', amount: othersAmt });

  doughnutData.value = {
    labels: finalDonut.map((c) => c.name),
    datasets: [
      {
        data: finalDonut.map((c) => c.amount),
        backgroundColor: colors,
        borderWidth: 0,
        cutout: '78%',
      },
    ],
  };

  categorySummary.value = finalDonut.map((c, i) => ({
    ...c,
    percent: currentTotal > 0 ? Math.round((c.amount / currentTotal) * 100) : 0,
    color: colors[i],
  }));
};

onMounted(fetchData);

const currentMonthTitle = computed(() => {
  return `${currentDate.value.getFullYear()}년 ${String(currentDate.value.getMonth() + 1).padStart(2, '0')}월`;
});

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart) => {
    const {
      ctx,
      chartArea: { top, width, height },
    } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 1.1rem sans-serif';
    ctx.fillStyle = '#bbbbbb';
    ctx.fillText('총 지출액', width / 2, top + height / 2 - 22);
    ctx.font = 'bold 2rem sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `${totalMonthlyExpense.value.toLocaleString()}원`,
      width / 2,
      top + height / 2 + 18,
    );
    ctx.restore();
  },
};
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="profile-merge-area"></div>
    </header>

    <main v-if="isLoaded" class="dashboard-grid">
      <section class="card full-width">
        <div class="card-header">
          <div class="title-group">
            <h3>월별 지출 및 수입</h3>
            <p class="sub-info">최근 4개월간의 자산 흐름</p>
          </div>

          <div class="header-controls">
            <div class="month-nav">
              <button @click="changeMonth(-1)" class="nav-btn">◀</button>
              <span class="nav-month">{{ currentMonthTitle }}</span>
              <button @click="changeMonth(1)" class="nav-btn">▶</button>
            </div>
          </div>
        </div>
        <div class="chart-container bar-height">
          <BarChart :chart-data="barData" :options="barOptions" />
        </div>
      </section>

      <section class="card bottom-half">
        <div class="card-header">
          <div class="title-group">
            <h3>카테고리별 지출</h3>
            <p class="highlight-month">{{ currentMonthTitle }} 기준</p>
          </div>
        </div>
        <div class="chart-container donut-height">
          <Doughnut
            :data="doughnutData"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }"
            :plugins="[centerTextPlugin]"
          />
        </div>
      </section>

      <section class="card bottom-half">
        <div class="card-header">
          <h3>지출 상세 내역</h3>
        </div>
        <ul class="detail-list">
          <li v-for="item in categorySummary" :key="item.name">
            <span class="dot" :style="{ background: item.color }"></span>
            <span class="category-name">{{ item.name }}</span>
            <div class="value-group">
              <span class="value-percent">{{ item.percent }}%</span>
              <span class="value-amount"
                >{{ item.amount.toLocaleString() }}원</span
              >
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  background: #000;
  color: #fff;
  min-height: 100vh;
  padding: 40px 50px;
  font-family: 'Pretendard', sans-serif;
}

/* 헤더 여백 조정 */
.dashboard-header {
  height: 40px;
  margin-bottom: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}
.full-width {
  grid-column: 1 / 3;
}
.bottom-half {
  grid-column: span 1;
}

.card {
  background: #121212;
  border-radius: 32px;
  padding: 40px;
  border: 1px solid #222;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

.card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.sub-info {
  font-size: 1rem;
  color: #888;
  margin-top: 6px;
}

/* 월 네비게이션 스타일 강화 */
.header-controls {
  display: flex;
  align-items: center;
}
.month-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #1a1a1a;
  padding: 10px 22px;
  border-radius: 16px;
  border: 1px solid #333;
}
.nav-btn {
  background: none;
  color: #f8a70c;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}
.nav-month {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.chart-container {
  position: relative;
  width: 100%;
}
.bar-height {
  height: 380px;
}
.donut-height {
  height: 320px;
}

/* 리스트 가독성 강화 */
.detail-list {
  list-style: none;
  padding: 0;
}
.detail-list li {
  display: flex;
  align-items: center;
  padding: 25px 0;
  border-bottom: 1px solid #222;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 22px;
}
.category-name {
  font-size: 1.3rem;
  font-weight: 600;
  flex: 1;
  color: #efefef;
}
.value-percent {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.value-amount {
  font-size: 1.1rem;
  color: #999;
}
.highlight-month {
  font-size: 1.2rem;
  color: #f8a70c;
  font-weight: 700;
  margin-top: 8px;
}
</style>
