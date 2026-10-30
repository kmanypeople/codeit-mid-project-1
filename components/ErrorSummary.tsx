import { FieldError } from "@/lib/types";
import styles from "./ErrorSummary.module.css";

interface ErrorSummaryProps {
  errors: FieldError[];
  onNext: () => void;
  /** A: AS-IS(기존 왈라) 재현 — 오류가 1개여도 상단 배너 노출, 항상 첫 오류로만 이동. B: 개선안 */
  variant?: "A" | "B";
}

// F-01 / 와이어프레임 '개선안 B·스낵바': 오류가 1개일 땐 문항 인라인 표시만으로
// 충분해 스낵바를 띄우지 않는다. 2개 이상일 때만 개수 + '다음 오류' 이동 버튼을 보여준다.
export default function ErrorSummary({
  errors,
  onNext,
  variant = "B",
}: ErrorSummaryProps) {
  if (variant === "A") {
    if (errors.length === 0) return null;
    return (
      <div className={styles.asIsBanner} role="alert" aria-live="assertive">
        <span className={styles.asIsBannerText}>
          입력하신 내용에 유효하지 않은 값이 있어요.
        </span>
        <button type="button" className={styles.asIsBannerButton} onClick={onNext}>
          이동하기
        </button>
      </div>
    );
  }

  if (errors.length < 2) return null;

  return (
    <div className={styles.box} role="alert" aria-live="assertive">
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <span className={styles.text}>
        답하지 않은 필수 문항 {errors.length}개
      </span>
      <button type="button" className={styles.nextButton} onClick={onNext}>
        다음 오류 ›
      </button>
    </div>
  );
}
