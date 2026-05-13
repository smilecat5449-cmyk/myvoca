# MyVocab 단어장 시스템 연구 보고서

## 개요

MyVocab은 React Native와 Expo를 기반으로 한 모바일 단어 학습 앱입니다. OPIc 영어 시험 준비를 위한 단어장으로, 수동 입력과 AI 기반 자동 생성 기능을 제공합니다. 단일 파일(single-file) 아키텍처를 채택하여 모든 로직이 `App.js`에 집중되어 있습니다.

배포: **https://myvocab.pages.dev** (Cloudflare Pages)

## 기술 스택

### 프론트엔드
- **React Native 0.72+**: 모바일 앱 개발 프레임워크
- **Expo SDK 49+**: 개발 및 배포 플랫폼
- **React 18**: UI 라이브러리
- **Lucide React**: 아이콘 라이브러리 (web 호환 버전)

### 백엔드 및 데이터
- **Supabase**: 실시간 데이터베이스 및 인증
- **AsyncStorage**: 로컬 데이터 저장소
- **Google Gemini API**: AI 기반 단어 생성

### 인프라
- **Cloudflare Pages**: 웹 배포 (`npx wrangler pages deploy dist --project-name myvocab`)
- **expo export --platform web --clear**: 웹 빌드 (`dist/` 폴더 생성)

### 개발 도구
- **ESLint**: 코드 품질 검사
- **Babel**: JavaScript 트랜스파일러
- **TypeScript**: 타입 체크 (tsconfig.json)

## 아키텍처

### 파일 구조
```
App.js (5000+ lines) - 메인 애플리케이션 파일
├── LIGHT/DARK 테마 상수 (Soft Avocado Ceramic Design)
├── Supabase 클라이언트 설정
├── React Context (AppCtx)
├── 유틸리티 함수들
├── DEFAULT_CATEGORIES (5개 기본 단어장)
├── AI Gemini API 통합
├── 룸 데코 시스템 (ITEM_SIZE, ALL_ROOM_ITEMS, SHOP_CATALOG)
├── 메인 App 컴포넌트
├── AuthScreen
├── TopBar
├── BottomNav
├── AddScreen
├── ListScreen
├── QuizScreen
├── AvocadoScreen (룸 데코 + 물뿌리개)
├── SettingsScreen
└── 공유 컴포넌트들
```

### 디자인 패턴
- **단일 파일 앱**: 모든 컴포넌트가 하나의 파일에 존재
- **Context API**: 전역 상태 관리
- **컴포넌트 합성**: 재사용 가능한 UI 컴포넌트
- **후크 패턴**: useCallback, useMemo, useRef, useState, useEffect

## 데이터 모델

### 단어 (Word)
```javascript
{
  id: string,           // 고유 식별자
  word: string,         // 영어 단어
  pronunciation: string, // 발음기호 (IPA)
  type: string,         // 품사 (n./v./adj./adv./phr.)
  meaning_ko: string,   // 한국어 뜻
  meaning_en: string,   // 영어 뜻 (선택)
  example: string,      // 예문 (선택)
  date: string,         // 추가 날짜 (YYYY-MM-DD)
  memorized: boolean    // 암기 완료 여부
}
```

### 카테고리 (Category)
```javascript
{
  id: string,           // 고유 식별자
  name: string,         // 카테고리 이름
  isDefault: boolean,   // 기본 카테고리 여부
  words: Word[],        // 포함된 단어들 (기본 카테고리만)
  createdAt?: string    // 생성 날짜
}
```

### 아보카도 (Avocado) - 게이미피케이션
```javascript
{
  level: number,        // 성장 레벨 (1-3)
  totalCares: number,   // 총 케어 횟수
  careThisWeek: number, // 이번 주 케어 횟수
  coins: number,        // 보유 코인
  skinIndex: number,    // 스킨 인덱스
  backgroundIndex: number, // 배경 인덱스
  lastLogin: string,    // 마지막 로그인 날짜
  dailyCoinsFromQuiz: number, // 오늘 퀴즈로 얻은 코인
  dailyCoinsFromWords: number // 오늘 단어 추가로 얻은 코인
}
```

