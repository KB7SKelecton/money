<template>
  <div class="list-screen">
    <!-- 안쪽 카드: 모서리·내부 패딩 -->
    <div class="list-panel">
    <!-- 상단: 탭만 (카테고리 / 월 / 일) -->
    <header class="page-head">
      <nav class="list-tabs" role="tablist" aria-label="내역 보기 방식">
        <button
          type="button"
          role="tab"
          class="list-tab"
          :class="{ 'list-tab--active': activeTab === 'category' }"
          :aria-selected="activeTab === 'category'"
          @click="activeTab = 'category'"
        >
          카테고리별 내역
        </button>
        <button
          type="button"
          role="tab"
          class="list-tab"
          :class="{ 'list-tab--active': activeTab === 'month' }"
          :aria-selected="activeTab === 'month'"
          @click="activeTab = 'month'"
        >
          월별 내역
        </button>
        <button
          type="button"
          role="tab"
          class="list-tab"
          :class="{ 'list-tab--active': activeTab === 'day' }"
          :aria-selected="activeTab === 'day'"
          @click="activeTab = 'day'"
        >
          일별 내역
        </button>
      </nav>
    </header>

    <!-- 로딩 / API 오류 / 사용자 없음 / 데이터 없음 -->
    <div v-if="loading" class="state-msg">불러오는 중…</div>
    <div v-else-if="error" class="state-msg state-err">{{ error }}</div>
    <p v-else-if="activeUserId == null" class="state-msg state-err">
      users 데이터가 없어 내역을 표시할 수 없습니다.
    </p>
    <p v-else-if="!panelGroups.length" class="state-msg">표시할 내역이 없습니다.</p>

    <!-- 탭에 맞춰 panelGroups로 통일된 그룹 헤더 + 거래 행 리스트 -->
    <template v-else>
      <div
        v-for="group in panelGroups"
        :key="group.key"
        class="ledger-block"
      >
        <!-- 그룹 요약: 아이콘, 제목/부제, 해당 그룹 수입·지출 합계 -->
        <div class="ledger-head">
          <div class="ledger-icon" aria-hidden="true">{{ group.icon }}</div>
          <div class="ledger-labels">
            <span class="ledger-title">{{ group.title }}</span>
            <span class="ledger-sub">{{ group.subtitle }}</span>
          </div>
          <div class="ledger-totals">
            <span v-if="group.incomeTotal > 0" class="sum sum--income">
              + {{ formatWon(group.incomeTotal) }}₩
            </span>
            <span v-if="group.expenseTotal > 0" class="sum sum--expense">
              - {{ formatWon(group.expenseTotal) }}₩
            </span>
          </div>
        </div>

        <ul class="tx-list">
          <li
            v-for="tx in group.items"
            :key="tx.id"
            class="tx-row"
            :class="tx.type === 'INCOME' ? 'tx-row--income' : 'tx-row--expense'"
          >
            <div class="tx-date">
              <span>{{ formatDateParts(tx.transaction_date).mmdd }}</span>
              <span class="tx-subdate">{{ formatDateParts(tx.transaction_date).sub }}</span>
            </div>
            <div class="tx-body">
              <span class="tx-badge">{{ tx.type === 'INCOME' ? '수입' : '지출' }}</span>
              <span class="tx-title">{{ tx.memo || '내역' }}</span>
              <span v-if="showCategoryMeta" class="tx-meta">{{ categoryName(tx.category_id) }}</span>
            </div>
            <div
              class="tx-amount"
              :class="
                tx.type === 'INCOME' ? 'tx-amount--income' : 'tx-amount--expense'
              "
            >
              {{ formatTxAmount(tx.amount, tx.type) }}
            </div>
          </li>
        </ul>
      </div>
    </template>
    </div>
  </div>
</template>

<script setup>
/**
 * List.vue — 내역(카테고리별 / 월별 / 일별)
 * 데이터: json-server(db.json) → Vite 프록시 /api
 */
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

/** API 베이스 (vite.config proxy → localhost:3000) */
const API_BASE = '/api';

