# 💰 SHOW ME THE MONEY

> **프리미엄 자산 관리 서비스: THE GOLDEN VAULT**
> Vue 3와 json-server를 활용한 고도화된 가계부 프로젝트입니다.

---

## 🚀 개요

본 프로젝트는 사용자의 수입 및 지출 내역을 체계적으로 관리하기 위한 가계부 서비스입니다. **"The Golden Vault"** 컨셉의 다크 모드 UI와 프리미엄 골드 포인트를 사용하여 사용자에게 고급스러운 금융 경험을 제공합니다.

## 🛠 Tech Stack

- **Frontend**: `Vue 3 (Composition API)`, `Vite`, `Vue Router`
- **Styling**: `CSS3 (Flexbox/Grid)`, `FontAwesome` (Icons)
- **State & Storage**: `LocalStorage` (Session Management)
- **Data Handling**: `Axios`, `Async/Await`
- **Backend (Mock)**: `json-server` (REST API Simulation)

## 🏗 Project Architecture

컴포넌트 기반 설계를 통해 재사용성과 유지보수성을 극대화했습니다.

### 폴더 구조

- `src/components/`: 공통 UI 요소 (Header, Nav)
- `src/pages/`: 라우터 기반 페이지 구성 (Home, List, MyPage)
- `src/router/`: 전역 네비게이션 가드 및 경로 설정
- `public/db.json`: 프로젝트 데이터 저장소

## 🔑 Key Features

### 1. 인증 및 권한 시스템 (Auth System)

- **테스트 계정 로그인**: `db.json`의 사용자 데이터를 조회하여 로그인 처리.
- **세션 관리**: 로그인 성공 시 유저 데이터를 `LocalStorage`에 저장.
- **네비게이션 가드**: `router.beforeEach`를 사용하여 비로그인 사용자의 페이지 접근을 원천 차단.

### 2. CRUD 데이터 처리

- **Axios 비동기 통신**: `async/await`를 사용하여 데이터의 가독성과 안전성을 확보.
- **데이터 흐름**: 가계부 내역의 생성, 조회, 수정, 삭제 기능을 `json-server`와 연동.

### 3. 반응형 네비게이션

- `router-link-active` 클래스를 활용하여 현재 활성화된 메뉴를 시각적으로 강조 (골드 라인 및 그라데이션 효과).

## 🏃‍♂️ Getting Started

### Backend 실행

```bash
# json-server 실행 (3000번 포트)
npx json-server --watch db.json
```