### 프로필 (Profile)
```javascript
{
  nickname: string,     // 사용자 닉네임
  photoUri: string,     // 프로필 사진 URI
  createdAt: string     // 계정 생성 날짜
}
```

### 룸 아이템 (RoomItem) — 배치된 소품
```javascript
{
  id: string,     // placed item 고유 ID
  itemId: string, // ALL_ROOM_ITEMS의 id 참조
  x: number,      // 배치 x 좌표
  y: number,      // 배치 y 좌표
  w: number,      // 렌더 너비
  h: number,      // 렌더 높이
}
```

## 상태 관리

### 전역 상태 (AppCtx)
- **theme**: 'light' | 'dark'
- **words**: Word[] - 모든 단어 목록
- **geminiKey**: string - Gemini API 키
- **tab**: string - 현재 활성 탭
- **toast**: string - 토스트 메시지
- **sbUser**: object - Supabase 사용자 정보
- **categories**: Category[] - 기본 카테고리
- **customCategories**: Category[] - 사용자 정의 카테고리
- **selectedCategory**: string - 선택된 카테고리 ID
- **avocado**: Avocado - 아보카도 상태
- **profile**: Profile - 사용자 프로필

### 룸 상태 (AvocadoScreen 내부)
- **placedItems**: RoomItem[] - 현재 방에 배치된 소품 목록
- **ownedItems**: string[] - 소장한 아이템 ID 목록
- **wateringCanCount**: number - 보유 물뿌리개 개수
- **roomBg**: string - 현재 배경 ID
- **decorTab**: string - 데코 드로어 탭 ('캐릭터'|'가구'|'배경')

### 저장소 키
- `myvocab_v3`: 단어 데이터
- `myvocab_theme`: 테마 설정
- `myvocab_gemini_key`: Gemini API 키
- `myvocab_categories`: 카테고리 데이터
- `myvocab_avocado`: 아보카도 상태
- `myvocab_profile`: 프로필 데이터
- `myvocab_daily_log`: 일일 로그
- `myvocab_room_state`: 룸 상태 (placedItems, ownedItems, roomBg, wateringCanCount)

## 룸 데코레이션 시스템

### 핵심 상수
```javascript
// 실제 이미지 원본 비율 기준 크기 (렌더 시 rw 기준으로 스케일)
const ITEM_SIZE = {
  char_avocado: { w: 1120, h: 1232 },  // 캐릭터 (크게 유지)
  curtain:      { w: 210, h: 250 },    // 소품 (절반 크기)
  sofa:         { w: 220, h: 148 },
  table:        { w: 180, h: 126 },
  glasses:      { w: 82,  h: 40  },
  tumbler:      { w: 62,  h: 78  },
};

const ALL_ROOM_ITEMS = [
  { id: 'char_avocado', category: '캐릭터', label: '아보카도',  free: true },
  { id: 'sofa',         category: '가구',   label: '소파',      free: true },
  // ...가구, 배경 항목들
];
```

### 캐릭터 위치 계산
```javascript
const charFixedPos = (rw, rh, itemId) => {
  const base = ITEM_SIZE[itemId] || { w: 280, h: 308 };
  const w = Math.round(rw * 0.40);
  const h = Math.round(w * (base.h / base.w));
  return {
    x: Math.round((rw - w) / 2),
    y: Math.round(rh * 0.58),  // 화면 중앙~하단 사이
    w, h,
  };
};
```

### 초기 방 상태
- 캐릭터(char_avocado)만 배치됨, 가구 없음
- 소품은 상점에서 구매 후 소장 목록에 들어가고, 사용자가 직접 데코 드로어에서 배치해야 함

### 구매 및 소장 흐름
1. 상점(SettingsScreen 내 Shop)에서 아이템 구매
2. `ownedItems`에 아이템 ID 추가
3. 데코 드로어에서 소장 중인 아이템만 표시
4. 드래그해서 방에 배치 → `placedItems`에 추가

