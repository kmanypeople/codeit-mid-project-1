"use client";

import { AnswerValue, FieldError, Question } from "@/lib/types";
import EmailDomainInput from "./EmailDomainInput";
import styles from "./QuestionField.module.css";

interface QuestionFieldProps {
  question: Question;
  answer?: AnswerValue;
  otherText: string;
  error?: FieldError;
  maxSelectNotice?: string | null;
  registerRef: (questionId: string, el: HTMLDivElement | null) => void;
  onSingleSelect: (questionId: string, optionId: string) => void;
  onMultiToggle: (questionId: string, optionId: string) => void;
  onTextChange: (questionId: string, value: string) => void;
  onOtherTextChange: (questionId: string, value: string) => void;
  onFieldBlur: (questionId: string) => void;
  /** A: AS-IS(기존 왈라) 재현 — 단일/복수 모두 동일한 체크마크로 표시(모양 구분 없음). B: 개선안 */
  variant?: "A" | "B";
}

// F-02 / 와이어프레임: 복수 선택이 가능한 문항에만 태그를 붙인다.
// 단일 선택은 라디오(원형) 모양 자체로 구분되므로 배지를 쓰지 않는다.
// (B 개선안 전용 — 실제 왈라 AS-IS 화면에는 이 태그가 없다)
function badgeLabel(question: Question): string | null {
  if (question.type !== "multi") return null;
  return question.maxSelect
    ? `최대 ${question.maxSelect}개 선택`
    : "복수 선택 가능";
}

export default function QuestionField({
  question,
  answer,
  otherText,
  error,
  maxSelectNotice,
  registerRef,
  onSingleSelect,
  onMultiToggle,
  onTextChange,
  onOtherTextChange,
  onFieldBlur,
  variant = "B",
}: QuestionFieldProps) {
  const badge = badgeLabel(question);

  if (variant === "A") {
    return (
      <div
        className={styles.asIsCard}
        ref={(el) => registerRef(question.id, el)}
        tabIndex={-1}
      >
        {maxSelectNotice ? (
          <p className={styles.asIsExceededLabel}>
            <span className={styles.asIsErrorIcon} aria-hidden="true">
              !
            </span>
            {maxSelectNotice}
          </p>
        ) : (
          question.required && (
            <p className={styles.asIsRequiredLabel}>* 필수 입력</p>
          )
        )}
        <p className={styles.asIsLabel}>{question.label}</p>

        {question.helperText && (
          <p className={styles.helper}>{question.helperText}</p>
        )}

        {(question.type === "single" || question.type === "multi") && (
          <div className={styles.asIsOptionList}>
            {question.options.map((option) => {
              const selected =
                question.type === "single"
                  ? answer?.type === "single" && answer.optionId === option.id
                  : answer?.type === "multi" &&
                    answer.optionIds.includes(option.id);
              return (
                <div key={option.id}>
                  <button
                    type="button"
                    className={styles.asIsOptionRow}
                    onClick={() =>
                      question.type === "single"
                        ? onSingleSelect(question.id, option.id)
                        : onMultiToggle(question.id, option.id)
                    }
                  >
                    <span className={styles.asIsOptionLabel}>
                      {option.label}
                    </span>
                    {question.type === "single" ? (
                      <span
                        className={`${styles.asIsRadioIndicator} ${
                          selected ? styles.asIsRadioIndicatorOn : ""
                        }`}
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className={`${styles.asIsCheckmark} ${
                          selected ? styles.asIsCheckmarkOn : ""
                        }`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    )}
                  </button>
                  {option.hasOtherInput && selected && (
                    <input
                      className={styles.asIsOtherInput}
                      type="text"
                      placeholder="직접 입력해주세요"
                      value={otherText}
                      onChange={(e) =>
                        onOtherTextChange(question.id, e.target.value)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {question.type === "email" && (
          <EmailDomainInput
            value={answer?.type === "text" ? answer.value : ""}
            onChange={(value) => onTextChange(question.id, value)}
            onBlur={() => onFieldBlur(question.id)}
            hasError={Boolean(error)}
            variant="A"
          />
        )}

        {question.type === "text" && (
          <input
            className={`${styles.asIsTextInput} ${error ? styles.asIsTextInputError : ""}`}
            type="text"
            placeholder={question.placeholder}
            value={answer?.type === "text" ? answer.value : ""}
            onChange={(e) => onTextChange(question.id, e.target.value)}
            onBlur={() => onFieldBlur(question.id)}
          />
        )}

        {error && (
          <p className={styles.asIsErrorText}>
            <span className={styles.asIsErrorIcon} aria-hidden="true">
              !
            </span>
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.card} ${error ? styles.hasError : ""}`}
      ref={(el) => registerRef(question.id, el)}
      tabIndex={-1}
    >
      <div className={styles.headerRow}>
        <p className={styles.label}>
          {question.label}
          {question.required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </p>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>

      {error ? (
        <p className={styles.errorText} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">
            !
          </span>
          {error.message}
        </p>
      ) : (
        question.helperText && (
          <p className={styles.helper}>{question.helperText}</p>
        )
      )}

      {question.type === "single" && (
        <div className={styles.optionList} role="radiogroup">
          {question.options.map((option) => {
            const selected =
              answer?.type === "single" && answer.optionId === option.id;
            return (
              <div key={option.id}>
                <label
                  className={`${styles.optionRow} ${selected ? styles.selected : ""}`}
                >
                  <input
                    className={styles.optionInput}
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => onSingleSelect(question.id, option.id)}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                </label>
                {option.hasOtherInput && selected && (
                  <input
                    className={styles.otherInput}
                    type="text"
                    placeholder="직접 입력해주세요"
                    value={otherText}
                    onChange={(e) =>
                      onOtherTextChange(question.id, e.target.value)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {question.type === "multi" && (
        <div className={styles.optionList} role="group">
          {question.options.map((option) => {
            const selectedIds =
              answer?.type === "multi" ? answer.optionIds : [];
            const selected = selectedIds.includes(option.id);
            const atMax = Boolean(
              question.maxSelect && selectedIds.length >= question.maxSelect,
            );
            const disabled = !selected && atMax;
            return (
              <div key={option.id}>
                <label
                  className={`${styles.optionRow} ${selected ? styles.selected : ""} ${
                    disabled ? styles.disabled : ""
                  }`}
                >
                  <input
                    className={styles.optionInput}
                    type="checkbox"
                    checked={selected}
                    onChange={() => onMultiToggle(question.id, option.id)}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                </label>
                {option.hasOtherInput && selected && (
                  <input
                    className={styles.otherInput}
                    type="text"
                    placeholder="직접 입력해주세요"
                    value={otherText}
                    onChange={(e) =>
                      onOtherTextChange(question.id, e.target.value)
                    }
                  />
                )}
              </div>
            );
          })}
          {maxSelectNotice && (
            <p className={styles.noticeText} role="status">
              {maxSelectNotice}
            </p>
          )}
        </div>
      )}

      {question.type === "email" && (
        <EmailDomainInput
          value={answer?.type === "text" ? answer.value : ""}
          onChange={(value) => onTextChange(question.id, value)}
          onBlur={() => onFieldBlur(question.id)}
          hasError={Boolean(error)}
          variant="B"
        />
      )}

      {question.type === "text" && (
        <input
          className={`${styles.textInput} ${error ? styles.hasError : ""}`}
          type="text"
          placeholder={question.placeholder}
          value={answer?.type === "text" ? answer.value : ""}
          onChange={(e) => onTextChange(question.id, e.target.value)}
          onBlur={() => onFieldBlur(question.id)}
        />
      )}
    </div>
  );
}
