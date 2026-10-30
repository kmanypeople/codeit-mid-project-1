import { FieldError } from "@/lib/types";
import styles from "./ErrorSummary.module.css";

interface ErrorSummaryProps {
  errors: FieldError[];
  onJumpTo: (questionId: string) => void;
}

// F-01: 오류가 여러 개면 상단에 개수와 문항명 목록을 두고, 누르면 해당 문항으로 이동한다.
export default function ErrorSummary({ errors, onJumpTo }: ErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className={styles.box} role="alert" aria-live="assertive">
      <p className={styles.heading}>
        확인이 필요한 문항이 {errors.length}개 있어요
      </p>
      <ul className={styles.list}>
        {errors.map((error) => (
          <li key={error.questionId}>
            <button
              type="button"
              className={styles.itemButton}
              onClick={() => onJumpTo(error.questionId)}
            >
              {error.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
