<template>
  <div class="main-layout">
    <nav class="header-bar">
      <div class="logo">💰 My Wallet</div>
      <div class="user-info" v-if="userData">
        <img :src="userData.profile_image_url" class="profile-img" />
        <span>{{ userData.nickname }}님 환영합니다</span>
      </div>
    </nav>

    <div class="content-wrapper">
      <main class="calendar-container">
        <header class="calendar-control">
          <button @click="changeMonth(-1)" class="nav-btn">◀</button>
          <h2 class="current-month">
            {{ currentYear }}년 {{ currentMonth + 1 }}월
          </h2>
          <button @click="changeMonth(1)" class="nav-btn">▶</button>
          <button @click="goToday" class="today-btn">오늘</button>
        </header>

        <div class="calendar-grid">
          <div v-for="day in weekDays" :key="day" class="day-label">
            {{ day }}
          </div>

          <div
            v-for="(date, index) in calendarDates"
            :key="index"
            class="date-cell"
            :class="{
              'not-current': !date.isCurrentMonth,
              'is-today': date.isToday,
              selected: selectedDate?.dateString === date.dateString,
            }"
            @click="date.isCurrentMonth && showDetails(date)"
          >
            <span class="date-num">{{ date.day }}</span>

            <div
              v-if="date.isCurrentMonth && date.totalIncome"
              class="cell-income"
            >
              +{{ formatSmall(date.totalIncome) }}
            </div>
            <div
              v-if="date.isCurrentMonth && date.totalExpense"
              class="cell-expense"
            >
              -{{ formatSmall(date.totalExpense) }}
            </div>
          </div>
        </div>
      </main>

      <aside class="side-bar">
        <h3>📅 상세 내역</h3>
        <div v-if="selectedDate" class="detail-content">
          <p class="detail-date">{{ selectedDate.dateString }}</p>

          <div class="transaction-list">
            <div
              v-for="t in selectedDate.transactions"
              :key="t.id"
              class="t-item"
            >
              <div class="t-main">
                <span class="t-cat">{{ getCategoryName(t.category_id) }}</span>
                <span class="t-memo">{{ t.memo }}</span>
              </div>
              <div :class="['t-amount', t.type.toLowerCase()]">
                {{ t.type === 'INCOME' ? '+' : '-'
                }}{{ t.amount.toLocaleString() }}
              </div>
            </div>
            <div
              v-if="selectedDate.transactions.length === 0"
              class="empty-msg"
            >
              내역이 없습니다.
            </div>
          </div>

          <div class="detail-footer" v-if="selectedDate.transactions.length">
            <div class="footer-row">
              <span>총 수입</span
              ><span class="income"
                >+{{ selectedDate.totalIncome.toLocaleString() }}</span
              >
            </div>
            <div class="footer-row">
              <span>총 지출</span
              ><span class="expense"
                >-{{ selectedDate.totalExpense.toLocaleString() }}</span
              >
            </div>
          </div>
        </div>
        <div v-else class="empty-msg">날짜를 선택해 주세요.</div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const db = ref({ users: [], categories: [], transactions: [] });

onMounted(async () => {
  try {
    const response = await fetch('/db.json'); // public 폴더 기준
    db.value = await response.json();
    console.log('데이터 로드 완료:', db.value);
  } catch (error) {
    console.error('데이터를 불러오는데 실패했습니다:', error);
  }
});

// --- 데이터 (실제로는 fetch/axios로 db.json을 가져옵니다) ---

// --- 상태 관리 ---
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());
const selectedDate = ref(null);
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const userData = db.users[0];

// --- 로직 ---
const getCategoryName = (id) =>
  db.categories.find((c) => c.id === id)?.name || '기타';
const formatSmall = (num) =>
  num >= 1000 ? (num / 1000).toFixed(0) + 'k' : num;

const calendarDates = computed(() => {
  const dates = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDayOfWeek = firstDay.getDay();

  // 이전 달 채우기
  const prevLastDay = new Date(
    currentYear.value,
    currentMonth.value,
    0,
  ).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    dates.push({ day: prevLastDay - i, isCurrentMonth: false });
  }

  // 이번 달 채우기
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayTransactions = db.transactions.filter(
      (t) => t.transaction_date === dateStr,
    );

    const income = dayTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    dates.push({
      day: i,
      dateString: dateStr,
      isCurrentMonth: true,
      isToday:
        currentYear.value === today.getFullYear() &&
        currentMonth.value === today.getMonth() &&
        i === today.getDate(),
      transactions: dayTransactions,
      totalIncome: income,
      totalExpense: expense,
    });
  }
  return dates;
});

const changeMonth = (val) => {
  currentMonth.value += val;
  if (currentMonth.value > 11) {
    currentYear.value++;
    currentMonth.value = 0;
  } else if (currentMonth.value < 0) {
    currentYear.value--;
    currentMonth.value = 11;
  }
};

const goToday = () => {
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth();
};

const showDetails = (date) => {
  selectedDate.value = date;
};
</script>

<style scoped>
/* 레이아웃 깨짐 방지 핵심 스타일 */
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: sans-serif;
}

.header-bar {
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #ddd;
}

.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden; /* 전체 스크롤 방지 */
}

.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 20px;
}

.calendar-control {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr); /* 셀 높이 균등 배분 */
  border-top: 1px solid #eee;
  border-left: 1px solid #eee;
  flex: 1;
}

.day-label {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  background: #fafafa;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.date-cell {
  padding: 5px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  flex-direction: column;
}

.date-cell:hover {
  background: #f0f7ff;
}
.date-cell.selected {
  background: #e6f7ff;
  border: 1px solid #1890ff;
}
.not-current {
  color: #ccc;
  background: #fcfcfc;
}
.is-today .date-num {
  color: #ff4d4f;
  font-weight: bold;
  text-decoration: underline;
}

.cell-income {
  color: #52c41a;
  font-size: 0.7rem;
  text-align: right;
}
.cell-expense {
  color: #ff4d4f;
  font-size: 0.7rem;
  text-align: right;
}

/* 사이드바 스타일 */
.side-bar {
  width: 350px;
  background: #fff;
  border-left: 1px solid #ddd;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.detail-date {
  font-weight: bold;
  color: #666;
  margin-bottom: 15px;
}
.transaction-list {
  flex: 1;
  overflow-y: auto;
}
.t-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.t-cat {
  font-size: 0.7rem;
  color: #999;
  display: block;
}
.t-memo {
  font-size: 0.9rem;
}
.t-amount {
  font-weight: bold;
}
.income {
  color: #52c41a;
}
.expense {
  color: #ff4d4f;
}

.detail-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #eee;
}
.footer-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.empty-msg {
  color: #ccc;
  text-align: center;
  margin-top: 50px;
}
</style>
