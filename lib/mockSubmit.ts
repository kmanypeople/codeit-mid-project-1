import { Answers, DemoOutcome, OtherTexts } from "./types";

export interface SubmitPayload {
  answers: Answers;
  otherTexts: OtherTexts;
}

/**
 * 실제 서버 저장을 대신하는 더미 제출 함수.
 * - success: 지연 후 정상 저장 완료
 * - failed: 지연 후 "확인된 실패" (네트워크/서버 오류)
 * - unknown: 끝까지 응답하지 않아 호출부의 타임아웃이 '결과 미확인' 처리를 하게 한다
 * - random: 데모 중 임의 체험용 (success 65% / failed 20% / unknown 15%)
 *
 * 데모용 시뮬레이션일 뿐이며, 실제 중복 제출 방지가 서버에 구현되어 있음을 뜻하지 않는다.
 */
export function mockSubmit(
  _payload: SubmitPayload,
  outcome: DemoOutcome,
): Promise<void> {
  const resolvedOutcome = outcome === "random" ? pickRandomOutcome() : outcome;
  const delayMs = 900 + Math.random() * 700;

  if (resolvedOutcome === "unknown") {
    // 의도적으로 영원히 settle되지 않는 Promise: 호출부 타임아웃이 상태를 결정한다.
    return new Promise<void>(() => {});
  }

  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (resolvedOutcome === "success") {
        resolve();
      } else {
        reject(new Error("네트워크 오류로 제출에 실패했습니다."));
      }
    }, delayMs);
  });
}

function pickRandomOutcome(): "success" | "failed" | "unknown" {
  const roll = Math.random();
  if (roll < 0.65) return "success";
  if (roll < 0.85) return "failed";
  return "unknown";
}
