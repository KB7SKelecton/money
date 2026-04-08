<template>
  <div class="category-screen">
    <header class="page-head">
      <h1 class="page-title">카테고리별 내역</h1>
      <p class="page-sub">DB의 거래를 카테고리별로 묶어 수입·지출을 함께 표시합니다</p>
    </header>

    <div v-if="loading" class="state-msg">불러오는 중…</div>
    <div v-else-if="error" class="state-msg state-err">{{ error }}</div>
    <p v-else-if="activeUserId == null" class="state-msg state-err">
      users 데이터가 없어 내역을 표시할 수 없습니다.
    </p>
    <p v-else-if="!categoryGroups.length" class="state-msg">표시할 내역이 없습니다.</p>

    <template v-else>
      <div
        v-for="group in categoryGroups"
        :key="group.categoryId"
        class="category-block"
      >
        <div class="category-head">
          <div class="category-icon" aria-hidden="true">{{ group.icon }}</div>
          <div class="category-labels">
            <span class="category-name">{{ group.nameKo }}</span>
            <span class="category-en">{{ group.subtitle }}</span>
          </div>
          <div class="category-totals">
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

/** DB에는 id·name만 있으므로 UI용 보조 정보는 컴포넌트 내부에서만 사용 */
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

const loading = ref(true);
const error = ref(null);
const transactions = ref([]);
const categories = ref([]);
const activeUserId = ref(null);

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

const categoryGroups = computed(() => {
  const uid = activeUserId.value;
  if (uid == null) return [];

  const catById = new Map(categories.value.map((c) => [c.id, c]));
  const mine = transactions.value.filter((t) => t.user_id === uid);
  const byCat = new Map();

  for (const t of mine) {
    const cid = t.category_id;
    if (!byCat.has(cid)) {
      const cat = catById.get(cid);
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
    g.items.sort((a, b) => {
      const db = new Date(b.transaction_date).getTime();
      const da = new Date(a.transaction_date).getTime();
      if (db !== da) return db - da;
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }

  return [...byCat.values()].sort((a, b) => {
    const vol =
      b.incomeTotal +
      b.expenseTotal -
      (a.incomeTotal + a.expenseTotal);
    return vol;
  });
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
.category-screen {
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
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 188, 0, 0.08) 0%, transparent 100%);
}

.page-title {
  margin: 0 0 6px;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
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

.category-block {
  margin-bottom: 36px;
}

.category-block:last-child {
  margin-bottom: 0;
}

.category-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.category-icon {
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

.category-labels {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-name {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.category-en {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--kb-gray);
  text-transform: uppercase;
}

.category-totals {
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
  .category-screen {
    margin: -20px -20px 0;
    padding-bottom: 100px;
    min-height: calc(100vh - 100px);
  }
}
</style>