/** DB categories에는 name만 있을 때를 대비한 UI 보조(영문 라벨·아이콘) */
const CATEGORY_UI = {
  1: { en: 'ADMIN', icon: '📋' },
  2: { en: 'EDUCATION', icon: '📚' },
  3: { en: 'TRANSPORT', icon: '🚌' },
  4: { en: 'SHOPPING', icon: '🛍️' },
  5: { en: 'TRAVEL', icon: '✈️' },
  6: { en: 'FOOD & DINING', icon: '🍔' },
  7: { en: 'CONVENIENCE', icon: '🏪' },
  8: { en: 'BUSINESS', icon: '💼' },
};

// ---------- 화면 상태 ----------
/** 현재 탭: category | month | day */
const activeTab = ref('category');
const loading = ref(true);
const error = ref(null);
/** API에서 받은 원본 */
const transactions = ref([]);
const categories = ref([]);
/** users[0].id 로 거래 필터 (로그인 연동 전 임시) */
const activeUserId = ref(null);

// ---------- 탭·표시 보조 ----------
/** 월·일 탭에서만 행에 카테고리명 표시 (카테고리 탭은 그룹이 곧 카테고리) */
const showCategoryMeta = computed(() => activeTab.value !== 'category');

/** category_id → 카테고리 객체 빠른 조회 */
const catById = computed(
  () => new Map(categories.value.map((c) => [c.id, c])),
);

function categoryName(cid) {
  return catById.value.get(cid)?.name ?? '—';
}

/** 카테고리별 탭 그룹 헤더용 부제·아이콘 */
function uiForCategory(cat, id) {
  const u = CATEGORY_UI[id];
  const base = u?.en ?? cat?.name ?? 'CATEGORY';
  return {
    subtitle: String(base).toUpperCase(),
    icon: u?.icon ?? '📌',
  };
}

// ---------- 포맷·정렬 유틸 ----------
function formatWon(n) {
  return Math.abs(Number(n) || 0).toLocaleString('ko-KR');
}

/** 수입은 +, 지출은 - 접두 */
function formatTxAmount(amount, type) {
  const abs = formatWon(amount);
  if (type === 'INCOME') return `+ ${abs}₩`;
  return `- ${abs}₩`;
}

/** 행 왼쪽: MM/DD + 요일 (DB는 날짜만 있음) */
function formatDateParts(isoDate) {
  if (!isoDate) return { mmdd: '—', sub: '' };
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { mmdd: '—', sub: '' };
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const w = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return { mmdd: `${mm}/${dd}`, sub: `${w}요일` };
}

function sortTxItems(items) {
  return [...items].sort((a, b) => {
    const db = new Date(b.transaction_date).getTime();
    const da = new Date(a.transaction_date).getTime();
    if (db !== da) return db - da;
    return (b.id ?? 0) - (a.id ?? 0);
  });
}

// ---------- 그룹핑(탭별) ----------
/** 로그인 사용자에 해당하는 거래만 */
const userTransactions = computed(() => {
  const uid = activeUserId.value;
  if (uid == null) return [];
  return transactions.value.filter((t) => t.user_id === uid);
});

const categoryGroups = computed(() => {
  const byCat = new Map();

  for (const t of userTransactions.value) {
    const cid = t.category_id;
    if (!byCat.has(cid)) {
      const cat = catById.value.get(cid);
      const ui = uiForCategory(cat, cid);
      byCat.set(cid, {
        categoryId: cid,
        nameKo: cat?.name ?? '알 수 없는 카테고리',
        subtitle: ui.subtitle,
        icon: ui.icon,
        items: [],
        incomeTotal: 0,
        expenseTotal: 0,
      });
    }
    const g = byCat.get(cid);
    g.items.push(t);
    const amt = Number(t.amount) || 0;
    if (t.type === 'INCOME') g.incomeTotal += amt;
    else if (t.type === 'EXPENSE') g.expenseTotal += amt;
  }

  for (const g of byCat.values()) {
    g.items = sortTxItems(g.items);
  }

  return [...byCat.values()].sort(
    (a, b) =>
      b.incomeTotal +
      b.expenseTotal -
      (a.incomeTotal + a.expenseTotal),
  );
});

