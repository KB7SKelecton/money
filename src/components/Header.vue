<template>
  <header class="header">
    <!-- 로고 & 타이틀 -->
    <div class="header-left">
      <img alt="Logo" class="header-logo" src="../../public/logoHeader.png" />
      <h1 class="header-title">Show Me The Money</h1>
    </div>

    <!-- 유저 정보 & 로그아웃 -->
    <div class="header-right">
      <div class="user-info">
        <img alt="User profile" class="user-avatar" :src="userProfileImg" />
        <span class="user-name">{{ userName }} 님</span>
      </div>
      <button class="logout-btn" @click="handleLogout">
        <span class="material-symbols-outlined">logout</span>
        <span class="logout-text">로그아웃</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  userName: {
    type: String,
    default: '김금융',
  },
  userProfileImg: {
    type: String,
    default: 'https://api.dicebear.com/7.x/thumbs/svg?seed=금융',
  },
});

const emit = defineEmits(['logout']);
const handleLogout = () => emit('logout');
</script>

<style scoped>
/* ── PC 기본 스타일 ── */
.header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: #131313;
  border-bottom: 2px solid #f8a70c;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.header-title {
  color: #f8a70c;
  font-style: italic;
  font-weight: 900;
  font-size: 1.25rem;
  margin: 0;
  letter-spacing: -0.05em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #2a2a2a;
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(248, 167, 12, 0.3);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e5e2e1;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(229, 226, 225, 0.5);
  background: none;
  border: none;
  cursor: pointer;
}

.logout-btn .material-symbols-outlined {
  font-size: 18px;
}

/* ── 모바일 (767px 이하) ── */
@media (max-width: 767px) {
  .header {
    height: 48px; /* 64px → 48px로 줄임 */
    padding: 0 16px; /* 좌우 패딩도 줄임 */
  }
  .header-title {
    display: none; /* 타이틀 숨김 */
  }

  .user-name {
    display: none; /* 이름 숨김 */
  }

  .user-info {
    padding: 6px; /* 이름 없으니 패딩 줄임 */
  }

  .logout-text {
    display: none; /* 로그아웃 텍스트 숨김 */
  }
  .header-logo {
    height: 28px; /* 로고 크기 작게 40px → 28px */
  }
}
</style>
