import mixpanel from "mixpanel-browser";

let initialized = false;

function ensureInit(): boolean {
  if (initialized) return true;
  if (typeof window === "undefined") return false;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return false;

  mixpanel.init(token, {
    autocapture: false,
    track_pageview: false,
    persistence: "localStorage",
    debug: process.env.NODE_ENV === "development",
  });
  initialized = true;
  return true;
}

/**
 * 응답 1회의 시작점. 이후 모든 이벤트에 response_id가 붙고,
 * submit_succeeded에는 시작부터 걸린 시간이 $duration(초)으로 자동 첨부된다.
 */
export function startSurveyResponse(): void {
  if (!ensureInit()) return;
  mixpanel.register({ response_id: crypto.randomUUID() });
  mixpanel.time_event("submit_succeeded");
}

/**
 * PRD 9장 계측 원칙: 이벤트 이름은 예시이며 답변 원문·이메일은 넣지 않는다.
 * 문항/옵션 id 같은 구조적 정보만 속성으로 담는다.
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!ensureInit()) return;
  mixpanel.track(event, properties);
}

/**
 * A/B 테스트처럼 이후 모든 track() 호출에 공통으로 실어 보낼 속성을 등록한다.
 * (예: ab_variant, ab_order_position, ab_test_session_id)
 */
export function setSuperProps(properties: Record<string, unknown>): void {
  if (!ensureInit()) return;
  mixpanel.register(properties);
}
