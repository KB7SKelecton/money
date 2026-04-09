<template>
  <!-- 상단 네비게이션 및 유저 정보 -->
  <div class="main-layout">
    <nav class="header-bar">
      <div class="logo">홈/달력</div>
    </nav>

    <!-- 달력 컨트롤러 -->
    <div class="content-wrapper">
      <main class="calendar-container">
        <!-- 잔고, 수입, 지출창 -->
        <div class="mypage-balance">
          <span class="balance-label"></span>
          <span class="balance-amount"
            >잔고 : {{ totalBalance.toLocaleString() }}원</span
          >

          <section class="summary-container">
            <div class="mypage-balance income-box">
              <span class="balance-label">월 수입</span>
              <span class="balance-amount">
                + {{ totalMonthlyIncome.toLocaleString() }}원
              </span>
            </div>

            <div class="mypage-balance expense-box">
              <span class="balance-label">월 지출</span>
              <span class="balance-amount">
                - {{ totalMonthlyExpense.toLocaleString() }}원
              </span>
            </div>

            <div class="mypage-balance total-box">
              <span class="balance-label">월 통계</span>
              <span class="balance-amount">
                {{ totalMonthlyIncome - totalMonthlyExpense >= 0 ? '+' : '' }}
                {{
                  (totalMonthlyIncome - totalMonthlyExpense).toLocaleString()
                }}원
              </span>
            </div>
          </section>

          <!-- 잔고창 끝 달력의 시작 -->
        </div>
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
import { ref, computed, onMounted } from 'vue';
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
const balance = ref(0);

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/users/1');
  balance.value = res.data.initial_balance;
});
const totalMonthlyIncome = computed(() => {
  return db.transactions
    .filter((t) => {
      const d = new Date(t.transaction_date);
      return (
        d.getFullYear() === currentYear.value &&
        d.getMonth() === currentMonth.value &&
        t.type === 'INCOME'
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
});

// 현재 달력에 표시된 월의 총 지출 합산
const totalMonthlyExpense = computed(() => {
  return db.transactions
    .filter((t) => {
      const d = new Date(t.transaction_date);
      return (
        d.getFullYear() === currentYear.value &&
        d.getMonth() === currentMonth.value &&
        t.type === 'EXPENSE'
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
});

// ... 기존 상수(today, currentYear 등) 동일 ...

const initialBalance = ref(0);

// API로는 오직 사용자의 "기본 시작 금액"만 가져옵니다.
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/users/1');
    initialBalance.value = res.data.initial_balance;
  } catch (err) {
    console.error(err);
  }
});

/**
 * [수정된 부분] 실시간 잔고 계산
 * initial_balance(시작 금액) + 모든 수입 - 모든 지출
 */
const totalBalance = computed(() => {
  const totalChange = db.transactions.reduce((acc, t) => {
    return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
  }, 0);
  return initialBalance.value + totalChange;
});

// ... 기존의 totalMonthlyIncome, totalMonthlyExpense 등은 그대로 유지 ...
</script>

<style scoped>
/* 전체 레이아웃: 다크 모드 테마 적용 및 전체 화면 높이 설정 */
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #131313; /* 더 깊은 블랙으로 변경 */
  color: #e5e2e1;
  font-family: 'Manrope', 'Pretendard', sans-serif;
}

/* 헤더: 투명도와 보더 라인 조정 */
.header-bar {
  height: 4rem;
  background: #131313;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 10;
}

.logo {
  font-size: 1.4rem;
  font-weight: 900;
  color: #e5e2e1;
  /* font-style: italic; */
  letter-spacing: -0.05em;
}

/* 프로필 이미지 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2a2a2a;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.profile-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #f8a70c;
}

/* 컨텐츠 영역 */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 캘린더 영역 */
.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #131313;
  padding: 10px 20px;
  overflow-y: auto;
}

/* 달력 상단 월 컨트롤러 */
.calendar-control {
  display: flex;
  justify-content: flex-start; /* 왼쪽 정렬로 변경하여 세련미 강조 */
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.current-month {
  font-size: 1.4rem;
  font-weight: 800;
  color: #e5e2e1;
  letter-spacing: -0.02em;
}

.nav-btn {
  background: #2a2a2a;
  color: #e5e2e1;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #353534;
}

.today-btn {
  margin-left: auto;
  padding: 6px 16px;
  background: #2a2a2a;
  color: #e5e2e1;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* 캘린더 그리드 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr);
  grid-auto-rows: minmax(50px, auto);
  background: rgba(255, 255, 255, 0.05); /* 격자 선 역할 */
  gap: 1px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1px;
  overflow: hidden;
}

/* (보너스) 상단 월 컨트롤러 마진 고정 */
.calendar-control {
  height: 40px; /* 컨트롤러 영역도 높이 고정 */
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 요일 라벨 */
.day-label {
  padding: 16px 0;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  background: #1c1b1b;
  color: #e5e2e1;
}

.day-label:first-child {
  color: #ffb4ab;
} /* 일요일 */
.day-label:last-child {
  color: #ffd483;
} /* 토요일 */

/* 개별 날짜 칸 스타일 */
.date-cell {
  min-height: 120px;
  padding: 6px;
  background: #131313;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-cell:hover {
  background: #1c1b1b;
}

/* 선택된 날짜 강조 */
.date-cell.selected {
  background: rgba(248, 167, 12, 0.05);
  box-shadow: inset 0 0 0 2px #f8a70c;
  z-index: 1;
}

/* 날짜 숫자 */
.date-num {
  font-size: 1.2rem;
  font-weight: 500;
  color: #f8a70c;
}

/* 오늘 날짜 강조 */
.is-today .date-num {
  background-color: #f8a70c;
  color: #131313;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 800;
}

.not-current {
  opacity: 0.2;
}

/* 수입/지출 태그 */
.cell-income {
  font-size: 1rem;
  font-weight: 700;
  color: #81c784; /* 부드러운 초록 */
  background: rgba(129, 199, 132, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.cell-expense {
  font-size: 16px;
  font-weight: 700;
  color: #ffb4ab; /* 부드러운 레드 */
  background: rgba(255, 180, 171, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

/* 사이드바: 우측 패널 */
.side-bar {
  width: 360px;
  background: #131313;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
}

.side-bar h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #e5e2e1;
  margin-bottom: 24px;
}

.detail-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(229, 226, 225, 0.6);
  margin-bottom: 20px;
}

.transaction-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.t-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #201f1f;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.t-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.t-cat {
  font-size: 0.65rem;
  font-weight: 800;
  color: #f8a70c;
  text-transform: uppercase;
}

.t-memo {
  font-size: 0.95rem;
  font-weight: 500;
  color: #e5e2e1;
}

.t-amount {
  font-size: 1rem;
  font-weight: 800;
}

.t-amount.income {
  color: #81c784;
}
.t-amount.expense {
  color: #ffb4ab;
}

.detail-footer {
  margin-top: auto;
  padding: 20px;
  background: #2a2a2a;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.footer-row span:first-child {
  color: rgba(229, 226, 225, 0.5);
}
.footer-row .income {
  color: #81c784;
  font-weight: 700;
}
.footer-row .expense {
  color: #ffb4ab;
  font-weight: 700;
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 64px;
  height: 64px;
  background: #f8a70c;
  color: #452b00;
  border-radius: 20px; /* 약간 각진 조약돌 모양 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(248, 167, 12, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 2rem;
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  background: #ffca82;
}

.empty-msg {
  color: rgba(229, 226, 225, 0.2);
  text-align: center;
  margin-top: 60px;
  font-size: 0.875rem;
  line-height: 1.6;
}
.mypage-balance {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 8px 12px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
  height: 100%;
  min-width: 0; /* flex box 안에서 텍스트에 의해 늘어나는 것 방지 */
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
  flex: 1;
}
.summary-container {
  display: flex;
  gap: 8px;
  padding: 10px 0;
  flex-wrap: nowrap;
  width: 100%;
  height: 80px; /* 높이를 고정하여 달력을 밀어내지 않게 함 */
  box-sizing: border-box;
  flex-shrink: 0;
}

.balance-label {
  font-size: 1.4rem;
  color: #f8a70c;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
}

.balance-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e5e2e1;
  white-space: nowrap; /* 줄바꿈 금지 */
  overflow: hidden; /* 넘치는 부분 숨김 */
  text-overflow: ellipsis; /* 너무 길면 ... 처리 */
  width: 100%;
}
.summary-container {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  flex-wrap: nowrap; /* 화면이 좁아지면 아래로 내려가도록 */
}

/* 공통 카드 스타일 (기존 제공해주신 스타일 기반) */
.mypage-balance {
  background-color: #2a2a2a;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1; /* 3개가 동일한 너비를 가짐 */
  min-width: 100px; /* 너무 작아지지 않게 제한 */
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.balance-label {
  font-size: 0.8rem;
  color: #f8a70c; /* 기본 노란색 */
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
}

.balance-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #e5e2e1;
  white-space: nowrap;
}

/* 수입 강조 (초록빛/파란빛) */
.income-box .balance-label {
  color: #81c784;
  font-size: 1rem;
}
.income-box .balance-amount {
  color: #81c784;
  font-size: 1rem;
}

/* 지출 강조 (노란색/주황색) */
.expense-box .balance-label {
  color: #ffb4ab;
  font-size: 1rem;
}
.expense-box .balance-amount {
  color: #ffb4ab;
  font-size: 1rem;
}

/* 통합창 강조 (이미지처럼 배경색 반전 효과 가능) */
.total-box {
  background-color: #f8a70c; /* 배경을 노란색으로 */
}
.total-box .balance-label {
  color: #1a1c1e;
  font-size: 1rem;
}
.total-box .balance-amount {
  color: #1a1c1e;
  font-size: 1rem;
}

/* 반응형 웹 767px 기준 */
@media (max-width: 1024px) {
  /* 1. 사이드바를 숨기지 않고 아래로 보냄 */
  .content-wrapper {
    flex-direction: column; /* 가로 배열에서 세로 배열로 변경 */
    overflow-y: auto; /* 전체적으로 스크롤이 생기도록 설정 */
  }

  /* 2. 달력 영역 높이 조절 */
  .calendar-container {
    flex: none; /* 고정 높이를 가지도록 설정 */
    height: auto;
    padding: 8px;
  }

  /* 3. 사이드바(상세내역) 스타일 변경 */
  .side-bar {
    width: 100%; /* 가로 길이를 전체로 확장 */
    border-left: none; /* 기존 왼쪽 테두리 제거 */
    border-top: 1px solid rgba(255, 255, 255, 0.05); /* 상단 구분선 추가 */
    padding: 20px;
    background: #1a1a1a; /* 달력과 약간의 색상 차이를 두어 구분감 생성 */
    min-height: 300px; /* 내용이 보일 수 있는 최소 높이 확보 */
  }

  /* 4. 달력 그리드 최적화 (가로 잘림 방지) */
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    width: 100%;
  }

  .date-num {
    font-size: 0.8rem;
    font-weight: 500;
    color: #f8a70c;
  }

  .date-cell {
    min-height: 70px; /* 세로로 길어지므로 셀 높이를 적당히 줄임 */
  }

  /* 5. 요일(일~토) 라벨 크기 축소 */
  .day-label {
    padding: 10px 0;
    font-size: 0.8rem; /* 글자 크기를 줄여서 칸이 안 깨지게 함 */
  }

  /* 5. 금액 폰트 미세 조정 */
  .cell-income,
  .cell-expense {
    font-size: 0.35rem;
    letter-spacing: -0.5px;
  }
  .income-box .balance-label {
    color: #81c784;
    font-size: 0.8rem;
  }
  .income-box .balance-amount {
    color: #81c784;
    font-size: 0.8rem;
  }
  .expense-box .balance-label {
    color: #ffb4ab;
    font-size: 0.8rem;
  }
  .expense-box .balance-amount {
    color: #ffb4ab;
    font-size: 0.8rem;
  }
  .total-box .balance-label {
    color: #1a1c1e;
    font-size: 0.8rem;
  }
  .total-box .balance-amount {
    color: #1a1c1e;
    font-size: 0.8rem;
  }
}
</style>
