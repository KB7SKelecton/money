<template>
  <button
    @click="isModalOpen = true"
    class="fab-button"
    v-if="!['/mypage', '/login', '/register'].includes(route.path)"
  >
    <i class="fas fa-plus pc-only"></i>
    <span class="mobile-only">내역 등록</span>
  </button>
  <div class="register-modal" :class="{ 'is-open': isModalOpen }">
    <div class="register-header">
      <h2>내역 추가</h2>
      <button type="button" class="close-btn" @click="isModalOpen = false">
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
          <input type="date" v-model="formData.date" requireds />
        </div>
      </div>

      <div class="input-wrap">
        <label>금액</label>
        <div class="amount-field">
          <span class="currency">₩</span>
          <input
            type="text"
            :value="formData.amount ? formData.amount.toLocaleString() : ''"
            @input="handleAmountInput"
            placeholder="0"
            inputmode="numeric"
            required
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
          required
        ></textarea>
      </div>

      <button type="submit" class="submit-btn">저장</button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

// 라우터
const route = useRoute();

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'refresh']);

const categories = ref([]);

const FIXED_USER_ID = 1;

const isModalOpen = ref(false);

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

const handleAmountInput = (e) => {
  // 1. 입력된 값에서 숫자만 추출
  const value = e.target.value;
  const numericValue = value.replace(/[^0-9]/g, '');

  // 2. 실제 데이터 업데이트 (숫자형으로)
  formData.amount = numericValue ? parseInt(numericValue, 10) : 0;

  // 3. ⚠️ 핵심: input 엘리먼트의 값을 강제로 업데이트 (텍스트 입력 원천 차단)
  // 이 과정을 통해 숫자가 아닌 문자가 들어오자마자 눈앞에서 사라지게 됩니다.
  e.target.value = formData.amount ? formData.amount.toLocaleString() : '';
};

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
      emit('refresh');
      emit('close');
    }
  } catch (error) {
    console.error('저장 실패:', error);
    alert('서버 연결을 확인해주세요.');
  }
};
</script>

<style scoped>
.fab-button {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f8a70c, #fab809);
  border-radius: 50%;
  border: none;
  color: #000;
  font-size: 26px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
    0 8px 24px rgba(248, 167, 12, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 9999;
}

.fab-button:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 32px rgba(248, 167, 12, 0.6);
}

.mobile-only {
  display: none;
}

.register-modal {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 480px;
  height: 100%;
  background: rgba(22, 22, 22, 0.96);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(110, 96, 83, 0.4);
  color: #fff;
  padding: 50px 30px;
  transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 10000;
  overflow-y: auto;
}

.register-modal.is-open {
  right: 0;
  box-shadow: -25px 0 50px rgba(0, 0, 0, 0.9);
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 35px;
}

.register-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #f8a70c;
  letter-spacing: -0.5px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #6e6053;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(248, 167, 12, 0.1);
  color: #fab809;
  transform: rotate(90deg);
}

.close-btn:active {
  transform: scale(0.9) rotate(90deg);
}

.type-tab-group {
  display: flex;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 14px;
  padding: 5px;
  margin-bottom: 35px;
}

.type-tab-group label {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  color: #6e6053;
  font-size: 15px;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.type-tab-group input[type='radio'] {
  display: none;
}

.type-tab-group input[type='radio']:checked + label {
  background: #f8a70c;
  color: #000;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(248, 167, 12, 0.3);
}

.input-wrap {
  margin-bottom: 28px;
}

.input-wrap label {
  display: block;
  font-size: 13px;
  color: #6e6053;
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.input-field,
textarea,
.amount-field {
  background: #1e1e1e;
  border: 1.5px solid #333;
  border-radius: 16px;
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.input-field:focus-within,
textarea:focus {
  border-color: #fab809;
  background: #252525;
  box-shadow: 0 0 0 4px rgba(250, 184, 9, 0.1);
}

select option {
  background: rgba(22, 22, 22, 0.96);
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

.amount-field {
  display: flex;
  align-items: center;
  padding: 24px 20px;
  border-color: rgba(110, 96, 83, 0.3);
}

.currency {
  color: #fab809;
  font-size: 26px;
  font-weight: 900;
  margin-right: 14px;
}

.amount-field input {
  color: #ffffff;
  font-size: 40px;
  font-weight: 800;
}

.submit-btn {
  margin-top: auto;
  padding: 22px;
  background: linear-gradient(90deg, #f8a70c, #fab809);
  border: none;
  border-radius: 20px;
  color: #000;
  font-size: 20px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(248, 167, 12, 0.2);
  transition: all 0.3s ease;
  width: 100%;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(250, 184, 9, 0.4);
  filter: brightness(1.1);
}

.submit-btn:active {
  transform: translateY(1px) scale(0.98);
}

/* 모바일 반응형 */
@media screen and (max-width: 768px) {
  .fab-button {
    width: auto;
    height: auto;
    padding: 10px 20px;
    border-radius: 30px;
    right: 50%;
    transform: translateX(50%);
    bottom: 80px;
    gap: 10px;
  }

  .fab-button:hover {
    transform: translateX(50%) scale(1.05);
  }

  .fab-button:active {
    transform: translateX(50%) scale(0.9);
    filter: brightness(0.9);
  }

  .mobile-only {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 700;
  }
}
</style>
