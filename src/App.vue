<template>
  <div class="app-layout">
    <Header />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <button class="fab-button" @click="handleAddClick">+</button>
  </div>
</template>
<script>
import Header from '@/components/Header.vue';
import { provide } from 'vue';

export default {
  name: 'App',
  components: { Header },
  setup() {
    const handleAddClick = () => {
      alert('내역 추가 창을 띄울 예정입니다!');
      // 여기에 라우터 이동이나 모달 오픈 로직을 넣으세요.
    };
    return { handleAddClick };
  },
};
</script>

<style>
body {
  margin: 0;
}

.app-layout {
  display: flex;
  flex-direction: row; /* 기본은 가로 배치 (PC) */
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
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
</style>
