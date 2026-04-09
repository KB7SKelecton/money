<template>
  <div class="mypage">
    <!-- 왼쪽 메인 영역 -->
    <div class="mypage-main">
      <!-- 마이페이지 헤더 박스 (제목 + 잔고) -->
      <div class="mypage-header">
        <h1 class="mypage-title">마이페이지</h1>
        <div class="mypage-balance">
          <span class="balance-label">AVAILABLE ASSETS</span>
          <!-- toLocaleString(): 숫자에 쉼표 자동으로 붙여줌 (5500000 → 5,500,000) -->
          <span class="balance-amount"
            >잔고 : {{ balance.toLocaleString() }}원</span
          >
        </div>
        <Chart />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"; // computed 추가
import { useRouter } from "vue-router";
import axios from "axios";
import Chart from "@/components/Chart.vue";
import db from "../../db.json"; // db import 추가

const router = useRouter();

const user = ref({
  name: "",
  email: "",
  avatar: "",
});

const initialBalance = ref(0);

// balance는 computed로 선언 (onMounted 밖에!)
const balance = computed(() => {
  const totalChange = db.transactions.reduce((acc, t) => {
    return t.type === "INCOME" ? acc + t.amount : acc - t.amount;
  }, 0);
  return initialBalance.value + totalChange;
});

const isEditingName = ref(false);
const isEditingEmail = ref(false);

function logout() {
  router.push("/");
}

function startEdit() {
  isEditingName.value = true;
}

async function finishEdit() {
  isEditingName.value = false;
  await axios.patch("http://localhost:3000/users/1", {
    nickname: user.value.name,
  });
}

function startEditEmail() {
  isEditingEmail.value = true;
}

async function finishEditEmail() {
  isEditingEmail.value = false;
  await axios.patch("http://localhost:3000/users/1", {
    email: user.value.email,
  });
}

// onMounted는 한 번만!
onMounted(async () => {
  const res = await axios.get("http://localhost:3000/users/1");
  user.value.name = res.data.nickname;
  user.value.email = res.data.email;
  user.value.avatar = res.data.profile_image_url;
  initialBalance.value = res.data.initial_balance;
});

function onAvatarChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    user.value.avatar = e.target.result;
  };
  reader.readAsDataURL(file);
}
</script>

<style scoped>
/* 전체 레이아웃: 좌우로 나란히 배치 */
.mypage {
  display: flex;
  gap: 0;
  min-height: 100vh;
  background-color: #131313;
  padding: 0;
  font-family: "Manrope", sans-serif;
}

/* 왼쪽 메인 영역: 나머지 공간 전부 차지 */
.mypage-main {
  flex: 1;
  padding: 40px 20px;
  width: 100%;
}

/* 마이페이지 헤더 박스 */
.mypage-header {
  background-color: #131313;
  padding: 0;
}

/* 마이페이지 제목 */
.mypage-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e5e2e1;
  line-height: 1;
  margin: -20px 0 12px;
}

/* 잔고 표시 박스 */
.mypage-balance {
  background-color: #2a2a2a;
  border-radius: 12px;
  padding: 16px 40px;
  display: inline-flex;
  align-items: flex-start;
  gap: 1px;
  flex-direction: column; /* 세로로 쌓기 */
  margin-top: 7px;
}

/* AVAILABLE ASSETS 라벨 */
.balance-label {
  font-size: 0.6rem;
  color: #f8a70c;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
}

/* 잔고 금액 */
.balance-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e5e2e1;
}

/* 사이드바 위쪽 프로필 영역 */
.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 48px;
}

/* 프로필 이미지 원형 컨테이너 */
.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  /* stitch의 gradient 테두리 효과 */
  background: linear-gradient(135deg, #ffca82, #f8a70c, #ffd483);
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 이미지/아이콘을 감싸는 내부 원 */
.profile-avatar > img,
.profile-avatar > .profile-default-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1a1a1a;
  border: 3px solid #131313;
  object-fit: cover;
}

/* 이미지 없을 때 기본 사람 아이콘 */
.profile-default-icon {
  color: #888;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 인증 뱃지 */
.verified-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background-color: #f8a70c;
  border-radius: 50%;
  border: 2px solid #131313;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verified-badge i {
  color: #131313;
  font-size: 0.7rem;
  font-weight: 900;
}

