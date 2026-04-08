<template>
  <div class="register-container" :class="{ 'is-open': true }">
    <div class="backdrop" @click="$emit('close')"></div>

    <div class="register-modal">
      <div class="register-header">
        <h2>내역 추가</h2>
        <button type="button" class="close-btn" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div class="type-tab-group">
        <input
          type="radio"
          id="typeExpense"
          value="EXPENSE"
          v-model="formData.type"
          name="transactionType"
        />
        <label for="typeExpense">지출</label>

        <input
          type="radio"
          id="typeIncome"
          value="INCOME"
          v-model="formData.type"
          name="transactionType"
        />
        <label for="typeIncome">수입</label>
      </div>

      <form @submit.prevent="handleSave" id="registerFrm">
        <div class="input-wrap">
          <label>날짜</label>
          <div class="input-field">
            <input type="date" v-model="formData.date" />
          </div>
        </div>

        <div class="input-wrap">
          <label>금액</label>
          <div class="amount-field">
            <span class="currency">₩</span>
            <input
              type="text"
              v-model.number="formData.amount"
              placeholder="0"
            />
          </div>
        </div>

        <div class="input-wrap">
          <label>카테고리</label>
          <div class="input-field">
            <select v-model.number="formData.categoryId" required>
              <option value="" disabled>선택하세요</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="input-wrap">
          <label>내용</label>
          <textarea
            v-model="formData.memo"
            placeholder="메모를 입력하세요..."
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">저장</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'refresh']);

const categories = ref([]);

const FIXED_USER_ID = 1;

// 입력된 폼 데이터
const formData = reactive({
  date: new Date().toISOString().split('T')[0],
  type: 'EXPENSE',
  amount: 0,
  categoryId: 6,
  memo: '',
});

// db.json에서 카테고리 데이터 호출
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('카테고리 로딩 실패:', error);
  }
};

fetchCategories();

// 가계부 입력 데이터 db.json에 추가
const handleSave = async () => {
  try {
    const payload = {
      user_id: FIXED_USER_ID,
      category_id: formData.categoryId,
      type: formData.type,
      amount: formData.amount,
      transaction_date: formData.date,
      memo: formData.memo,
    };

    // json-server POST 요청
    const response = await axios.post(
      'http://localhost:3000/transactions',
      payload,
    );

    if (response.status === 201) {
      alert('성공적으로 저장되었습니다!');
      emit('refresh'); // 부모 컴포넌트에 목록 갱신 요청
      emit('close');
    }
  } catch (error) {
    console.error('저장 실패:', error);
    alert('서버 연결을 확인해주세요.');
  }
};
</script>

<style scoped>
/* 전체 컨테이너 및 배경 */
.register-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  visibility: hidden;
  z-index: 1000;
}
.register-container.is-open {
  visibility: visible;
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.3s;
}
.is-open .backdrop {
  opacity: 1;
}

/* 우측 슬라이드 모달 메인 */
.register-modal {
  position: absolute;
  top: 0;
  right: -100%; /* 화면 밖 */
  width: 100%;
  max-width: 450px;
  height: 100%;
  background: #1a1a1a;
  color: #fff;
  padding: 40px 24px;
  box-sizing: border-box;
  transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}
.is-open .register-modal {
  right: 0;
}

/* 헤더 */
.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.register-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
}

/* 탭 스타일 */
.type-tab-group {
  display: flex;
  background: #2a2a2a;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 30px;
}

/* 실제 라디오 인풋은 숨김 */
.type-tab-group input[type='radio'] {
  display: none;
}

/* 라벨을 버튼처럼 스타일링 */
.type-tab-group label {
  flex: 1;
  padding: 10px;
  text-align: center;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

/* 라디오가 체크되었을 때 인접한 라벨(label)의 스타일 변경 */
.type-tab-group input[type='radio']:checked + label {
  background: #3a3a3a;
  color: #ffb347; /* 선택된 포인트 컬러 */
}

/* 입력 필드 공통 */
.input-wrap {
  margin-bottom: 24px;
}
.input-wrap label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.input-field,
textarea,
.amount-field {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid transparent;
  transition: 0.2s;
}
.input-field:focus-within,
textarea:focus {
  border-color: #f8a70c;
}

input,
select,
textarea {
  width: 100%;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  outline: none;
}

/* 금액 필드 특화 */
.amount-field {
  display: flex;
  align-items: center;
  padding: 16px;
}
.currency {
  font-size: 24px;
  margin-right: 12px;
  color: #888;
}
.amount-field input {
  font-size: 32px;
  font-weight: bold;
}

/* 하단 저장 버튼 */
.submit-btn {
  margin-top: auto;
  width: 100%;
  padding: 18px;
  background: linear-gradient(90deg, #f8a70c, #fab809);
  border: none;
  border-radius: 16px;
  color: #000;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
.submit-btn:active {
  transform: scale(0.98);
}
</style>
