"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import styles from "./EndingScreen.module.css";

interface EndingScreenProps {
  surveyTitle: string;
  submittedAt: Date;
  onRestart: () => void;
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
}: EndingScreenProps) {
  useEffect(() => {
    track("completion_viewed", {});
  }, []);

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
          onClick={() => window.close()}
        >
          닫기
        </button>
        <button type="button" className={styles.homeButton} onClick={onRestart}>
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
