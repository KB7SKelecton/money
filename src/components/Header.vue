<template>
  <nav class="sidebar">
    <div class="sidebar-brand">가계부</div>

    <div class="sidebar-menu">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link class="nav-link" to="/">홈(달력)</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/list">내역</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/report">레포트</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/about">설정</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { reactive, computed } from 'vue';
export default {
  setup() {
    const state = reactive({ isNavShow: false });
    const navClass = computed(() =>
      state.isNavShow
        ? 'collapse navbar-collapse show'
        : 'collapse navbar-collapse',
    );
    const changeIsNavShow = () => {
      state.isNavShow = !state.isNavShow;
    };
    return { state, changeIsNavShow, navClass };
  },
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh; /* 화면 꽉 차게 */
  background-color: #212529; /* Bootstrap bg-dark 컬러와 유사 */
  color: white;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
}

.sidebar-brand {
  font-size: 1.5rem;
  padding: 20px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #343a40;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.nav-link {
  display: block;
  padding: 15px 25px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: 0.2s;
}

.nav-link:hover {
  color: white;
  background-color: #343a40;
}

/* 현재 선택된 메뉴 강조 */
.router-link-active {
  color: white !important;
  background-color: #0d6efd; /* 강조색 (Bootstrap primary) */
  font-weight: bold;
}
</style>
