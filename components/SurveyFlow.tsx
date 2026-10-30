"use client";

import { useRef, useState } from "react";
import { surveyDefinition } from "@/lib/mockData";
import { validatePage, validateQuestion } from "@/lib/validation";
import { mockSubmit } from "@/lib/mockSubmit";
import {
  Answers,
  DemoOutcome,
  FieldError,
  OtherTexts,
  SubmitStatus,
} from "@/lib/types";
import ProgressBar from "./ProgressBar";
import ErrorSummary from "./ErrorSummary";
import QuestionField from "./QuestionField";
import SubmitBar from "./SubmitBar";
import EndingScreen from "./EndingScreen";
import DemoControls from "./DemoControls";
import styles from "./SurveyFlow.module.css";

const SUBMIT_TIMEOUT_MS = 4000;

export default function SurveyFlow() {
  const pages = surveyDefinition.pages;
  const totalPages = pages.length;

  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherTexts, setOtherTexts] = useState<OtherTexts>({});
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [maxSelectNotices, setMaxSelectNotices] = useState<
    Record<string, string | null>
  >({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [demoOutcome, setDemoOutcome] = useState<DemoOutcome>("random");

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const submitSettledRef = useRef(true);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPage = pages[pageIndex];
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === totalPages - 1;

  function registerFieldRef(questionId: string, el: HTMLDivElement | null) {
    fieldRefs.current[questionId] = el;
  }

  function jumpToQuestion(questionId: string) {
    const el = fieldRefs.current[questionId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
  }

  function clearErrorFor(questionId: string) {
    setErrors((prev) => prev.filter((e) => e.questionId !== questionId));
  }

  function handleSingleSelect(questionId: string, optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: "single", optionId },
    }));
    clearErrorFor(questionId);
  }

  function handleMultiToggle(questionId: string, optionId: string) {
    const question = currentPage.questions.find((q) => q.id === questionId);
    if (!question || question.type !== "multi") return;

    const current = answers[questionId];
    const selectedIds =
      current?.type === "multi" ? current.optionIds : [];
    const alreadySelected = selectedIds.includes(optionId);

    if (!alreadySelected && question.maxSelect && selectedIds.length >= question.maxSelect) {
      // F-02 / Edge case: 최대 개수 초과 시 기존 선택은 유지하고 이유만 안내한다.
      setMaxSelectNotices((prev) => ({
        ...prev,
        [questionId]: `최대 ${question.maxSelect}개까지 선택할 수 있어요. 다른 항목을 먼저 해제해주세요.`,
      }));
      return;
    }

    const nextIds = alreadySelected
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: "multi", optionIds: nextIds },
    }));
    setMaxSelectNotices((prev) => ({ ...prev, [questionId]: null }));
    clearErrorFor(questionId);
  }

  function handleTextChange(questionId: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: "text", value },
    }));
    clearErrorFor(questionId);
  }

  function handleOtherTextChange(questionId: string, value: string) {
    // '기타' 자유 입력은 다른 답을 눌렀다 돌아와도 세션 안에서 복원되도록 별도 보관한다.
    setOtherTexts((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleFieldBlur(questionId: string) {
    const question = currentPage.questions.find((q) => q.id === questionId);
    if (!question || question.type !== "email") return;
    const answer = answers[questionId];
    if (!answer || answer.type !== "text" || answer.value.trim().length === 0) {
      // 비어 있으면 필수 여부는 다음/제출 시에만 평가한다.
      clearErrorFor(questionId);
      return;
    }
    const error = validateQuestion(question, answer);
    setErrors((prev) => {
      const withoutThis = prev.filter((e) => e.questionId !== questionId);
      return error ? [...withoutThis, error] : withoutThis;
    });
  }

  function runPageValidation(): FieldError[] {
    const pageErrors = validatePage(currentPage, answers);
    setErrors(pageErrors);
    return pageErrors;
  }

  function focusFirstError(pageErrors: FieldError[]) {
    if (pageErrors.length > 0) {
      // 다음 렌더 이후 포커스가 걸리도록 한 틱 늦춘다.
      requestAnimationFrame(() => jumpToQuestion(pageErrors[0].questionId));
    }
  }

  function goNext() {
    const pageErrors = runPageValidation();
    if (pageErrors.length > 0) {
      focusFirstError(pageErrors);
      return;
    }
    setErrors([]);
    setMaxSelectNotices({});
    setPageIndex((i) => Math.min(i + 1, totalPages - 1));
  }

  function goPrev() {
    setErrors([]);
    setMaxSelectNotices({});
    setPageIndex((i) => Math.max(i - 1, 0));
  }

  function clearSubmitTimeout() {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }

  function submit() {
    if (submitStatus === "submitting") return; // 제출 연타 방지

    const pageErrors = runPageValidation();
    if (pageErrors.length > 0) {
      focusFirstError(pageErrors);
      return;
    }

    setSubmitStatus("submitting");
    submitSettledRef.current = false;
    clearSubmitTimeout();

    submitTimeoutRef.current = setTimeout(() => {
      if (!submitSettledRef.current) {
        setSubmitStatus("unknown");
      }
    }, SUBMIT_TIMEOUT_MS);

    mockSubmit({ answers, otherTexts }, demoOutcome)
      .then(() => {
        if (submitSettledRef.current) return; // 이미 타임아웃으로 '확인 중' 처리된 뒤 늦게 도착한 응답
        submitSettledRef.current = true;
        clearSubmitTimeout();
        setSubmitStatus("success");
      })
      .catch(() => {
        if (submitSettledRef.current) return;
        submitSettledRef.current = true;
        clearSubmitTimeout();
        setSubmitStatus("failed");
      });
  }

  function restart() {
    clearSubmitTimeout();
    submitSettledRef.current = true;
    setPageIndex(0);
    setAnswers({});
    setOtherTexts({});
    setErrors([]);
    setMaxSelectNotices({});
    setSubmitStatus("idle");
  }

  if (submitStatus === "success") {
    return <EndingScreen onRestart={restart} />;
  }

  return (
    <div className={styles.wrapper}>
      <ProgressBar currentPage={pageIndex + 1} totalPages={totalPages} />

      <div className={styles.header}>
        <span className={styles.surveyTitle}>{surveyDefinition.title}</span>
        <h1 className={styles.pageTitle}>{currentPage.title}</h1>
      </div>

      <ErrorSummary errors={errors} onJumpTo={jumpToQuestion} />

      <div className={styles.questionList}>
        {currentPage.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            answer={answers[question.id]}
            otherText={otherTexts[question.id] ?? ""}
            error={errors.find((e) => e.questionId === question.id)}
            maxSelectNotice={maxSelectNotices[question.id] ?? null}
            registerRef={registerFieldRef}
            onSingleSelect={handleSingleSelect}
            onMultiToggle={handleMultiToggle}
            onTextChange={handleTextChange}
            onOtherTextChange={handleOtherTextChange}
            onFieldBlur={handleFieldBlur}
          />
        ))}
      </div>

      <SubmitBar
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        submitStatus={submitStatus}
        onPrev={goPrev}
        onNext={goNext}
        onSubmit={submit}
      />

      <DemoControls value={demoOutcome} onChange={setDemoOutcome} />
    </div>
  );
}
