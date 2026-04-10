<template>
  <nav class="side-nav">
    <div class="menu-group">
      <router-link :to="{ name: 'home' }" class="nav-item">
        <i class="fas fa-calendar-alt icon"></i>
        <span>홈/달력</span>
      </router-link>

      <router-link :to="{ name: 'list' }" class="nav-item">
        <i class="fas fa-file-invoice-dollar icon"></i>
        <span>재정 내역</span>
      </router-link>

      <router-link :to="{ name: 'mypage' }" class="nav-item">
        <i class="fas fa-user-circle icon"></i>
        <span>마이페이지</span>
      </router-link>
    </div>

    <!-- 프로필 영역 -->
    <div class="profile-section">
      <!-- 프로필 사진 -->
      <div class="profile-avatar" @click="$refs.avatarInput.click()">
        <img v-if="user.avatar" :src="user.avatar" alt="프로필" />
        <i v-else class="fa-solid fa-user profile-default-icon"></i>
        <div class="avatar-overlay">
          <i class="fa-solid fa-camera"></i>
        </div>
      </div>
      <input
        ref="avatarInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onAvatarChange"
      />

      <!-- 이름 -->
      <p
        v-if="!isEditingName"
        class="profile-name"
        @click="isEditingName = true"
      >
        {{ user.name }} <i class="fa-solid fa-pen"></i>
      </p>
      <input
        v-else
        class="profile-input"
        v-model="user.name"
        @blur="finishEditName"
        @keyup.enter="finishEditName"
        autofocus
      />

      <!-- 이메일 -->
      <p
        v-if="!isEditingEmail"
        class="profile-email"
        @click="isEditingEmail = true"
      >
        {{ user.email }} <i class="fa-solid fa-pen"></i>
      </p>
      <input
        v-else
        class="profile-input"
        v-model="user.email"
        @blur="finishEditEmail"
        @keyup.enter="finishEditEmail"
        autofocus
      />
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref({
  name: '',
  email: '',
  avatar: '',
});

const isEditingName = ref(false);
const isEditingEmail = ref(false);

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/users/1');
  user.value.name = res.data.nickname;
  user.value.email = res.data.email;
  user.value.avatar = res.data.profile_image_url;
});

async function finishEditName() {
  isEditingName.value = false;
  await axios.patch('http://localhost:3000/users/1', {
    nickname: user.value.name,
  });
}

async function finishEditEmail() {
  isEditingEmail.value = false;
  await axios.patch('http://localhost:3000/users/1', {
    email: user.value.email,
  });
}

function onAvatarChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    user.value.avatar = e.target.result;
  };
  reader.readAsDataURL(file);
}
</script>

<style scoped>
.side-nav {
  width: 260px;
  height: calc(100vh - 64px);
  top: 64px;
  background-color: #0d0d0d;
  border-right: 1px solid #222;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  padding: 20px 0;
  z-index: 9998;
  position: sticky;
  top: 64px;
  left: 0;
}

.menu-group {
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

.nav-item.router-link-exact-active {
  color: #fff;
  background: linear-gradient(
    90deg,
    rgba(255, 179, 71, 0.1) 0%,
    rgba(255, 179, 71, 0) 100%
  );
}

.nav-item.router-link-exact-active::before {
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

.nav-item.router-link-exact-active .icon {
  color: #ffb347;
  filter: drop-shadow(0 0 5px rgba(255, 179, 71, 0.3));
}

.nav-item.router-link-exact-active span {
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border-top: 1px solid #222;
}

.profile-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffca82, #f8a70c, #ffd483);
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #131313;
}

.profile-default-icon {
  color: #888;
  font-size: 2rem;
}

.avatar-overlay {
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  color: white;
  font-size: 1rem;
}

.profile-name {
  color: #e5e2e1;
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  cursor: pointer;
}

.profile-name i,
.profile-email i {
  font-size: 0.6rem;
  color: #9f8e79;
  margin-left: 4px;
}

.profile-email {
  color: #e5e2e1;
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.5;
  cursor: pointer;
}

.profile-input {
  background-color: #201f1f;
  border: 1px solid #f8a70c;
  border-radius: 8px;
  color: #e5e2e1;
  font-size: 0.85rem;
  text-align: center;
  padding: 6px 10px;
  width: 100%;
  outline: none;
  font-family: 'Manrope', sans-serif;
}

/* 모바일 반응형 */
@media (max-width: 767px) {
  .side-nav {
    width: 100%;
    height: 64px;
    border-right: none;
    border-top: 1px solid #222;
    padding: 0;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    z-index: 9998;
  }

  .menu-group {
    height: 100%;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
  }

  .nav-item {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    padding: 8px 4px 10px;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    text-align: center;
  }

  .icon {
    font-size: 14px;
  }

  .nav-item.router-link-exact-active {
    background: linear-gradient(
      180deg,
      rgba(255, 179, 71, 0.18) 0%,
      rgba(255, 179, 71, 0.06) 100%
    );
  }

  .nav-item.router-link-exact-active::before {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 3px;
    box-shadow: 0 2px 12px rgba(255, 179, 71, 0.5);
  }

  .logo-image {
    display: none;
  }
}
</style>
