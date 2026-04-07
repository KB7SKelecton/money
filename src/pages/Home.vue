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
import { ref, computed } from 'vue';

// --- 데이터 (실제로는 fetch/axios로 db.json을 가져옵니다) ---
const db = {
  users: [
    {
      nickname: '오죠사마',
      profile_image_url:
        'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTAyMTRfMTgy%2FMDAxNzM5NTQxNzA1NDQ0.RfZH9MCSEaJCDutt8GVQHk0ndqVLcWKBLE9UUxKHb8Qg.bZb_3iKvCHLlk6JvjTKCgMSyht4ETwjcudBcy0fTHzYg.PNG%2Fimage.png&type=sc960_832',
    },
  ],
  categories: [
    { id: 1, name: '행정' },
    { id: 2, name: '교육' },
    { id: 3, name: '교통' },
    { id: 4, name: '쇼핑' },
    { id: 5, name: '여행' },
    { id: 6, name: '음식' },
    { id: 7, name: '편의' },
    { id: 8, name: '비즈니스' },
  ],
  transactions: [
    {
      id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 300000,
      transaction_date: '2026-04-01',
      memo: '외주 프로젝트 1차 정산금',
    },
    {
      id: 2,
      category_id: 6,
      type: 'EXPENSE',
      amount: 12000,
      transaction_date: '2026-04-01',
      memo: '점심 김밥과 라면',
    },
    {
      id: 3,
      user_id: 1,
      category_id: 3,
      type: 'EXPENSE',
      amount: 1450,
      transaction_date: '2026-04-01',
      memo: '버스비',
    },
    {
      id: 4,
      user_id: 1,
      category_id: 7,
      type: 'EXPENSE',
      amount: 2800,
      transaction_date: '2026-04-02',
      memo: '편의점 물과 과자',
    },
    {
      id: 5,
      user_id: 1,
      category_id: 2,
      type: 'EXPENSE',
      amount: 50000,
      transaction_date: '2026-04-03',
      memo: '온라인 강의 결제',
    },
    {
      id: 6,
      user_id: 1,
      category_id: 4,
      type: 'EXPENSE',
      amount: 39000,
      transaction_date: '2026-04-03',
      memo: '반팔 티셔츠 구매',
    },
    {
      id: 7,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 150000,
      transaction_date: '2026-04-05',
      memo: '디자인 수정 작업 비용',
    },
    {
      id: 8,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 18000,
      transaction_date: '2026-04-05',
      memo: '저녁 파스타',
    },
    {
      id: 9,
      user_id: 1,
      category_id: 1,
      type: 'EXPENSE',
      amount: 10000,
      transaction_date: '2026-04-06',
      memo: '증명서 발급 수수료',
    },
    {
      id: 10,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 50000,
      transaction_date: '2026-04-06',
      memo: '자료 조사 보조 수입',
    },
    {
      id: 11,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 9000,
      transaction_date: '2026-04-07',
      memo: '아침 샌드위치',
    },
    {
      id: 12,
      user_id: 1,
      category_id: 3,
      type: 'EXPENSE',
      amount: 1450,
      transaction_date: '2026-04-07',
      memo: '지하철비',
    },
    {
      id: 13,
      user_id: 1,
      category_id: 7,
      type: 'EXPENSE',
      amount: 4200,
      transaction_date: '2026-04-07',
      memo: '편의점 커피',
    },
    {
      id: 14,
      user_id: 1,
      category_id: 5,
      type: 'EXPENSE',
      amount: 120000,
      transaction_date: '2026-04-10',
      memo: '주말 기차 여행 경비',
    },
    {
      id: 15,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 22000,
      transaction_date: '2026-04-10',
      memo: '여행 중 식사',
    },
    {
      id: 16,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 200000,
      transaction_date: '2026-04-12',
      memo: '프로젝트 중간 정산',
    },
    {
      id: 17,
      user_id: 1,
      category_id: 4,
      type: 'EXPENSE',
      amount: 65000,
      transaction_date: '2026-04-14',
      memo: '운동화 구매',
    },
    {
      id: 18,
      user_id: 1,
      category_id: 2,
      type: 'EXPENSE',
      amount: 30000,
      transaction_date: '2026-04-15',
      memo: '스터디 교재 구매',
    },
    {
      id: 19,
      user_id: 1,
      category_id: 1,
      type: 'EXPENSE',
      amount: 25000,
      transaction_date: '2026-04-18',
      memo: '서류 제출 관련 비용',
    },
    {
      id: 20,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 450000,
      transaction_date: '2026-04-20',
      memo: '외주 프로젝트 최종 정산',
    },
    {
      id: 21,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 16000,
      transaction_date: '2026-04-20',
      memo: '점심 초밥',
    },
    {
      id: 22,
      user_id: 1,
      category_id: 3,
      type: 'EXPENSE',
      amount: 1450,
      transaction_date: '2026-04-20',
      memo: '버스 환승',
    },
    {
      id: 23,
      user_id: 1,
      category_id: 7,
      type: 'EXPENSE',
      amount: 5300,
      transaction_date: '2026-04-22',
      memo: '편의점 간식',
    },
    {
      id: 24,
      user_id: 1,
      category_id: 4,
      type: 'EXPENSE',
      amount: 27000,
      transaction_date: '2026-04-23',
      memo: '생활용품 쇼핑',
    },
    {
      id: 25,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 100000,
      transaction_date: '2026-04-25',
      memo: '문서 작업 단기 수입',
    },
    {
      id: 26,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 13000,
      transaction_date: '2026-04-25',
      memo: '저녁 국밥',
    },
    {
      id: 27,
      user_id: 1,
      category_id: 5,
      type: 'EXPENSE',
      amount: 40000,
      transaction_date: '2026-04-27',
      memo: '당일치기 나들이 비용',
    },
    {
      id: 28,
      user_id: 1,
      category_id: 2,
      type: 'EXPENSE',
      amount: 20000,
      transaction_date: '2026-04-28',
      memo: '세미나 참가비',
    },
    {
      id: 29,
      user_id: 1,
      category_id: 1,
      type: 'EXPENSE',
      amount: 8000,
      transaction_date: '2026-04-29',
      memo: '행정 처리 소액 수수료',
    },
    {
      id: 30,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 250000,
      transaction_date: '2026-04-30',
      memo: '콘텐츠 제작 협업 수입',
    },
    {
      id: 31,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 17000,
      transaction_date: '2026-04-30',
      memo: '월말 외식',
    },
    {
      id: 32,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 180000,
      transaction_date: '2026-05-02',
      memo: '5월 초 단기 프로젝트 수입',
    },
    {
      id: 33,
      user_id: 1,
      category_id: 6,
      type: 'EXPENSE',
      amount: 11000,
      transaction_date: '2026-05-02',
      memo: '점심 비빔밥',
    },
    {
      id: 34,
      user_id: 1,
      category_id: 3,
      type: 'EXPENSE',
      amount: 1450,
      transaction_date: '2026-05-02',
      memo: '버스 이용',
    },
    {
      id: 35,
      user_id: 1,
      category_id: 4,
      type: 'EXPENSE',
      amount: 54000,
      transaction_date: '2026-05-04',
      memo: '가방 구매',
    },
    {
      id: 36,
      user_id: 1,
      category_id: 2,
      type: 'EXPENSE',
      amount: 45000,
      transaction_date: '2026-05-05',
      memo: '자격증 응시료',
    },
    {
      id: 37,
      user_id: 1,
      category_id: 8,
      type: 'INCOME',
      amount: 220000,
      transaction_date: '2026-05-06',
      memo: '고객 요청 작업 정산',
    },
    {
      id: 38,
      user_id: 1,
      category_id: 7,
      type: 'EXPENSE',
      amount: 3500,
      transaction_date: '2026-05-06',
      memo: '편의점 음료',
    },
    {
      id: 39,
      user_id: 1,
      category_id: 5,
      type: 'EXPENSE',
      amount: 95000,
      transaction_date: '2026-05-08',
      memo: '주말 여행 숙박 예약',
    },
    {
      id: 40,
      user_id: 1,
      category_id: 1,
      type: 'EXPENSE',
      amount: 15000,
      transaction_date: '2026-05-09',
      memo: '민원 관련 발급 비용',
    },
  ],
};

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
