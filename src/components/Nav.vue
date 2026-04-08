<template>
  <nav class="side-nav">
    <div class="menu-group">
      <router-link to="/" class="nav-item">
        <i class="fas fa-calendar-alt icon"></i>
        <span>홈/달력</span>
      </router-link>

      <router-link to="/list" class="nav-item">
        <i class="fas fa-file-invoice-dollar icon"></i>
        <span>재정 내역</span>
      </router-link>

      <router-link to="/mypage" class="nav-item">
        <i class="fas fa-user-circle icon"></i>
        <span>마이페이지</span>
      </router-link>
    </div>
    <div class="logo-image">
      <img src="../assets/logo.png" alt="로고" />
    </div>
  </nav>
</template>

<script setup></script>

<style scoped>
.side-nav {
  width: 260px;
  height: 100vh;
  background-color: #0d0d0d;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  z-index: 9999;
}
.menu-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 30px;
  color: #888;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}
.nav-item.router-link-active {
  color: #fff;
  background: linear-gradient(
    90deg,
    rgba(255, 179, 71, 0.1) 0%,
    rgba(255, 179, 71, 0) 100%
  );
}
.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background-color: #ffb347;
  box-shadow: 2px 0 12px rgba(255, 179, 71, 0.6);
  z-index: 5;
}
.nav-item.router-link-active .icon {
  color: #ffb347;
  filter: drop-shadow(0 0 5px rgba(255, 179, 71, 0.3));
}
.nav-item.router-link-active span {
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.logo-image {
  width: 200px;
}
.logo-image img {
  width: 100%;
  filter: grayscale(1);
  opacity: 0.3;
}
</style>