### 레거시 마이그레이션
이전 버전(가구 자동 배치)에서 저장된 상태를 자동 정리:
```javascript
const LEGACY_FREE_PROPS = ['sofa', 'table', 'curtain', 'glasses', 'tumbler'];

const migratePlaced = (items, rw, rh) => {
  const cleaned = items.filter(p => !LEGACY_FREE_PROPS.includes(p.itemId));
  // 캐릭터가 없으면 기본 캐릭터 추가
  ...
};
const migrateOwned = (items) =>
  items.filter(id => !LEGACY_FREE_PROPS.includes(id));
```

### Supabase 룸 동기화
- 테이블: `user_room_state`
- 컬럼: `room_bg`, `placed_items`, `owned_items`, `watering_can_count`
- 로그인 시 Supabase에서 로드, 변경 시 debounce 저장

### DraggableRoomItem
- `PanResponder` 기반 드래그 앤 드롭
- 드래그 이동(>4px): 위치 업데이트
- 제자리에서 600ms 유지(롱프레스): 아이템 제거
- 캐릭터(`char_avocado`)는 항상 고정 위치로 재계산됨

## 물뿌리개 시스템

### 구매
- 상점 코인 잔액 UI 아래에 물뿌리개 카드 표시
- 가격: 50 코인
- 구매 시 `wateringCanCount` 증가 (소장 목록에는 추가 안 됨)

### 사용 (아보카도 홈)
- 프로필 바 아래에 `🪣 N개` 버튼 표시
- 버튼 클릭 시:
  - `wateringCanCount` 1 감소
  - `careAvocado(1)` 호출 → 아보카도 케어 +1
  - 보유 0개면 상점 유도 토스트

## 화면 구성

### 1. 인증 화면 (AuthScreen)
- 로그인/회원가입 토글
- 이메일/비밀번호 입력
- Supabase 인증 연동
- 로그인 없이 사용 옵션

### 2. 상단 바 (TopBar)
- 앱 로고: 홈으로 이동
- 프로필 버튼: 아보카도 화면으로 이동
- 테마 토글: 라이트/다크 모드 전환

### 3. 하단 네비게이션 (BottomNav)
- **홈**: 단어 추가
- **단어장**: 단어 목록 및 관리
- **퀴즈**: 플래시카드 퀴즈
- **아보카도**: 게이미피케이션 + 룸 데코

### 4. 단어 추가 화면 (AddScreen)
- 수동 추가 폼 (단어, 발음기호, 품사, 뜻, 예문)
- 코인 보상 (+3, 하루 최대 3회)
- AI 자동 생성 (Gemini API)

### 5. 단어장 화면 (ListScreen)
- 카테고리 탭 (기본 5개 + 사용자 정의)
- 필터 및 검색 (전체/미암기/암기완료, 단어/뜻 검색)
- 알파벳 그룹화, 페이지네이션(20개씩)
- 암기 토글, 삭제, 상세 모달

### 6. 퀴즈 화면 (QuizScreen)
- 설정 뷰: 카테고리 선택, 통계, 진행률
- 세션 뷰: 플래시카드, 뜻 확인 애니메이션
- 결과 뷰: 통계, 코인 획득 표시
- 코인 보상 (+1, 하루 최대 10회)

### 7. 아보카도 화면 (AvocadoScreen)
#### 홈 뷰
- 아보카도 방 렌더링 (배경 이미지 + 배치된 소품들)
- 프로필 바: 닉네임, 코인, 아보카도 레벨
- 물뿌리개 버튼 (`🪣 N개`) — 아보카도 케어
- 상점 버튼, 데코 버튼 (하단 우측)

#### 상점 뷰
- 탭: 캐릭터 / 가구 / 배경
- 코인 잔액 표시
- 물뿌리개 구매 카드 (50코인)
- 아이템 구매 → ownedItems에 추가

#### 데코 드로어
- Animated 슬라이드 드로어 (하단에서 올라옴)
- 탭: 캐릭터 / 가구 / 배경
- **소장 중인 아이템만** 표시 (미소장 아이템 숨김)
- 아이템 탭 → 방에 배치

