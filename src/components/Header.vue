<template>
  <header
    style="
      position: sticky;
      width: 100%;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background-color: #131313;
      border-bottom: 2px solid #f8a70c;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    "
  >
    <!-- 로고 & 타이틀 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <img
        alt="Logo"
        style="height: 40px; width: auto; object-fit: contain"
        src="../../public/logoHeader.png"
      />
      <h1
        style="
          color: #f8a70c;
          font-style: italic;
          font-weight: 900;
          font-size: 1.25rem;
          margin: 0;
          letter-spacing: -0.05em;
        "
      >
        Show Me The Money
      </h1>
    </div>
    <nav>
      <ul class="nav-menu">
        <li><router-link to="/">홈</router-link></li>
        <li><router-link to="/list">내역</router-link></li>
        <li><router-link to="/mypage">마이페이지</router-link></li>
      </ul>
    </nav>

    <!-- 유저 정보 & 로그아웃 -->
    <div style="display: flex; align-items: center; gap: 24px">
      <div
        style="
          display: flex;
          align-items: center;
          gap: 10px;
          background: #2a2a2a;
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        "
      >
        <img
          alt="User profile"
          style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid rgba(248, 167, 12, 0.3);
          "
          :src="userProfileImg"
        />
        <span style="font-size: 0.875rem; font-weight: 700; color: #e5e2e1">
          {{ userName }} 님
        </span>
      </div>
      <button
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(229, 226, 225, 0.5);
          background: none;
          border: none;
          cursor: pointer;
        "
        @click="handleLogout"
      >
        <span class="material-symbols-outlined" style="font-size: 18px"
          >logout</span
        >
        로그아웃
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
