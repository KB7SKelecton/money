<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
);

const isLoaded = ref(false);
const rawData = ref({ transactions: [], categories: [] });
const currentDate = ref(new Date(2026, 3, 8));

const colors = ["#f8a70c", "#fab809", "#6e6053", "#8b7e74", "#4a443f"];

const fetchData = async () => {
  try {
    const response = await axios.get("http://localhost:3000/db");
    rawData.value = response.data;
    isLoaded.value = true;
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
};

onMounted(fetchData);

const dashboardData = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const monthlyMap = {};
  for (let i = 3; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}월`;
    monthlyMap[key] = { income: 0, expense: 0 };
  }

  rawData.value.transactions.forEach((t) => {
    const d = new Date(t.transaction_date);
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}월`;
    if (monthlyMap[key]) {
      if (t.type === "INCOME") monthlyMap[key].income += t.amount;
      else monthlyMap[key].expense += t.amount;
    }
  });

  const barLabels = Object.keys(monthlyMap);
  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: "수입",
        backgroundColor: "#f8a70c",
        data: barLabels.map((m) => monthlyMap[m].income),
        borderRadius: 8,
        barThickness: 45,
      },
      {
        label: "지출",
        backgroundColor: "#6e6053",
        data: barLabels.map((m) => monthlyMap[m].expense),
        borderRadius: 8,
        barThickness: 45,
      },
    ],
  };

  const currentTransactions = rawData.value.transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return (
      d.getFullYear() === year && d.getMonth() === month && t.type === "EXPENSE"
    );
  });

  const expenseByCat = {};
  rawData.value.categories.forEach(
    (c) => (expenseByCat[c.id] = { name: c.name, amount: 0 }),
  );

  let total = 0;
  currentTransactions.forEach((t) => {
    if (expenseByCat[t.category_id]) {
      expenseByCat[t.category_id].amount += t.amount;
      total += t.amount;
    }
  });

  const sortedList = Object.values(expenseByCat)
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((item, idx) => ({
      ...item,
      percent: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      color: colors[idx % colors.length],
    }));

  const doughnutChartData = {
    labels: sortedList.map((i) => i.name),
    datasets: [
      {
        data: sortedList.map((i) => i.amount),
        backgroundColor: sortedList.map((i) => i.color),
        cutout: "80%",
        borderWidth: 0,
      },
    ],
  };

  return { barChartData, doughnutChartData, total, sortedList };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      align: "end",
      labels: {
        color: "#ffffff",
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 10, weight: "400" },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#bbbbbb", font: { size: 14, weight: "600" } },
    },
    y: { display: false },
  },
};

const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    const {
      ctx,
      chartArea: { top, width, height },
    } = chart;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "600 1.2rem sans-serif";
    ctx.fillText("총 지출액", width / 2, top + height / 2 - 25);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 2.2rem sans-serif"; // 금액 폰트 대폭 확대
    ctx.fillText(
      `${dashboardData.value.total.toLocaleString()}원`,
      width / 2,
      top + height / 2 + 20,
    );
    ctx.restore();
  },
};

const changeMonth = (offset) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + offset);
  currentDate.value = newDate;
};
</script>

<template>
  <div v-if="isLoaded" class="dashboard-container">
    <section class="card bar-section">
      <div class="card-header">
        <div class="title-group">
          <h3>월별 지출 및 수입</h3>
          <p class="subtitle">최근 4개월간의 자산 흐름</p>
        </div>
        <div class="month-nav">
          <button @click="changeMonth(-1)" class="nav-btn">◀</button>
          <span class="nav-date"
            >{{ currentDate.getFullYear() }}년
            {{ String(currentDate.getMonth() + 1).padStart(2, "0") }}월</span
          >
          <button @click="changeMonth(1)" class="nav-btn">▶</button>
        </div>
      </div>
      <div class="chart-content main-bar">
        <Bar :data="dashboardData.barChartData" :options="barOptions" />
      </div>
    </section>

    <div class="bottom-grid">
      <section class="card doughnut-section">
        <div class="card-header">
          <div class="title-group">
            <h3>카테고리별 지출</h3>
            <p class="highlight">
              {{ currentDate.getFullYear() }}년
              {{ String(currentDate.getMonth() + 1).padStart(2, "0") }}월 기준
            </p>
          </div>
        </div>
        <div class="chart-content donut-box">
          <Doughnut
            :data="dashboardData.doughnutChartData"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }"
            :plugins="[centerTextPlugin]"
          />
        </div>
      </section>

      <section class="card list-section">
        <div class="card-header">
          <h3>지출 상세 내역</h3>
        </div>
        <ul class="detail-list">
          <li v-for="item in dashboardData.sortedList" :key="item.name">
            <div class="list-left">
              <span class="dot" :style="{ backgroundColor: item.color }"></span>
              <span class="cat-name">{{ item.name }}</span>
            </div>
            <div class="list-right">
              <span class="percent">{{ item.percent }}%</span>
              <span class="amount">{{ item.amount.toLocaleString() }}원</span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
  <div v-else class="loading-state">데이터를 불러오는 중입니다...</div>
