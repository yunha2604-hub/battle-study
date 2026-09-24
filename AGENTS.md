<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ⚔️ 스쿨배틀 (SchoolBattle Arena) 프로젝트 가이드 & 에이전트 지침서

> **새로운 대화 세션에 참여하는 모든 AI 에이전트는 본 문서를 최우선 기준으로 삼고 프로젝트를 이해하고 작업해야 합니다.**

---

## 📌 1. 프로젝트 정체성 및 기획 배경

- **서비스명**: 스쿨배틀 (SchoolBattle Arena)
- **개발자/기획자**: 박윤하 (청계중학교 3학년)
- **목적**:
  1. **한국디지털미디어고등학교(디미고) e-비즈니스과 특별전형** 필수 제출 서류(실적설명서, 교사추천서) 및 심층면접 질의응답 대비.
  2. 청소년 창업 경진대회 및 교내외 아이디어 발표를 위해 직접 기획·구현한 **실시간 교육 배틀 웹 시제품(MVP)**.
- **핵심 슬로건 및 컨셉**:
  - **"공부를 게임처럼"**
  - 리그 오브 레전드(LoL) 스타일의 긴장감 넘치는 UI/UX와 타격 효과를 결합하여, 학생들이 학교 명예를 걸고 맞붙는 1:1 실시간 퀴즈 배틀 서비스.
  - 학생에게는 학업 몰입과 복습 루프를, 선생님에게는 AI 기반 수행평가 관리 및 채점 업무 경감을 제공.

---

## 🚨 2. [절대 주의] 핵심 도메인 규칙 및 회귀 방지 (CRITICAL)

새로운 세션의 AI 에이전트가 가장 흔하게 범하는 실수를 방지하기 위한 절대 규칙입니다.

### ⚠️ 규칙 1: 생기부 세특(세부능력 및 특기사항) 기능 전면 삭제됨 (부활 절대 금지)
- **배경**: 초기 프로토타입 기획(`PROJECT_OVERVIEW.md` 일부)에는 AI 세특 문구 자동 생성 기능이 포함되어 있었으나, **실제 현직 교사 인터뷰 피드백 및 사용자 최신 요구사항(`docs/teacher.txt`)에 따라 세특 기능은 100% 완전 삭제**되었습니다.
- **금지 사항**: 교사용 화면에 세특 분석 리포트, 세특 추천 문장, NEIS 복사 버튼 등을 임의로 제안하거나 복원하지 마십시오.

### ⚠️ 규칙 2: 교사용 대시보드는 "청계중 3학년 수학과 전용 수행평가 관리"로 단독 고정
- 교사용 대시보드는 다과목 선택 UI가 아니며, **"청계중학교 3학년 수학과(Mathematics)" 전용 환경으로 단독 고정**되어 있습니다.

### 📋 규칙 3: 교사용 수학 수행평가 4단계 End-to-End 라이프사이클
교사용 화면(`TeacherDashboard.tsx`)은 다음 4단계 흐름을 완벽히 지원합니다:
1. **[기능 ①] AI 수학 수행평가 문항 출제**:
   - 교과서 단원(목차), 페이지 범위, 문항 수, 난이도(하/중/상) 입력.
   - 2022 개정 교육과정 성취기준 코드([9수01-01] 등)와 연계된 객관식 및 서술형 문항 자동 생성.
   - 선생님이 검토 후 **`[수행평가 문제 최종 확정]`** 버튼 클릭.
2. **[기능 ②] 수업시간 일회성 시험 코드(PIN) 배포 & 만료 관리**:
   - 문제 확정 후 **대형 일회성 PIN 발급** (예: `MTH-7429`).
   - 교실 프로젝터로 안내하여 학생 즉시 응시. 실시간 답안 제출 현황 모니터링.
   - **`[시험 종료 및 코드 만료]`** 클릭 시 코드는 즉시 **만료(`EXPIRED`)**되어 영구 재사용 차단.
3. **[기능 ③] 학생 수행평가 관리 테이블**:
   - 컬럼 구성: `학년(3학년)`, `반(1~3반)`, `번호(1~30번)`, `이름`, `제출상태`, `AI 1차 점수`, `선생님 2차 확정 점수`, `평가 상태`.
   - **다중 실시간 필터링**: 이름 텍스트 검색, 반 선택 드롭다운, 번호 검색, 채점 상태 필터.
4. **[기능 ④] 2단계 평가 시스템 (AI 1차 자동 채점 ➔ 교사 2차 최종 확정)**:
   - 학생 제출 답안에 대해 AI가 0.1초 만에 1차 자동 채점 및 문항별 부분점수/근거 산출.
   - 선생님이 상세 모달에서 AI 채점 근거 확인 후, 직접 점수 가감/조정(`+` / `-`) 및 교사 피드백 작성 후 **최종 점수 확정(`isConfirmed: true`)**.

---

