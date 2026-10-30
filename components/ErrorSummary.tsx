import { FieldError } from "@/lib/types";
import styles from "./ErrorSummary.module.css";

interface ErrorSummaryProps {
  errors: FieldError[];
  onNext: () => void;
}

// F-01 / 와이어프레임 '개선안 B·스낵바': 오류가 1개일 땐 문항 인라인 표시만으로
// 충분해 스낵바를 띄우지 않는다. 2개 이상일 때만 개수 + '다음 오류' 이동 버튼을 보여준다.
export default function ErrorSummary({ errors, onNext }: ErrorSummaryProps) {
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
