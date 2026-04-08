<template>
  <div class="login-container">
    <div class="bg-decoration"></div>

    <form @submit.prevent="handleLogin" id="loginFrm" class="login-box">
      <h1 class="logo">
        <img src="../assets/logo.png" alt="SHOW ME THE MONEY" />
        <span class="subtitle">household account book</span>
      </h1>

      <div class="input-wrap">
        <div class="label-group">
          <label for="userEmail">사용자 이메일</label>
          <i class="icon-user">👤</i>
        </div>
        <input
          type="email"
          id="userEmail"
          placeholder="이메일을 입력하세요."
          v-model="loginData.email"
          required
        />
      </div>

      <button type="submit" class="submit-btn">시작하기</button>

      <div class="footer-info">
        <span>가계부를 만들어봐요</span>
        <i class="icon-shield">🛡️</i>
      </div>
    </form>

    <p class="copyright">© 2026 Ozosama Skeleton Project</p>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const loginData = reactive({
  email: '',
});

const handleLogin = async () => {
  try {
    // 1. db.json에서 유저 목록 가져오기
    const response = await axios.get('http://localhost:3000/users');
    const users = response.data;

    // 2. 입력한 이메일과 일치하는 유저 찾기
    const user = users.find((u) => u.email === loginData.email);

    if (user) {
      // 로그인 성공: 유저 정보를 로컬 스토리지에 저장 (나중에 user_id를 쓰기 위함)
      localStorage.setItem('user', JSON.stringify(user));
      alert(`${user.nickname}님, 환영합니다!`);

      // 메인 페이지로 이동
      router.push('/');
    } else {
      // 로그인 실패: 일치하는 이메일 없음
      alert('등록되지 않은 사용자 이메일입니다. 다시 확인해주세요.');
    }
  } catch (error) {
    console.error('로그인 통신 에러:', error);
    alert('서버 연결에 실패했습니다. json-server가 켜져 있는지 확인하세요.');
  }
};
</script>

<style scoped>
/* 전체 화면 설정 */
.login-container {
  min-height: 100vh;
  background-color: #0d0d0d;
  background-image: radial-gradient(circle at center, #1a1a1a 0%, #0d0d0d 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* 로고 및 제목 */
.logo {
  text-align: center;
  margin-bottom: 40px;
}
.logo img {
  width: 200px;
  display: block;
  margin: 0 auto 10px;
}
.subtitle {
  color: #666;
  font-size: 12px;
  letter-spacing: 4px;
  font-weight: 300;
}

/* 메인 로그인 박스 */
.login-box {
  width: 100%;
  max-width: 420px;
  background: #222222;
  padding: 50px 40px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border-top: 1px solid #444; /* 상단 미세한 하이라이트 */
  z-index: 10;
}

/* 입력창 스타일 */
.input-wrap {
  margin-bottom: 30px;
}
.label-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.label-group label {
  color: #ffb347; /* 이미지의 골드 텍스트 컬러 */
  font-size: 13px;
  font-weight: 600;
}
.icon-user {
  font-size: 12px;
  opacity: 0.5;
}

input {
  width: 100%;
  background: #333333;
  border: 1px solid transparent;
  padding: 16px;
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}
input:focus {
  outline: none;
  border-color: #ffb347;
  background: #3a3a3a;
  box-shadow: 0 0 10px rgba(255, 179, 71, 0.2);
}

/* 시작하기 버튼 */
.submit-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(255, 179, 71, 0.3);
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 179, 71, 0.4);
}
.submit-btn:active {
  transform: translateY(0);
}

/* 하단 보안 정보 */
.footer-info {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #444;
  font-size: 11px;
  letter-spacing: 1px;
}

.copyright {
  position: absolute;
  bottom: 30px;
  color: #333;
  font-size: 10px;
  letter-spacing: 1px;
}
</style>
