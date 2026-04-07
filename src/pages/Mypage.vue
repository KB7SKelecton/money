<template>
  <div class="mypage">
    <!-- 왼쪽 메인 -->
    <div class="mypage-main">
      <div class="mypage-header">
        <h1 class="mypage-title">마이페이지</h1>
        <div class="mypage-balance">
          <span class="balance-label">AVAILABLE ASSETS</span>
          <span class="balance-amount"
            >잔고 : {{ balance.toLocaleString() }}원</span
          >
        </div>
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <div class="mypage-sidebar">
      <!-- 위쪽: 프로필 -->
      <div class="sidebar-top">
        <div class="profile-avatar">
          <!-- 이미지 없으면 기본 배경색으로 원만 보임 -->
          <img src="" alt="" />
        </div>
        <p class="profile-name">{{ user.name }}</p>
        <p class="profile-email">{{ user.email }}</p>
      </div>

      <!-- 아래쪽: 로그아웃 -->
      <div class="sidebar-bottom">
        <button class="logout-btn">↪ 로그아웃</button>
        <p class="secured-text">SECURED BY Show Me The Money</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const balance = ref(5500000);

const user = ref({
  name: "홍길동",
  email: "hgj1234@gmail.com",
});
</script>

<style scoped>
/* 전체 페이지를 꽉 채우는 flex */
.mypage {
  display: flex;
  gap: 0;
  min-height: 100vh; /* 화면 전체 높이 */
  background-color: #111;
  padding: 0;
}

/* 왼쪽: 메인 영역 */
.mypage-main {
  flex: 1;
  padding: 32px 24px;
}

/* 헤더 박스 */
.mypage-header {
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 24px 28px;
}

.mypage-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: white;
  margin: 0 0 16px 0;
}

.mypage-balance {
  background-color: #2a2a2a;
  border-radius: 6px;
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.balance-label {
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 0.08em;
}

.balance-amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
}

/* 오른쪽: 사이드바 */
.mypage-sidebar {
  width: 220px;
  min-height: 100vh; /* 사이드바도 화면 전체 높이 */
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 40px 16px 24px;
  border-left: 1px solid #2a2a2a;
}

/* 사이드바 위쪽 */
.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* 프로필 이미지 원형 */
.profile-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid #f5a623;
  overflow: hidden;
  background-color: #333; /* 이미지 없을 때 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.profile-email {
  color: #888;
  font-size: 0.75rem;
  margin: 0;
}

/* 사이드바 아래쪽 */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 600px;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background-color: #2a2a2a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #3a3a3a;
}

.secured-text {
  font-size: 0.6rem;
  color: #444;
  text-align: center;
  margin: 0;
  letter-spacing: 0.05em;
}
.mypage {
  display: flex;
  gap: 0;
  min-height: 100vh;
  background-color: #111;
  padding: 0;
}
</style>