## 🎮 3. 서비스 구조 및 화면별 핵심 기능

애플리케이션은 최상위 단일 페이지(`src/app/page.tsx`)에서 `view` 상태에 따라 화면을 전환하며, 학생과 교사 간의 데이터가 실시간으로 연동됩니다.

```
랜딩 (LandingPage) ────────────────────────────────── 교사용 대시보드 (TeacherDashboard)
   │ (회원가입 없이 닉네임+학교로 1초 진입)                  │ (AI 수학 출제 ➔ PIN 발급 ➔ 2단계 채점)
   ▼                                                          │
 로비 (Lobby) ──── OP.GG 전적 분석 (PlayerAnalytics)          │
   │           └── 오답 던전 (ShadowRaid)                      │
   │                                                          │
   ├──── 자동 매칭 ────────▶ 배틀 아레나 (BattleArena) ◀───────┘
   ├──── PIN 코드로 입장 ───▶ (일반 배틀 / 학교 대항전 / 수행평가 엄근진 모드)
   └──── 커스텀 방 만들기 ──▶ 결과 페이지 (ResultPage) ──▶ 로비 복귀
```

### 1. 랜딩 페이지 (`LandingPage.tsx`)
- **무마찰 진입(Frictionless Onboarding)**: 회원가입 절차 없이 닉네임과 학교 검색 자동완성만으로 1초 만에 즉시 배틀로 진입(`handleJoin`).
- **다이렉트 진입 기능**: 심사위원 시연 및 테스트를 위해 랜딩 우측 상단/버튼을 통해 [교사 대시보드], [로비], [배틀], [오답 던전], [전적 분석]으로 원클릭 직행 지원.

### 2. 메인 로비 (`Lobby.tsx`)
- **탭 1: ARENA (메인 대기실)**:
  - 프로필 카드: 닉네임, 학교, 티어(아이언~다이아몬드), LP 바.
  - **번개 에너지 시스템**: 최대 5개, 매칭 1회당 1개 소모. 에너지가 0개면 매칭 불가 ➔ **오답 던전(Shadow Raid)을 클리어해야 에너지가 충전되는 강력한 복습 강제 순환 루프**.
  - **전국 학교 랭킹**: 개인 승점이 소속 학교 전체 LP로 합산되어 학교 간 순위 경쟁.
  - 매칭 및 친선전: 과목(국·영·수) 선택 자동 매칭, 6자리 PIN 방 생성 및 코드 입장.
  - 학원 스폰서 이벤트 배너 (예: 동탄고 vs 반송고 대항전).
- **탭 2: ANALYTICS (전적 분석)**:
  - OP.GG 스타일 전적 분석, 과목별 정답률 및 최근 경기 히스토리.
- **탭 3: SHADOW_RAID (오답 던전)**:
  - 틀린 문제가 몬스터(예: 맞춤법 구미호, 삼각함수 가고일)로 등장.
  - 오답 몬스터 격파 시 번개 에너지 및 LP 회복.

### 3. 배틀 아레나 (`BattleArena.tsx`) — 3대 모드 통합
- **1) 일반 배틀 모드**:
  - LoL 스타일 다크 테마, HP 100 대결 (정답 시 상대 -34, 오답 시 내 HP -34).
  - **타임어택 크리티컬 히트**: 제한 시간의 30% 이내 정답 시 데미지 2배 (-68).
  - **심리 압박 시뮬레이터**: 상대방이 먼저 풀면 남은 시간이 10초로 단축되며 화면 테두리가 붉은 맥박으로 경고.
  - 과목별 차등 제한시간 (단어 5~10초, 수학 보스배틀 90초).
- **2) 학교/반 대항전 모드 (`isTeamBattle`)**:
  - 팀 A vs 팀 B 단체 줄다리기 체력 게이지.
  - 화면 우하단 팀원들의 실시간 공격/오답 이벤트 토스트 알림.
- **3) 수행평가 엄근진 모드 (`isStrictAssessment`)**:
  - 학생이 교사용 일회성 시험 코드(PIN)를 입력해 입장했을 때 활성화.
  - 화려한 게임 효과/크리티컬 제거, **흰색 시험지 테마**로 전환.
  - 학생 닉네임 블라인드 익명화 (`Student A (본인)` / `Student B`).
  - 상단 **"화면 이탈 시 0점 처리" 부정행위 방지 경고 배너** 상시 노출.
  - **시험 완료 시 교사 대시보드 학생 테이블로 실시간 자동 제출 및 AI 채점 연동!**

### 4. 결과 페이지 (`ResultPage.tsx`)
- VICTORY / DEFEAT 연출, LP 변동 카운팅 애니메이션.
- LP 100 돌파 시 전체 화면 티어 승격 연출 (`TIER PROMOTED!`).
- 문항별 정답 복기 및 AI 튜터 해설 아코디언.
- 카카오 계정 연동 팝업 (리텐션 장치).

---

