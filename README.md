## supply

Electron 기반의 바이브 코딩 툴

### Introduce

Supply는 React, Electron 기반의 바이브 코딩 툴이며 개발 폴더를 열고, 그 안의 React 앱을 실행시키고, 실행한 React 앱을 Electron 화면에서 직접 확인하며 **LangChain 기반 AI 에이전트**를 통해 개발 폴더의 파일을 직접 수정할 수 있게 하여 개발하는 새로운 바이브 코딩 툴입니다.

#### 🤖 AI 에이전트 기능 (NEW!)
- **LangChain 통합**: 강력한 AI 에이전트가 프로젝트를 분석하고 수정합니다
- **멀티 LLM 지원**: ChatGPT(OpenAI) 또는 Gemini(Google) 선택 가능
- **ReAct 패턴**: 추론과 행동을 반복하며 복잡한 작업 수행
- **파일 시스템 도구**: 파일 읽기/쓰기, 검색, 분석 자동화
- **프로젝트 분석**: 구조 파악, 의존성 분석, 코드 통계

Git을 지원하여 버튼 클릭 만으로 github에 git commit, clone, sync 등을 진행할 수 있습니다.

### Development RoadMap(TODO List)

#### Phase 1: 기본 인프라
- [x] Electron 앱 기본 설정 (main/renderer 프로세스, IPC)
- [x] 폴더 선택 기능 추가

#### Phase 2: UI 개발
- [x] 레이아웃 구현 (사이드바, 헤더, 분할 패널)
- [x] iframe 프리뷰 패널
- [x] AI 채팅 UI (메시지 리스트, 코드 블록, 스트리밍)

#### Phase 3: React 앱 실행
- [ ] 개발 서버 프로세스 관리 (메인 종료 시 서브 프로세스가 종료되고 포트가 닫혀야 함)
- [x] 프리뷰 통합
- [ ] 프로젝트 제작 기능 추가

#### Phase 4: AI Agent 개발 ✨ 구현 완료!
- [x] LangChain 통합 (API 키 관리, 멀티 LLM)
- [x] 파일 수정 기능 (읽기/쓰기, 분석, 검색)
- [x] 컨텍스트 관리 (프로젝트 분석, ReAct 패턴)
- [x] 안전장치 (경로 검증, 민감 파일 보호)

#### Phase 5: Git 연동
- [ ] Git 기본 기능 (저장소 감지, 변경 사항 표시)
- [ ] Git 명령어 (Commit, Pull, Push, Sync)
- [ ] GitHub 통합 (OAuth, Remote 연동)

#### Phase 6: 완성도
- [ ] 설정 시스템 (환경 설정, 테마)
- [ ] 성능 최적화 (캐싱, 메모리 관리)
- [ ] 테스트 작성

#### Phase 7: 배포
- [ ] 멀티 플랫폼 빌드 (Windows, macOS, Linux)
- [ ] 자동 업데이트 시스템
- [ ] 문서화 (사용자 가이드, API 문서)

### Quick Start (LangChain AI 에이전트)

```bash
# 1. 의존성 설치
npm install

# 2. 개발 모드 시작
npm run dev

# 3. 앱에서:
# - API Key 입력 (OpenAI 또는 Google)
# - 프로젝트 폴더 선택
# - AI에게 요청 입력 (예: "App.tsx를 분석해줄 수 있나?")
```

자세한 가이드는 [LANGCHAIN_GUIDE.md](./LANGCHAIN_GUIDE.md)를 참조하세요.

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
