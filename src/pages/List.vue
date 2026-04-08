<template>
  <div class="list-screen">
    <header class="page-head">
      <h1 class="page-title">내역</h1>
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
      <p class="page-sub">{{ tabHint }}</p>
    </header>

    <div v-if="loading" class="state-msg">불러오는 중…</div>
    <div v-else-if="error" class="state-msg state-err">{{ error }}</div>
    <p v-else-if="activeUserId == null" class="state-msg state-err">
      users 데이터가 없어 내역을 표시할 수 없습니다.
    </p>
    <p v-else-if="!panelGroups.length" class="state-msg">표시할 내역이 없습니다.</p>

    <template v-else>
      <div
        v-for="group in panelGroups"
        :key="group.key"
        class="ledger-block"
      >
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_BASE = '/api';

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

const activeTab = ref('category');
const loading = ref(true);
const error = ref(null);
const transactions = ref([]);
const categories = ref([]);
const activeUserId = ref(null);

const tabHint = computed(() => {
  const m = {
    category: 'DB의 거래를 카테고리별로 묶어 수입·지출을 함께 표시합니다.',
    month: '같은 달의 거래를 묶어 월별로 확인합니다.',
    day: '같은 일자의 거래를 묶어 일별로 확인합니다.',
  };
  return m[activeTab.value] ?? m.category;
});

const showCategoryMeta = computed(() => activeTab.value !== 'category');

const catById = computed(
  () => new Map(categories.value.map((c) => [c.id, c])),
);

function categoryName(cid) {
  return catById.value.get(cid)?.name ?? '—';
}

function uiForCategory(cat, id) {
  const u = CATEGORY_UI[id];
  const base = u?.en ?? cat?.name ?? 'CATEGORY';
  return {
    subtitle: String(base).toUpperCase(),
    icon: u?.icon ?? '📌',
  };
}

function formatWon(n) {
  return Math.abs(Number(n) || 0).toLocaleString('ko-KR');
}

function formatTxAmount(amount, type) {
  const abs = formatWon(amount);
  if (type === 'INCOME') return `+ ${abs}₩`;
  return `- ${abs}₩`;
}

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
.list-screen {
  --kb-yellow: #ffbc00;
  --kb-yellow-soft: #ffcc00;
  --kb-gray: #60584c;
  --bg: #000000;
  --text: #ffffff;
  --muted: #888888;
  --icon-bg: #1a1a1a;
  --line: #2a2a2a;

  margin: -20px;
  padding: 24px 20px 32px;
  min-height: calc(100vh - 40px);
  box-sizing: border-box;
  background: var(--bg);
  color: var(--text);
  font-family:
    'Pretendard',
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    system-ui,
    sans-serif;
}

.page-head {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 188, 0, 0.08) 0%, transparent 100%);
}

.page-title {
  margin: 0 0 14px;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.list-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
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

.page-sub {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}

.state-msg {
  text-align: center;
  padding: 48px 16px;
  color: var(--muted);
  font-size: 0.95rem;
}

.state-err {
  color: #ff9e9e;
}

.ledger-block {
  margin-bottom: 36px;
}

.ledger-block:last-child {
  margin-bottom: 0;
}

.ledger-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

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

.ledger-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  text-align: right;
}

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

.tx-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

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

.tx-subdate {
  font-size: 0.65rem;
  opacity: 0.85;
}

.tx-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

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

.tx-row--income .tx-badge {
  color: var(--kb-yellow-soft);
  background: rgba(255, 204, 0, 0.12);
}

.tx-row--expense .tx-badge {
  color: var(--kb-yellow);
  background: rgba(255, 188, 0, 0.1);
}

.tx-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.35;
  word-break: break-word;
}

.tx-meta {
  font-size: 0.72rem;
  color: var(--kb-gray);
}

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

@media (max-width: 767px) {
  .list-screen {
    margin: -20px -20px 0;
    padding-bottom: 100px;
    min-height: calc(100vh - 100px);
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
