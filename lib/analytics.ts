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
  });
  initialized = true;
  return true;
}

/**
 * PRD 9장 계측 원칙: 이벤트 이름은 예시이며 답변 원문·이메일은 넣지 않는다.
 * 문항/옵션 id 같은 구조적 정보만 속성으로 담는다.
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!ensureInit()) return;
  mixpanel.track(event, properties);
}