/* 호버 시 나타나는 카메라 오버레이 */
.avatar-overlay {
  position: absolute;
  bottom: 3px;
  left: 3px;
  right: 3px;
  top: 3px;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

/* 호버 시 오버레이 나타남 */
.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

/* 카메라 아이콘 */
.avatar-overlay i {
  color: white;
  font-size: 1.2rem;
}

/* 이름 텍스트 */
.profile-name {
  color: #e5e2e1;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 4px 0 0 0;
  cursor: pointer;
  letter-spacing: -0.02em;
}

/* 이름/이메일 옆 펜 아이콘 */
.profile-name i,
.profile-email i {
  font-size: 0.65rem;
  color: #9f8e79;
  margin-left: 6px;
}

/* 이메일 텍스트 */
.profile-email {
  color: #e5e2e1;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.5;
  cursor: pointer;
}

/* 이름 수정 input */
.profile-name-input {
  background-color: #201f1f;
  border: 1px solid #f8a70c;
  border-radius: 8px;
  color: #e5e2e1;
  font-size: 1.2rem;
  font-weight: 800;
  text-align: center;
  padding: 6px 10px;
  width: 100%;
  outline: none;
  font-family: "Manrope", sans-serif;
}

/* 이메일 수정 input */
.profile-email-input {
  background-color: #201f1f;
  border: 1px solid hsl(39, 94%, 51%);
  border-radius: 8px;
  color: #f8a70c;
  font-size: 0.8rem;
  text-align: center;
  padding: 6px 10px;
  width: 100%;
  outline: none;
  opacity: 0.7;
  font-family: "Manrope", sans-serif;
}

/* 사이드바 아래쪽: 로그아웃 버튼 영역 */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin-top: 500px;
}

/* 로그아웃 버튼 */
.logout-btn {
  width: 100%;
  padding: 14px;
  background-color: #2a2a2a;
  color: #f8a70c;
  border: 1px solid rgba(82, 69, 51, 0.15);
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 400;
  font-family: "Manrope", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

/* 로그아웃 버튼 호버: stitch의 error-container 색상 */
.logout-btn:hover {
  background-color: rgba(147, 0, 10, 0.2);
  color: #ffb4ab;
  border-color: rgba(147, 0, 10, 0.3);
}

.logout-btn i {
  font-size: 1rem;
  transition: transform 0.3s;
}

.logout-btn:hover i {
  transform: translateX(3px);
}

/* 하단 보안 텍스트 */
.secured-text {
  font-size: 0.55rem;
  color: #e5e2e1;
  text-align: center;
  margin: 0;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.2;
}

/* MyPage.vue <style scoped> 최하단에 추가 */
/* 태블릿 및 작은 모니터 (1024px) */
@media (max-width: 1024px) {
  .mypage-main {
    padding: 30px 20px; /* 양옆 여백을 줄여 컨텐츠 공간 확보 */
  }

  .mypage-title {
    font-size: 1.5rem; /* 제목 크기를 살짝 조절 */
    margin-bottom: 15px;
    font-weight: 600;
    margin: -20px 0 12px;
  }

  .mypage-balance {
    padding: 14px 25px; /* 잔고 박스 크기 최적화 */
  }
}

@media (max-width: 768px) {
  .mypage-main {
    padding: 32px 24px; /* 태블릿: 좌우 여백 축소 */
  }
}

@media (max-width: 375px) {
  .mypage-main {
    padding: 24px 16px; /* 모바일: 최소 여백 */
  }

  .mypage-title {
    text-align: start;
    font-size: 1.4rem; /* 모바일: 제목 중앙 정렬 */
    margin-left: 10px;
    margin-top: -10px;
    margin: -20px 0 12px;
  }

  .mypage-balance {
    display: flex;
    width: 100%; /* 모바일: 잔고 박스 가로 풀사이즈 */
    box-sizing: border-box;
    align-items: center; /* 텍스트 중앙 정렬 */
    padding: 16px;
  }
}
</style>
