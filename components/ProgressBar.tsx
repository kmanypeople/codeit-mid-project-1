import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
}

// F-03: 페이지 이동 성공 시에만 값이 바뀐다. 호출부가 그 시점만 넘겨준다.
export default function ProgressBar({
  currentPage,
  totalPages,
}: ProgressBarProps) {
  const percent = Math.round((currentPage / totalPages) * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span className={styles.label}>
          {currentPage} / {totalPages}페이지
        </span>
        <span className={styles.unit}>페이지 단위로 갱신돼요</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={currentPage}
        aria-valuemin={1}
        aria-valuemax={totalPages}
        aria-label={`설문 진행도: ${currentPage}번째 / 전체 ${totalPages}페이지`}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
