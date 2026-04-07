<template>
  <nav class="navigation bg-dark">
    <div class="nav-header">
      <span class="brand-text">가계부</span>
    </div>

    <ul class="nav-menu">
      <li><router-link to="/">홈</router-link></li>
      <li><router-link to="/list">내역</router-link></li>
      <li><router-link to="/report">리포트</router-link></li>
      <li><router-link to="/about">설정</router-link></li>
    </ul>
  </nav>
</template>

<style scoped>
/* PC 버전 스타일 */
.navigation {
  width: 240px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
}

.nav-header {
  padding: 20px;
  text-align: center;
}
.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
.nav-menu li a {
  display: block;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
}

/* 모바일 버전 스타일 (768px 미만) */
@media (max-width: 767px) {
  .navigation {
    width: 100%;
    height: 60px; /* 높이 축소 */
    flex-direction: row; /* 가로로 나열 */
    position: fixed; /* 화면에 박제 */
    top: auto;
    bottom: 0; /* 하단으로 밀착 */
    z-index: 1000;
  }

  .nav-header {
    display: none;
  } /* 모바일에서 로고 숨김 (선택사항) */

  .nav-menu {
    flex-direction: row; /* 메뉴 아이템 가로 정렬 */
    width: 100%;
    justify-content: space-around; /* 간격 균등 분배 */
    align-items: center;
  }

  .nav-menu li a {
    padding: 10px;
    font-size: 0.9rem;
  }
}

.router-link-active {
  background-color: #0d6efd;
  font-weight: bold;
}
</style>