### 8. 설정 화면 (SettingsScreen)
- 프로필 섹션 (닉네임 수정, 사진 업로드)
- 계정 섹션 (이메일 표시, 로그아웃)
- AI API 섹션 (Gemini 키 입력/표시)
- 화면 섹션 (다크 모드 토글)
- 데이터 섹션 (JSON 내보내기)
- 위험 구역 (전체 삭제)

## AI 기능

### Gemini API 통합
- **API 엔드포인트**: `gemini-pro:generateContent`
- 입력 분석 (단어 목록 vs 문장)
- 구조화된 JSON 출력 요구
- 에러 처리: API 실패, JSON 파싱 실패

## 게이미피케이션 시스템

### 코인 경제
- **획득 방법**
  - 단어 추가: +3 코인 (하루 최대 3회)
  - 퀴즈 정답: +1 코인 (하루 최대 10회)
  - 일일 로그인: +10 코인
- **사용 방법**
  - 물뿌리개 구매: 50 코인
  - 가구/캐릭터/배경 아이템 구매: 가격 상이

### 아보카도 성장
- **레벨 시스템**
  - Lv 1: 케어 0-24회
  - Lv 2: 케어 25-49회
  - Lv 3: 케어 50회 이상
- **케어 방법**
  - 물뿌리개 사용: +1 케어 (물뿌리개 소모)
- **주간 추적**: 이번 주 케어 횟수 리셋

## 테마 시스템 (Soft Avocado Ceramic Design)

### 색상 팔레트
```javascript
const LIGHT = {
  bg:        '#f5f1e8',  // Warm Oatmeal
  paper:     '#faf8f4',  // Soft Cream
  ink:       '#2d2d2d',  // Dark Charcoal Gray
  blue:      '#a8bfa3',  // Soft Avocado Green (메인 강조색)
  warmBrown: '#9b8b7e',  // Warm Brown (버튼, 액션)
  green:     '#9db99b',  // Soft Green (완료, 성공)
  red:       '#b8837d',  // Soft Red Brown (경고)
  // ...
};
```

### 다크 모드 지원
- 모든 컴포넌트가 테마 컨텍스트 사용
- 실시간 테마 전환, AsyncStorage에 저장

## 데이터 저장 및 동기화

### 로컬 저장소 (AsyncStorage)
- 비동기 저장: 상태 변경 시 즉시 저장
- 키-값 구조: JSON 문자열

### Supabase 동기화
- **인증**: 이메일/비밀번호
- **테이블**: `words`, `user_room_state`
- 로그인 시 Supabase에서 데이터 로드
- 오프라인 우선: 로컬 저장을 기본으로 함

### 룸 상태 저장 (persistRoomState)
```javascript
const persistRoomState = useCallback((bg, items, owned, canCount) => {
  // Supabase: room_bg, placed_items, owned_items, watering_can_count
  // AsyncStorage: myvocab_room_state JSON
}, [sbUser]);

useEffect(() => {
  persistRoomState(roomBg, placedItems, ownedItems, wateringCanCount);
}, [roomBg, placedItems, ownedItems, wateringCanCount]);
```

## 성능 최적화

- **React.memo**: 불필요한 리렌더링 방지
- **useMemo / useCallback**: 계산 캐싱, 함수 재생성 방지
- **Animated.spring**: 드로어 슬라이드 애니메이션
- **PanResponder**: 네이티브 드래그 처리

## 배포

| 플랫폼 | 명령 | URL |
|---|---|---|
| 웹 빌드 | `expo export --platform web --clear` | `dist/` 폴더 |
| Cloudflare Pages | `npx wrangler pages deploy dist --project-name myvocab` | https://myvocab.pages.dev |
| Android | `npm run android` | — |
| iOS | `npm run ios` | — |

## 결론

MyVocab은 단어 학습 + 아보카도 육성 게임 요소를 결합한 모바일 앱입니다. 단일 파일 아키텍처로 모든 로직이 App.js에 집중되어 있으며, Supabase 클라우드 동기화와 AsyncStorage 오프라인 저장을 병행합니다. 룸 데코레이션 시스템으로 사용자가 코인으로 소품을 구매하고 직접 배치하는 커스터마이징 경험을 제공합니다.
