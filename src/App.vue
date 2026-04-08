<template>
  <div class="app-layout">
    <Nav />
    <!-- <Header /> -->
    <main class="main-content">
      <router-view></router-view>
    </main>
    <!-- 마이페이지 빼고 + 버튼 생성 -->
    <button
      v-if="route.path !== '/mypage'"
      class="fab-button"
      @click="handleAddClick"
    >
      +
    </button>
  </div>
</template>
<script>
import Header from '@/components/Header.vue';
import Nav from '@/components/Nav.vue';
import { useRoute } from 'vue-router'; // 추가!

export default {
  name: 'App',
  components: { Header, Nav },
  setup() {
    const route = useRoute(); // 추가!

    const handleAddClick = () => {
      alert('내역 추가 창을 띄울 예정입니다!');
    };

    return { handleAddClick, route }; // route 추가!
  },
};
</script>

<style>
body {
  margin: 0;
  background-color: #131313;
}

.app-layout {
  display: flex;
  flex-direction: row; /* 기본은 가로 배치 (PC) */
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 0;
  background-color: #131313;
}

/* 스마트폰 화면 (768px 미만) */
@media (max-width: 767px) {
  .app-layout {
    flex-direction: column; /* 세로 배치로 변경 */
  }

  .main-content {
    padding-bottom: 80px; /* 하단 바에 컨텐츠가 가려지지 않게 여백 추가 */
  }
}
.fab-button {
  position: fixed; /* 화면에 고정 */
  bottom: 30px; /* 맨 아래에서 30px 띄움 */
  right: 30px; /* 맨 오른쪽에서 30px 띄움 */
  width: 60px; /* 너비 */
  height: 60px; /* 높이 */
  border-radius: 50%; /* 완벽한 동그라미 */
  background-color: #0d6efd; /* 강조색 (파란색) */
  color: white; /* 글자색 */
  font-size: 30px; /* + 기호 크기 */
  font-weight: bold;
  border: none; /* 테두리 제거 */
  cursor: pointer; /* 마우스 커서 변경 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 입체감 그림자 */
  z-index: 2000; /* 어떤 요소보다 위에 보이게 */
  transition: all 0.2s ease; /* 부드러운 애니메이션 */
}

/* 버튼에 마우스 올렸을 때 효과 */
.fab-button:hover {
  background-color: #0b5ed7;
  transform: scale(1.1); /* 살짝 커짐 */
}

/* 버튼 클릭했을 때 효과 */
.fab-button:active {
  transform: scale(0.9); /* 살짝 작아짐 */
}

/* 모바일 전용 여백 조절 (메뉴바와 겹치지 않게) */
@media (max-width: 767px) {
  .app-layout {
    flex-direction: column;
  }

  .main-content {
    padding-bottom: 80px;
  }

  /* 모바일에서는 메뉴바(60px) 위로 버튼을 조금 더 올림 */
  .fab-button {
    bottom: 80px;
  }
}
</style>
