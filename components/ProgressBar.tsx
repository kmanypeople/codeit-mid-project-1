import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
  /** A: AS-IS(기존 왈라) 재현 — 얇은 바만, 라벨 없음. B: 개선안 — 고정 헤더 + 진행률 텍스트 */
  variant?: "A" | "B";
}

// F-03: 페이지 이동 성공 시에만 값이 바뀐다. 호출부가 그 시점만 넘겨준다.
export default function ProgressBar({
  currentPage,
  totalPages,
  variant = "B",
}: ProgressBarProps) {
  const percent = Math.round((currentPage / totalPages) * 100);

  if (variant === "A") {
    return (
      <div
        className={styles.asIsTrack}
        role="progressbar"
        aria-valuenow={currentPage}
        aria-valuemin={1}
        aria-valuemax={totalPages}
        aria-label={`설문 진행도: ${currentPage}번째 / 전체 ${totalPages}페이지`}
      >
        <div className={styles.asIsFill} style={{ width: `${percent}%` }} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span className={styles.label}>진행률</span>
        <span className={styles.value}>
          {currentPage} / {totalPages}
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={currentPage}
        aria-valuemin={1}
        aria-valuemax={totalPages}
        aria-label={`설문 진행도: ${currentPage}번째 / 전체 ${totalPages}페이지 (페이지 단위로 갱신돼요)`}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
