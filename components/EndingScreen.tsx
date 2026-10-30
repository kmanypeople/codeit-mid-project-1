"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import styles from "./EndingScreen.module.css";

interface EndingScreenProps {
  surveyTitle: string;
  submittedAt: Date;
  onRestart: () => void;
  /** A: AS-IS(기존 왈라) 재현 — 체크마크 + 한 줄 문구뿐, 정보 카드/버튼 없음. B: 개선안 */
  variant?: "A" | "B";
  /**
   * A/B 테스트 하네스에서만 쓰인다: 제품 UI가 아니라 "다음 단계로" 진행하는
   * 테스트 도구용 콜백. 있으면 닫기/이동 버튼이 이 콜백을 호출한다.
   */
  onFinish?: () => void;
}

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// F-04: 서버 저장 성공을 확인한 뒤에만 보여주며, 첫 문장이 결과를 알린다.
export default function EndingScreen({
  surveyTitle,
  submittedAt,
  onRestart,
  variant = "B",
  onFinish,
}: EndingScreenProps) {
  useEffect(() => {
    track("completion_viewed", {});
  }, []);

  if (variant === "A") {
    return (
      <>
        <section
          className={styles.asIsCard}
          role="status"
          aria-live="polite"
        >
          <div className={styles.asIsIconCircle} aria-hidden="true">
            ✓
          </div>
          <p className={styles.asIsResultLine}>
            응답이 성공적으로 제출되었습니다.
          </p>
        </section>
        {onFinish && (
          <div className={styles.harnessRow}>
            <span className={styles.harnessHint}>
              [테스트 도구] 실제 제품 화면이 아니에요
            </span>
            <button
              type="button"
              className={styles.harnessButton}
              onClick={onFinish}
            >
              다음 단계로 진행
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <section className={styles.card} role="status" aria-live="polite">
      <div className={styles.iconCircle} aria-hidden="true">
        ✓
      </div>
      <p className={styles.resultLine}>응답이 제출되었어요</p>

      <dl className={styles.infoBox}>
        <div className={styles.infoRow}>
          <dt>설문</dt>
          <dd>{surveyTitle}</dd>
        </div>
        <div className={styles.infoRow}>
          <dt>제출 시각</dt>
          <dd>{formatSubmittedAt(submittedAt)}</dd>
        </div>
      </dl>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => (onFinish ? onFinish() : window.close())}
        >
          닫기
        </button>
        <button
          type="button"
          className={styles.homeButton}
          onClick={() => (onFinish ? onFinish() : onRestart())}
        >
          처음 화면으로 이동
        </button>
      </div>

      <p className={styles.subLine}>
        소중한 의견 감사합니다. (데모: 실제 중복 제출 방지는 구현되어 있지
        않습니다)
      </p>
    </section>
  );
}