/** 월별: YYYY-MM 기준, 최신 월이 위로 */
const monthGroups = computed(() => {
  const byMonth = new Map();

  for (const t of userTransactions.value) {
    const raw = t.transaction_date;
    if (!raw) continue;
    const d = new Date(`${raw}T12:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (!byMonth.has(key)) {
      byMonth.set(key, {
        monthKey: key,
        title: `${y}년 ${m}월`,
        subtitle: `MONTHLY · ${y}.${String(m).padStart(2, '0')}`,
        icon: '📅',
        items: [],
        incomeTotal: 0,
        expenseTotal: 0,
      });
    }
    const g = byMonth.get(key);
    g.items.push(t);
    const amt = Number(t.amount) || 0;
    if (t.type === 'INCOME') g.incomeTotal += amt;
    else if (t.type === 'EXPENSE') g.expenseTotal += amt;
  }

  const list = [...byMonth.values()];
  for (const g of list) {
    g.items = sortTxItems(g.items);
  }
  list.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  return list;
});

const dayGroups = computed(() => {
  const byDay = new Map();

  for (const t of userTransactions.value) {
    const raw = t.transaction_date;
    if (!raw) continue;
    const d = new Date(`${raw}T12:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const key = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!byDay.has(key)) {
      const title = d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
      byDay.set(key, {
        dayKey: key,
        title,
        subtitle: `DAILY · ${key}`,
        icon: '📆',
        items: [],
        incomeTotal: 0,
        expenseTotal: 0,
      });
    }
    const g = byDay.get(key);
    g.items.push(t);
    const amt = Number(t.amount) || 0;
    if (t.type === 'INCOME') g.incomeTotal += amt;
    else if (t.type === 'EXPENSE') g.expenseTotal += amt;
  }

  const list = [...byDay.values()];
  for (const g of list) {
    g.items = sortTxItems(g.items);
  }
  list.sort((a, b) => b.dayKey.localeCompare(a.dayKey));
  return list;
});

/** 현재 탭에 맞는 그룹을 동일한 형태로 매핑 → 템플릿은 한 벌만 사용 */
const panelGroups = computed(() => {
  if (activeTab.value === 'category') {
    return categoryGroups.value.map((g) => ({
      key: `c-${g.categoryId}`,
      title: g.nameKo,
      subtitle: g.subtitle,
      icon: g.icon,
      incomeTotal: g.incomeTotal,
      expenseTotal: g.expenseTotal,
      items: g.items,
    }));
  }
  if (activeTab.value === 'month') {
    return monthGroups.value.map((g) => ({
      key: `m-${g.monthKey}`,
      title: g.title,
      subtitle: g.subtitle,
      icon: g.icon,
      incomeTotal: g.incomeTotal,
      expenseTotal: g.expenseTotal,
      items: g.items,
    }));
  }
  return dayGroups.value.map((g) => ({
    key: `d-${g.dayKey}`,
    title: g.title,
    subtitle: g.subtitle,
    icon: g.icon,
    incomeTotal: g.incomeTotal,
    expenseTotal: g.expenseTotal,
    items: g.items,
  }));
});

async function loadData() {
  loading.value = true;
  error.value = null;
  activeUserId.value = null;
  try {
    const [txRes, catRes, userRes] = await Promise.all([
      axios.get(`${API_BASE}/transactions`),
      axios.get(`${API_BASE}/categories`),
      axios.get(`${API_BASE}/users`),
    ]);
    transactions.value = Array.isArray(txRes.data) ? txRes.data : [];
    categories.value = Array.isArray(catRes.data) ? catRes.data : [];
    const users = Array.isArray(userRes.data) ? userRes.data : [];
    activeUserId.value = users.length ? Number(users[0].id) : null;
  } catch {
    error.value =
      '데이터를 불러오지 못했습니다. npm run api 로 json-server(3000) 실행 후 다시 시도해 주세요.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
/* 바깥 여백 */
.list-screen {
  box-sizing: border-box;
  padding: 28px 20px 20px;
  min-height: 100%;
  font-family:
    'Pretendard',
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    system-ui,
    sans-serif;
}

/* 패널: 둥근 모서리 + 내부 패딩 */
.list-panel {
  --kb-yellow: #ffbc00;
  --kb-yellow-soft: #ffcc00;
  --kb-gray: #60584c;
  --bg: #0a0a0a;
  --text: #ffffff;
  --muted: #888888;
  --icon-bg: #1a1a1a;
  --line: #2a2a2a;

  box-sizing: border-box;
  background: var(--bg);
  color: var(--text);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px 12px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.page-head {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 188, 0, 0.08) 0%, transparent 100%);
}

/* 탭 버튼 행 */
.list-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0;
}

