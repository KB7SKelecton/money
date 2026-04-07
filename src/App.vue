<template>
  <div class="app-layout">
    <Header />
    <router-view></router-view>
  </div>
</template>
<script>
import Header from '@/components/Header.vue';
import { provide } from 'vue';

export default {
  name: 'App',
  components: { Header },
  setup() {},
};
</script>

<style>
/* 기본 마진 제거 */
body {
  margin: 0;
  padding: 0;
}

.app-layout {
  display: flex; /* 가로 배치 */
  width: 100%;
  min-height: 100vh;
}

.main-content {
  flex: 1; /* 사이드바 제외 나머지 공간 모두 차지 */
  padding: 30px;
  background-color: #ffffff;
  overflow-y: auto; /* 본문이 길어지면 본문만 스크롤 */
}
</style>
