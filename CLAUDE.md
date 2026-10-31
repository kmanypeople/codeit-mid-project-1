@AGENTS.md

# 왈라 응답 화면 A/B 테스트

코드잇 중급 프로젝트 3팀 과제다. 글로벌 폼 빌더 왈라(Walla)의 설문 응답 화면을 개선하고,
기존 화면(A안)과 개선안(B안)을 A/B 사용성 테스트로 비교한다.

작업을 시작하기 전에 [docs/handoff.md](docs/handoff.md)를 읽는다. 지금까지 내린 결정, 현재 상태, 남은 일이 정리돼 있다.

## 먼저 알아둘 것

- 배포 사이트: https://codeit-mid-project-1.vercel.app
- `main`에 푸시하면 Vercel이 자동으로 배포한다.
- 실제 사이트는 [public/ab-test.html](public/ab-test.html) 파일 하나다. `/`와 `/ab-test`는 [next.config.mjs](next.config.mjs)에서 이 파일로 보낸다.
- `app/`, `components/`, `lib/`의 React 화면은 이전 버전이고 사이트에서 연결이 끊겨 있다. 화면을 고칠 때는 `public/ab-test.html`을 고친다.

## 작업 규칙

- 사용자는 비개발자다. 설명은 한국어로 쉽게 한다.
- 커밋과 푸시는 사용자가 요청할 때만 한다. 푸시 전에 사이트에 어떤 영향이 있는지 알린다.
- A안은 실제 왈라 화면과 똑같아야 한다. 개선은 B안에만 넣는다.
- `track()` 호출을 지우거나 이벤트 이름·속성을 바꾸지 않는다. 대시보드가 깨진다.
- 저장소는 공개 상태다. 키, 토큰, 참가자 응답, 내부 조사 자료를 커밋하지 않는다.

## 명령어

```bash
npm install
npm run dev
npm run build
npm run lint
```
