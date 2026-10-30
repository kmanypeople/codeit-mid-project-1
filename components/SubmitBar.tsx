"use client";

import { SubmitStatus } from "@/lib/types";
import styles from "./SubmitBar.module.css";

interface SubmitBarProps {
  isFirstPage: boolean;
  isLastPage: boolean;
  submitStatus: SubmitStatus;
  hasErrors: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

// F-04: 제출 중엔 반복 클릭을 막고, 확인된 실패는 답을 보존한 채 재시도를 준다.
// 응답 없는 타임아웃은 실패와 분리해 '확인 중' 문구로 안내한다.
export default function SubmitBar({
  isFirstPage,
  isLastPage,
  submitStatus,
  hasErrors,
  onPrev,
  onNext,
  onSubmit,
}: SubmitBarProps) {
  if (!isLastPage) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.buttonRow}>
          {!isFirstPage && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onPrev}
            >
              이전
            </button>
          )}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onNext}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  const isSubmitting = submitStatus === "submitting";

  return (
    <div className={styles.wrapper}>
      {submitStatus === "failed" && (
        <div className={`${styles.statusBox} ${styles.failed}`} role="alert">
          <span>제출에 실패했어요. 입력하신 답은 그대로 남아있어요.</span>
          <button type="button" className={styles.retryButton} onClick={onSubmit}>
            다시 시도
          </button>
        </div>
      )}
      {submitStatus === "unknown" && (
        <div className={`${styles.statusBox} ${styles.unknown}`} role="status">
          <span>제출 여부를 확인하고 있습니다. 잠시만 기다려주세요…</span>
          <button type="button" className={styles.retryButton} onClick={onSubmit}>
            다시 제출
          </button>
        </div>
      )}

      {submitStatus === "idle" && (
        <p className={styles.notice}>제출한 응답은 수정할 수 없어요.</p>
      )}

      <div className={styles.buttonRow}>
        {!isFirstPage && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onPrev}
            disabled={isSubmitting}
          >
            이전
          </button>
        )}
        <button
          type="button"
          className={`${styles.primaryButton} ${
            hasErrors && !isSubmitting ? styles.muted : ""
          }`}
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting && <span className={styles.spinner} aria-hidden="true" />}
          {isSubmitting ? "제출 중…" : "응답 제출하기"}
        </button>
      </div>
    </div>
  );
}
