<template>
  <!-- 상단 네비게이션 및 유저 정보 -->
  <div class="main-layout">
    <nav class="header-bar">
      <div class="logo">💰 My Wallet</div>
      <div class="user-info" v-if="userData">
        <img :src="userData.profile_image_url" class="profile-img" />
        <span>{{ userData.nickname }}님 환영합니다</span>
      </div>
    </nav>

    <!-- 달력 컨트롤러 -->
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

        <!-- 달력 그리드 -->
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

      <!-- 오른쪽 사이드바 -->
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
import axios from 'axios';
import db from '../../db.json';

// 기본 상태 및 상수 설정
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());
const selectedDate = ref(null);
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 데이터 소스 연결
const userData = db.users[0];

// 유틸리티 함수
// 카테고리 ID를 넘기면 db.json의 categories에서 이름을 찾아 반환
// 이름이 없는 경우 '기타'로 기본값 처리
const getCategoryName = (id) =>
  db.categories.find((c) => c.id === id)?.name || '기타';
// 금액 포맷팅 함수
// 달력 내 금액 표기
const formatSmall = (num) => {
  return num.toLocaleString();
};

// 달력 날짜 생성 로직
const calendarDates = computed(() => {
  const dates = [];
  // 현재 보고 있는 달의 첫날과 마지막날 계산
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDayOfWeek = firstDay.getDay();

  // 이전 달 날짜 채우기
  // 달력 첫 줄에서 이번 달 시작 전 빈 칸을 이전 달 날짜로 채움
  const prevLastDay = new Date(
    currentYear.value,
    currentMonth.value,
    0,
  ).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    dates.push({ day: prevLastDay - i, isCurrentMonth: false });
  }

  // 이번 달 데이터 생성 및 거래 정보 매핑
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // 이 날짜에 해당하는 거래 내역만 필터링
    const dayTransactions = db.transactions.filter(
      (t) => t.transaction_date === dateStr,
    );

    // 해당 날짜의 총 수입 합산
    const income = dayTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    // 해당 날짜의 총 지출 합산
    const expense = dayTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // 최종 날짜 객체를 배열에 삽입
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

// 달력 컨트롤 이전달 다음달
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
// 오늘 클릭 시 현재 시점의 연/월로 복귀
const goToday = () => {
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth();
};
// 특정 날짜 클릭 시 해당 날짜의 객체를 selectedDate에 할당(오른쪽 사이드바)
const showDetails = (date) => {
  selectedDate.value = date;
};
</script>

<style scoped>
/* 전체 레이아웃: 다크 모드 테마 적용 및 전체 화면 높이 설정 */
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1c1e; /* bg-surface-container 대용 */
  color: #e2e2e6; /* text-on-surface */
  font-family: 'Pretendard', sans-serif;
}

/* 헤더: 투명도와 보더 라인 조정 */
.header-bar {
  height: 60px;
  background: #1a1c1e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 프로필 이미지 */
.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

/* 컨텐츠 영역 */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 캘린더 영역: 배경색을 surface 톤으로 */
.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1c1e;
  padding: 20px;
}

/* 달력 상단 월 컨트롤러 */
.calendar-control {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #f8a70c;
}

/* 캘린더 그리드: Material Design 스타일 보더 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  flex: 1;
}

/* 요일 라벨 */
.day-label {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #c4c6cf;
}

/* 개별 날짜 칸 스타일 */
.date-cell {
  padding: 8px;
  background: #212427; /* bg-surface-container */
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  text-align: left;
}

/* 마우스 호버 시 배경색 변경 */
.date-cell:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* 선택된 날짜 노란색 테두리와 투명 배경으로 강조 */
.date-cell.selected {
  background: rgba(248, 167, 12, 0.1); /* 포인트 컬러 투명도 */
  outline: 1px solid #f8a70c;
  z-index: 1;
}

/* 이전/다음 달 날짜 */
.not-current {
  color: rgba(255, 255, 255, 0.2);
}

/* 오늘 날짜 강조 */
.is-today .date-num {
  color: #f8a70c; /* primary-container 계열 강조색 */
  font-weight: bold;
}

/* 수입/지출 태그: HTML 샘플의 error-container 스타일 반영 */
.cell-income {
  margin-top: 4px;
  color: #ffffff; /* 지출과 대비되는 수입 컬러 */
  font-size: 10px;
  background: rgba(132, 212, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
}

/* 지출 요약 태그 노란색 */
.cell-expense {
  margin-top: 4px;
  color: #ffee03; /* text-error */
  font-size: 10px;
  background: rgba(255, 180, 171, 0.15); /* bg-error-container/20 */
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
}

/* 사이드바: 우측 패널 스타일 */
.side-bar {
  width: 320px;
  background: #1a1c1e;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 우측 하단 고정 추가 버튼 */
.detail-date {
  font-weight: bold;
  color: #f8a70c;
  margin-bottom: 20px;
}

.transaction-list {
  flex: 1;
  overflow-y: auto;
}

.t-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.t-cat {
  font-size: 0.75rem;
  color: #909094;
}

.t-memo {
  font-size: 0.9rem;
  color: #e2e2e6;
}

.t-amount {
  font-weight: bold;
}

.income {
  color: #ffffff;
}
.expense {
  color: #ffee03;
}

.detail-footer {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

/* Floating Action Button 스타일 */
.fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 64px;
  height: 64px;
  background: #f8a70c; /* bg-primary-container */
  color: #412d00; /* on-primary-container */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(248, 167, 12, 0.3);
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.fab:hover {
  transform: scale(1.1);
}

.empty-msg {
  color: rgba(255, 255, 255, 0.2);
  text-align: center;
  margin-top: 50px;
  font-style: italic;
  font-size: 0.8rem;
}
/* 월, 화, 수... 요일 레이블 */
.day-label {
  color: #f8a70c; /* 노란색 */
  font-weight: bold;
}

/* 1, 2, 3... 날짜 숫자 */
.date-cell {
  color: #f8a70c; /* 날짜 숫자 노란색 */
  /* 배경색이 너무 밝으면 글자가 안 보이니 어두운 배경 추천 */
  background-color: #212427;
}
.not-current {
  /* 노란색에 투명도를 30% 정도 섞음 */
  color: rgba(248, 167, 12, 0.3);
}
.is-today .date-num {
  background-color: #f8a70c; /* 배경을 노란색으로 */
  color: #1a1c1e; /* 글자는 어두운 색으로 */
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
</style>