.list-tab {
  flex: 1 1 auto;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--icon-bg);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  cursor: pointer;
  line-height: 1.25;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.list-tab:hover {
  color: var(--text);
  border-color: var(--kb-gray);
}

.list-tab--active {
  color: var(--text);
  border-color: var(--kb-yellow);
  box-shadow: 0 0 0 1px rgba(255, 188, 0, 0.35);
  background: rgba(255, 188, 0, 0.08);
}

/* 로딩·에러·빈 목록 메시지 */
.state-msg {
  text-align: center;
  padding: 48px 16px;
  color: var(--muted);
  font-size: 0.95rem;
}

.state-err {
  color: #ff9e9e;
}

/* 그룹(카테고리·월·일) 블록 간격 */
.ledger-block {
  margin-bottom: 36px;
}

.ledger-block:last-child {
  margin-bottom: 0;
}

/* 그룹 헤더: 아이콘 + 제목/부제 + 수입·지출 합계 */
.ledger-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

/* 그룹 아이콘 박스 */
.ledger-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--icon-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
  border: 1px solid var(--line);
}

.ledger-labels {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ledger-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.ledger-sub {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--kb-gray);
  text-transform: uppercase;
}

/* 그룹 우측 합계: 수입(연한 옐로) / 지출(메인 옐로) */
.ledger-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  text-align: right;
}

/* 합계 숫자 공통 */
.sum {
  font-size: 0.88rem;
  font-weight: 800;
  white-space: nowrap;
}

.sum--income {
  color: var(--kb-yellow-soft);
}

.sum--expense {
  color: var(--kb-yellow);
}

/* 거래 목록 */
.tx-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 거래 한 줄: 수입·지출에 따라 뱃지 색만 구분 */
.tx-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.tx-row:last-child {
  border-bottom: none;
}

.tx-date {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 44px;
  font-size: 0.72rem;
  color: var(--muted);
  line-height: 1.2;
}

/* 날짜 두 번째 줄(요일) */
.tx-subdate {
  font-size: 0.65rem;
  opacity: 0.85;
}

/* 메모·카테고리(조건부)·뱃지 */
.tx-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 수입/지출 뱃지 기본 */
.tx-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--muted);
}

/* 수입 행 뱃지 */
.tx-row--income .tx-badge {
  color: var(--kb-yellow-soft);
  background: rgba(255, 204, 0, 0.12);
}

/* 지출 행 뱃지 */
.tx-row--expense .tx-badge {
  color: var(--kb-yellow);
  background: rgba(255, 188, 0, 0.1);
}

/* 거래 메모(제목) */
.tx-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.35;
  word-break: break-word;
}

/* 월·일 탭에서 카테고리명 */
.tx-meta {
  font-size: 0.72rem;
  color: var(--kb-gray);
}

/* 행 우측 금액 */
.tx-amount {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 2px;
}

.tx-amount--expense {
  color: var(--text);
}

.tx-amount--income {
  color: var(--text);
}

/* ===== 모바일: 좁은 화면 여백 + 하단 네비·FAB ===== */
@media (max-width: 767px) {
  .list-screen {
    padding: 20px 16px 100px;
  }

  .list-panel {
    padding: 16px 12px 20px;
    border-radius: 14px;
  }

  .list-tabs {
    flex-direction: column;
  }

  .list-tab {
    flex: none;
    width: 100%;
    text-align: center;
  }
}
</style>
