<template>
  <!-- 상단 고정 헤더 전체 -->
  <header class="header">
    <!-- 로고 & 타이틀(클릭하면 홈으로 이동) -->
    <div class="header-left">
      <img
        alt="Logo"
        class="header-logo"
        src="../../public/logoHeader.png"
        @click="goHome"
        style="cursor: pointer"
      />
      <!-- @click="goHome": 클릭하면 goHome 함수 실행 -->
      <!-- style="cursor: pointer": 마우스 갖다 대면 손가락 모양으로 바뀜 -->
      <h1 class="header-title" @click="goHome" style="cursor: pointer">
        Show Me The Money
      </h1>
    </div>

    <!-- 오른쪽: 프로필 사진 + 이름 + 로그아웃 버튼 -->
    <div class="header-right">
      <!-- 프로필 사진 + 이름 묶음 -->
      <div class="user-info">
        <!-- :src="userProfileImg": 부모에서 받아온 프로필 이미지 주소를 src에 연결 -->
        <img alt="User profile" class="user-avatar" :src="userProfileImg" />
        <!-- {{ userName }}: 부모에서 받아온 이름을 화면에 출력 -->
        <span class="user-name">{{ userName }} 님</span>
      </div>

      <!-- 로그아웃 버튼: 클릭하면 handleLogout 함수 실행 -->
      <button class="logout-btn" @click="handleLogout">
        <!-- material-symbols-outlined: 구글 아이콘 폰트 (logout = 로그아웃 아이콘) -->
        <span class="material-symbols-outlined">logout</span>
        <span class="logout-text">로그아웃</span>
      </button>
    </div>
  </header>
</template>

<script setup>
//  페이지 이동(라우팅)을 코드로 하기 위해 router 기능을 가져오는 것
import { useRouter } from "vue-router";

// defineProps: 부모 컴포넌트에서 이 헤더로 데이터를 전달받을 때 사용
defineProps({
  userName: {
    type: String,
    default: "김금융",
  },
  userProfileImg: {
    type: String,
    default: "https://api.dicebear.com/7.x/thumbs/svg?seed=금융",
  },
});
const router = useRouter();

// 클릭 시 홈으로 이동하는 함수
const goHome = () => router.push("/");

// defineEmits: 자식(헤더)이 부모한테 "이런 일이 일어났어!" 라고 알려줄 때 사용
const emit = defineEmits(["logout"]);

// 로그아웃 버튼 클릭 시 → 부모한테 "logout 눌렸어!" 라고 알림
// 실제 로그아웃 처리(localStorage 삭제, 페이지 이동)는 부모가 함
const handleLogout = () => emit("logout");
</script>

<style scoped>
/* ── PC 기본 스타일 ── */
.header {
  position: fixed; /* 스크롤해도 헤더가 화면 상단에 고정됨 */
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: #131313;
  border-bottom: 2px solid #f8a70c;
  z-index: 9999; /* 다른 요소들 위에 항상 올라와 있게 (숫자 클수록 위에 표시됨) */
  display: flex;
  align-items: center;
  justify-content: space-between; /* 왼쪽/오른쪽 요소를 양 끝으로 밀어냄 */
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.header-title {
  color: #f8a70c;
  font-style: italic;
  font-weight: 900;
  font-size: 1.25rem;
  margin: 0;
  letter-spacing: -0.05em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #2a2a2a;
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(248, 167, 12, 0.3);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e5e2e1;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(229, 226, 225, 0.5);
  background: none;
  border: none;
  cursor: pointer;
}

.logout-btn .material-symbols-outlined {
  font-size: 18px;
}

/* 모바일 화면(767px 이하)일 때 적용되는 스타일 */
@media (max-width: 767px) {
  .header {
    height: 48px; /* 64px → 48px로 줄임 */
    padding: 0 16px; /* 좌우 패딩도 줄임 */
  }
  .header-title {
    display: none; /* 타이틀 숨김 */
  }

  .user-name {
    display: none; /* 이름 숨김 */
  }

  .user-info {
    padding: 0px; /* 이름 없으니 패딩 줄임 */
  }

  .logout-text {
    display: none; /* 로그아웃 텍스트 숨김 */
  }
  .header-logo {
    height: 22px; /* 로고 크기 작게 40px → 28px */
  }
  .material-symbols-outlined {
    font-size: 20px; /* 아이콘 크기 줄임 */
  }
}
</style>
