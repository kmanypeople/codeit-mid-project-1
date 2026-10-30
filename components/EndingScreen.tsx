"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import styles from "./EndingScreen.module.css";

interface EndingScreenProps {
  onRestart: () => void;
}

// F-04: 서버 저장 성공을 확인한 뒤에만 보여주며, 첫 문장이 결과를 알린다.
export default function EndingScreen({ onRestart }: EndingScreenProps) {
  useEffect(() => {
    track("completion_viewed", {});
  }, []);

  return (
    <section className={styles.card} role="status" aria-live="polite">
      <div className={styles.iconCircle} aria-hidden="true">
        ✓
      </div>
      <p className={styles.resultLine}>
        응답이 제출되었습니다. 이제 창을 닫아도 됩니다.
      </p>
      <p className={styles.subLine}>
        소중한 의견 감사합니다. (데모: 실제 중복 제출 방지는 구현되어 있지
        않습니다)
      </p>
      <button type="button" className={styles.restartButton} onClick={onRestart}>
        처음부터 다시 체험하기
      </button>
    </section>
  );
}