</template>

<style scoped>
/* 전체 폰트 및 가독성 향상 스타일 */
.dashboard-container {
  background-color: #000;
  color: #fff;
  padding: 2px 0px;
  margin: 10px 0px;
  font-family: "Pretendard", sans-serif;
}

/* 기본 스타일 (데스크탑) */
.container {
  display: flex;
  flex-direction: row; /* 가로 정렬 */
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.card {
  background-color: #121212;
  border-radius: 32px;
  padding: 20px;
  border: 1px solid #222;
  margin-bottom: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

/* 텍스트 크기 강화 */
h3 {
  font-size: 1.05rem;
  margin: 0;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}
.subtitle {
  color: #888;
  font-size: 0.7rem;
  margin-top: 4px;
  font-weight: 500;
}
.highlight {
  color: #888;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 4px;
}

/* 네비게이션 가독성 */
.month-nav {
  background: #1a1a1a;
  padding: 12px 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #333;
}
.nav-btn {
  background: none;
  border: none;
  color: #f8a70c;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}
.nav-date {
  font-weight: 500;
  font-size: 0.88rem;
  color: #fff;
}

/* 차트 높이 고정 */
.main-bar {
  height: 350px;
}
.donut-box {
  height: 320px;
}
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

/* 상세 내역 리스트 가독성 (대폭 강화) */
.detail-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 0;
  border-bottom: 1px solid #222;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.cat-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #efefef;
}
.percent {
  display: block;
  font-size: 0.9rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 4px;
}
.amount {
  font-size: 0.9rem;
  color: #999;
  font-weight: 500;
}

.loading-state {
  color: #f8a70c;
  text-align: center;
  padding: 100px;
  font-size: 1.5rem;
}

/* Chart.vue <style scoped> 최하단에 추가 */
/* 태블릿 및 작은 모니터 (1024px) */
@media (max-width: 1024px) {
  .bottom-grid {
    grid-template-columns: 1fr; /* 2열에서 1열로 변경 (중요!) */
    gap: 20px;
  }

  .card {
    padding: 25px; /* 카드 내부 여백을 줄여 가독성 향상 */
    border-radius: 20px;
  }

  .main-bar {
    height: 300px; /* 차트 높이 최적화 */
  }

  .donut-box {
    height: 280px;
  }
}

@media (max-width: 768px) {
  /* 1. 헤더 영역을 세로로 정렬 (제목과 네비게이션 버튼) */
  .card-header {
    flex-direction: column;
    align-items: flex-start; /* 왼쪽 정렬 (가운데 정렬 원하면 center) */
    gap: 20px; /* 제목과 버튼 사이 간격 */
  }

  /* 2. 네비게이션 바 너비를 100%로 채우기 (선택 사항) */
  .month-nav {
    width: 100%;
    justify-content: space-between; /* 화살표를 양 끝으로 */
    box-sizing: border-box;
  }

  /* 기존 코드 유지 */
  .bottom-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .chart-content {
    height: 250px;
  }

  .card {
    padding: 20px;
  }
}

@media (max-width: 375px) {
  .detail-list li {
    padding: 14px 0; /* 리스트 간격 조절 */
  }

  .amount {
    min-width: auto; /* 모바일에서 금액 너비 자동 조절 */
  }
}
</style>