## 💻 4. 기술 스택 및 아키텍처 원칙

| 항목 | 사용 기술 및 버전 |
|------|-------------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Library** | React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| **Animation** | Framer Motion (v12) |
| **Icons** | Lucide React |

### 아키텍처 및 상태 관리 특성
- **단일 페이지 기반 오케스트레이션**: `src/app/page.tsx`가 단일 진입점이자 최상위 상태 관리자로 기능.
- **학생 ↔ 교사 실시간 데이터 브릿지**:
  - `assessmentCode`: 교사가 발급한 1회성 PIN (예: `MTH-7429`)
  - `assessmentStatus`: `READY` | `IN_PROGRESS` | `EXPIRED`
  - `mathQuestions`: 교사가 확정한 출제 문항 ➔ 학생 수행평가 배틀 시 시험 문제로 공급
  - `studentAssessments`: 학생이 시험을 마치면 `handleFinishMatch`에서 자동으로 AI 채점을 수행하고 교사 테이블에 즉시 반영
- **완결형 프로토타입 (Zero Backend Dependency)**:
  - 외부 백엔드 API, 데이터베이스, 서드파티 키 없이도 브라우저에서 100% 완벽하게 시연 가능하도록 Mocking 및 시뮬레이션이 정교하게 완성되어 있음.
  - 절대 임의로 복잡한 외부 DB나 백엔드 연동을 강제하여 로컬 시연성을 깨뜨리지 말 것.

---

## 📂 5. 주요 파일 및 디렉토리 맵

```text
d:\workspace\battle-study
├── AGENTS.md                   # [본 파일] AI 에이전트 최우선 가이드
├── CLAUDE.md                   # @AGENTS.md 참조 포인터
├── package.json                # 의존성 및 스크립트 (Next.js 16, React 19, Tailwind v4)
├── docs/
│   ├── teacher.txt             # [필독/최신] 교사용 수학 수행평가 요구사항 정의서
│   ├── 수행평가관리_구현계획.md  # [필독/최신] 수학 수행평가 4단계 구현 명세서
│   └── 주요기능_구조도.md        # 서비스 전체 기능 트리 및 1줄 요약
├── 교사인터뷰_정리.md            # 디미고 입시 대비 교사 인터뷰 & 시연 시나리오
├── PROJECT_OVERVIEW.md         # 초기 기획 개요서 (※ 교사 세특 부분은 과거 기획이므로 주의)
├── src/
│   ├── app/
│   │   ├── page.tsx            # 최상위 뷰 라우팅 및 학생↔교사 데이터 연동 중심축
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── globals.css         # 글로벌 스타일 (Tailwind v4 설정)
│   └── components/
│       ├── LandingPage.tsx     # 온보딩 및 빠른 테스트 진입
│       ├── Lobby.tsx           # 메인 로비 (ARENA, ANALYTICS, SHADOW_RAID)
│       ├── BattleArena.tsx     # 배틀 아레나 (일반, 대항전, 엄근진 수행평가)
│       ├── ResultPage.tsx      # 배틀 결과, LP/티어 변동, AI 오답 복기
│       ├── TeacherDashboard.tsx# [핵심] 수학 수행평가 관리 (AI 출제, PIN, 2단계 채점)
│       ├── ShadowRaid.tsx      # 오답 던전 모듈
│       ├── PlayerAnalytics.tsx # OP.GG 스타일 전적 분석 모듈
│       └── CustomRoomWaiting.tsx# 핀코드 대기실
```

---

## 🛡️ 6. 개발 및 협업 시 AI 에이전트 행동 수칙 (Guardrails)

1. **최상단 Next.js 규칙 블록 보존**:
   - 본 파일 상단의 `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` 블록은 `next dev`에 의해 자동 관리되므로 절대 수정하거나 삭제하지 마십시오.
2. **세특 기능 부활 금지**:
   - `PROJECT_OVERVIEW.md`나 구버전 커밋 로그의 "세특 생성" 언급을 보고 교사용 화면에 세특 기능을 다시 추가하지 마십시오. 현재 스펙은 **"수학 수행평가 관리"**입니다.
3. **독립 실행 가능한 MVP 구조 유지**:
   - 별도 데이터베이스(Supabase, Firebase, Prisma 등) 연결을 강제하거나 외부 인증을 추가하여 로컬 실행(`npm run dev`)을 방해하지 마십시오.
4. **시연 시나리오의 매끄러움 유지**:
   - 본 프로젝트의 본질은 중3 학생(박윤하)이 학교 선생님 및 입시 심사위원 앞에서 5~10분 내에 직접 시연할 수 있는 데모입니다.
   - 학생 배틀 ➔ 오답 던전 ➔ 교사용 대시보드 ➔ PIN 발급 ➔ 학생 시험 응시 ➔ 교사 2단계 채점의 연결 흐름이 끊기지 않도록 UI 연동성을 최우선으로 보호하십시오.

