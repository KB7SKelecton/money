import { createRouter, createWebHistory } from 'vue-router';

import MainLayout from '@/layouts/MainLayout.vue';
import Home from '@/pages/Home.vue';
import List from '@/pages/List.vue';
import MyPage from '@/pages/MyPage.vue';
import Login from '@/pages/Login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 메인 레이아웃 중첩 라우팅
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'home', component: Home },
        { path: 'list', name: 'list', component: List },
        { path: 'mypage', name: 'mypage', component: MyPage },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
});

// 로컬 스토리지에 user 데이터 유무를 통해 비로그인 링크 무단 접속 방지를 위한 로직
/* router.beforeEach((to, from) => {
  const loggedInUser = localStorage.getItem('user');
  const isLoginPage = to.path === '/login';

  if (!isLoginPage && !loggedInUser) {
    alert('로그인이 필요한 서비스입니다.');
    return '/login';
  } else if (isLoginPage && loggedInUser) {
    return '/';
  } else {
    return true;
  }
}); */

export default router;
