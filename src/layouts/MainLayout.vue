<template>
  <div class="app-layout">
    <Header
      v-if="route.path !== '/login' && route.path !== '/register'"
      :user-name="userName"
      :user-profile-img="userProfileImg"
      @logout="handleLogout"
    />
    <Nav />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <Register />
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Header from '@/components/Header.vue';
import Nav from '@/components/Nav.vue';
import Register from '@/components/Register.vue';

export default {
  name: 'App',
  components: { Header, Nav, Register },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const userName = ref('');
    const userProfileImg = ref('');

    onMounted(async () => {
      const res = await axios.get('http://localhost:3000/users/1');
      userName.value = res.data.nickname;
      userProfileImg.value = res.data.profile_image_url;
    });
    const handleLogout = () => {
      localStorage.removeItem('user');
      router.push('/login');
    };

    return {
      route,
      handleLogout,
      userName,
      userProfileImg,
      router,
    };
  },
};
</script>

<style>
.app-layout {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
}
.main-content {
  background-color: #131313;
  flex: 1;
  min-width: 0;
}

@media (max-width: 767px) {
  .app-layout {
    flex-direction: column;
    height: auto;
  }

  .main-content {
    width: 100%;
    flex: none;
    padding-bottom: 96px;
    min-height: calc(100vh - 64px);
  }
}
</style>
