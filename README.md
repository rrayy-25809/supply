## supply

Electron 기반의 바이브 코딩 툴

### Introduce

Supply는 React, Electron 기반의 바이브 코딩 툴이며 개발 폴더를 열고, 그 안의 React 앱을 실행시키고, 실행한 React 앱을 Electron 화면에서 직접 확인하며 LLM API Key를 입력받아 에이전트가 개발 폴더의 파일을 직접 수정할 수 있게 하여 개발하는 새로운 바이브 코딩 툴입니다.

Git을 지원하여 버튼 클릭 만으로 github에 git commit, clone, sync 등을 진행할 수 있습니다.

### Development RoadMap(TODO List)

#### Phase 1: 기본 인프라
- [x] Electron 앱 기본 설정 (main/renderer 프로세스, IPC)
- [ ] 폴더 선택 기능 추가

#### Phase 2: UI 개발
- [x] 레이아웃 구현 (사이드바, 헤더, 분할 패널)
- [ ] iframe 프리뷰 패널
- [x] AI 채팅 UI (메시지 리스트, 코드 블록, 스트리밍)

#### Phase 3: React 앱 실행
- [ ] 개발 서버 프로세스 관리
- [ ] 프리뷰 통합

#### Phase 4: AI Agent 개발
- [ ] LLM 통합 (API 키 관리, 스트리밍 응답)
- [ ] 파일 수정 기능 (읽기/쓰기, Diff, 롤백)
- [ ] 컨텍스트 관리 (프로젝트 분석, 대화 히스토리)
- [ ] 안전장치 (백업, 민감 파일 보호)

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

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
