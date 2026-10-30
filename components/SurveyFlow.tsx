"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { surveyDefinition, shuffleSurveyOptions } from "@/lib/mockData";
import { validatePage, validateQuestion } from "@/lib/validation";
import { mockSubmit } from "@/lib/mockSubmit";
import { startSurveyResponse, track } from "@/lib/analytics";
import {
  Answers,
  DemoOutcome,
  FieldError,
  FieldErrorReason,
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

interface SurveyFlowProps {
  /** A: AS-IS(기존 왈라) 재현. B(기본값): 개선안 */
  variant?: "A" | "B";
  /** A/B 테스트 과업 모드: 항상 성공으로 빠르게 제출되고, 데모 전용 스위치를 숨긴다 */
  taskMode?: boolean;
  /** 과업 모드에서 완료 화면의 버튼을 눌렀을 때 호출된다(다음 단계로 진행) */
  onFinish?: () => void;
}

export default function SurveyFlow({
  variant = "B",
  taskMode = false,
  onFinish,
}: SurveyFlowProps) {
  // A/B 테스트(taskMode)에서는 노출마다 선택지 순서를 독립적으로 섞어
  // 두 번째 버전을 외운 대로 기계적으로 끝내는 학습효과를 줄인다.
  const activeSurvey = useMemo(
    () => (taskMode ? shuffleSurveyOptions(surveyDefinition) : surveyDefinition),
    [taskMode],
  );
  const pages = activeSurvey.pages;
  const totalPages = pages.length;

  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherTexts, setOtherTexts] = useState<OtherTexts>({});
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [maxSelectNotices, setMaxSelectNotices] = useState<
    Record<string, string | null>
  >({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [demoOutcome, setDemoOutcome] = useState<DemoOutcome>(
    taskMode ? "success" : "random",
  );
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [errorCursor, setErrorCursor] = useState(0);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const submitSettledRef = useRef(true);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorShownAtRef = useRef<
    Record<string, { at: number; reason: FieldErrorReason }>
  >({});
  const multiStatsRef = useRef<
    Record<string, { toggles: number; deselects: number }>
  >({});

  const currentPage = pages[pageIndex];
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === totalPages - 1;

  useEffect(() => {
    startSurveyResponse();
  }, []);

  useEffect(() => {
    // pageIndex가 바뀔 때만 기록한다. 제출 상태 전환(엔딩 화면은 completion_viewed로 별도 기록)은 제외.
    track("page_viewed", {
      page: currentPage.id,
      page_number: pageIndex + 1,
      total_pages: totalPages,
      is_last_page: pageIndex === totalPages - 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  function registerFieldRef(questionId: string, el: HTMLDivElement | null) {
    fieldRefs.current[questionId] = el;
  }

  function jumpToQuestion(questionId: string) {
    const el = fieldRefs.current[questionId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
  }

  function handleJumpToError(questionId: string) {
    track("button_clicked", { button: "jump_to_error", question_id: questionId });
    jumpToQuestion(questionId);
  }

  // 와이어프레임 '다음 오류' 스낵바 버튼: 오류 문항을 순서대로 순환 이동한다.
  function handleNextError() {
    if (errors.length === 0) return;
    const nextIndex = (errorCursor + 1) % errors.length;
    setErrorCursor(nextIndex);
    handleJumpToError(errors[nextIndex].questionId);
  }

  // AS-IS 재현: 순환 없이 항상 '첫 번째' 남은 오류로만 이동한다.
  function handleJumpToFirstError() {
    if (errors.length === 0) return;
    handleJumpToError(errors[0].questionId);
  }

  function markErrorsShown(shown: FieldError[]) {
    const now = Date.now();
    for (const e of shown) {
      // 이미 떠 있던 오류는 최초 노출 시각을 유지한다.
      errorShownAtRef.current[e.questionId] ??= { at: now, reason: e.reason };
    }
  }

  function resolveError(questionId: string) {
    const shown = errorShownAtRef.current[questionId];
    if (!shown) return;
    delete errorShownAtRef.current[questionId];
    track("validation_resolved", {
      question_id: questionId,
      reason: shown.reason,
      time_to_fix_sec: (Date.now() - shown.at) / 1000,
    });
  }

  function clearErrorFor(questionId: string) {
    setErrors((prev) => prev.filter((e) => e.questionId !== questionId));
    resolveError(questionId);
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

    // B(개선안): 초과 선택 자체를 막고(F-02 / Edge case), 기존 선택은 유지한 채 이유만 안내한다.
    if (
      variant === "B" &&
      !alreadySelected &&
      question.maxSelect &&
      selectedIds.length >= question.maxSelect
    ) {
      setMaxSelectNotices((prev) => ({
        ...prev,
        [questionId]: `최대 ${question.maxSelect}개까지 선택할 수 있어요. 다른 항목을 먼저 해제해주세요.`,
      }));
      return;
    }

    const nextIds = alreadySelected
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    const stats = (multiStatsRef.current[questionId] ??= { toggles: 0, deselects: 0 });
    stats.toggles += 1;
    if (alreadySelected) stats.deselects += 1;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: "multi", optionIds: nextIds },
    }));

    // A(AS-IS 재현): 선택 자체는 막지 않고, 개수를 넘기면 그때 초과 안내만 띄운다.
    const exceeded =
      variant === "A" && question.maxSelect
        ? nextIds.length > question.maxSelect
        : false;
    setMaxSelectNotices((prev) => ({
      ...prev,
      [questionId]: exceeded ? "최대 선택 항목을 초과했습니다." : null,
    }));
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
      // 메시지만 숨길 뿐 고친 게 아니므로 수정 시간 측정은 계속 이어간다.
      setErrors((prev) => prev.filter((e) => e.questionId !== questionId));
      return;
    }
    const error = validateQuestion(question, answer);
    setErrors((prev) => {
      const withoutThis = prev.filter((e) => e.questionId !== questionId);
      return error ? [...withoutThis, error] : withoutThis;
    });
    if (error) {
      markErrorsShown([error]);
      track("validation_failed", {
        page: currentPage.id,
        question_id: questionId,
        reason: error.reason,
      });
    } else {
      resolveError(questionId);
    }
  }

  function runPageValidation(): FieldError[] {
    const pageErrors = validatePage(currentPage, answers);
    setErrors(pageErrors);
    setErrorCursor(0);
    markErrorsShown(pageErrors);
    if (pageErrors.length > 0) {
      track("validation_failed", {
        page: currentPage.id,
        error_count: pageErrors.length,
        reasons: pageErrors.map((e) => e.reason),
      });
    }
    return pageErrors;
  }

  function focusFirstError(pageErrors: FieldError[]) {
    if (pageErrors.length > 0) {
      // 다음 렌더 이후 포커스가 걸리도록 한 틱 늦춘다.
      requestAnimationFrame(() => jumpToQuestion(pageErrors[0].questionId));
    }
  }

  function goNext() {
    track("button_clicked", { button: "next", page: currentPage.id });
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
    track("button_clicked", { button: "prev", page: currentPage.id });
    // 고치지 않고 떠난 오류는 수정 시간 측정에서 뺀다.
    errorShownAtRef.current = {};
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

    const isRetry = submitStatus === "failed" || submitStatus === "unknown";
    track("button_clicked", {
      button: isRetry ? "retry" : "submit",
      page: currentPage.id,
    });

    const pageErrors = runPageValidation();
    if (pageErrors.length > 0) {
      focusFirstError(pageErrors);
      return;
    }

    track("submit_attempted", { retry: isRetry, demo_outcome: demoOutcome });

    setSubmitStatus("submitting");
    submitSettledRef.current = false;
    clearSubmitTimeout();

    submitTimeoutRef.current = setTimeout(() => {
      if (!submitSettledRef.current) {
        submitSettledRef.current = true;
        setSubmitStatus("unknown");
        track("submit_status_unknown", {});
      }
    }, SUBMIT_TIMEOUT_MS);

    mockSubmit({ answers, otherTexts }, demoOutcome)
      .then(() => {
        if (submitSettledRef.current) return; // 이미 타임아웃으로 '확인 중' 처리된 뒤 늦게 도착한 응답
        submitSettledRef.current = true;
        clearSubmitTimeout();
        setSubmitStatus("success");
        setSubmittedAt(new Date());
        trackMultiSelectSummary();
        track("submit_succeeded", {});
      })
      .catch(() => {
        if (submitSettledRef.current) return;
        submitSettledRef.current = true;
        clearSubmitTimeout();
        setSubmitStatus("failed");
        track("submit_failed", {});
      });
  }

  // 최종 제출된 답 기준으로 다중선택 문항마다 1건씩 남긴다.
  function trackMultiSelectSummary() {
    for (const page of pages) {
      for (const q of page.questions) {
        if (q.type !== "multi") continue;
        const answer = answers[q.id];
        const selectedCount = answer?.type === "multi" ? answer.optionIds.length : 0;
        if (selectedCount === 0) continue;
        const stats = multiStatsRef.current[q.id] ?? { toggles: 0, deselects: 0 };
        track("multi_select_answered", {
          question_id: q.id,
          selected_count: selectedCount,
          deselect_count: stats.deselects,
          toggle_count: stats.toggles,
          max_select: q.maxSelect ?? null,
        });
      }
    }
  }

  function restart() {
    track("button_clicked", { button: "restart" });
    startSurveyResponse();
    errorShownAtRef.current = {};
    multiStatsRef.current = {};
    clearSubmitTimeout();
    submitSettledRef.current = true;
    setPageIndex(0);
    setAnswers({});
    setOtherTexts({});
    setErrors([]);
    setErrorCursor(0);
    setMaxSelectNotices({});
    setSubmitStatus("idle");
    setSubmittedAt(null);
  }

  if (submitStatus === "success" && submittedAt) {
    return (
      <EndingScreen
        surveyTitle={surveyDefinition.title}
        submittedAt={submittedAt}
        onRestart={restart}
        variant={variant}
        onFinish={onFinish}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <ProgressBar
        currentPage={pageIndex + 1}
        totalPages={totalPages}
        variant={variant}
      />

      <div className={styles.header}>
        <span className={styles.surveyTitle}>{surveyDefinition.title}</span>
        <h1 className={styles.pageTitle}>{currentPage.title}</h1>
      </div>

      {variant === "A" && (
        <ErrorSummary
          errors={errors}
          onNext={handleJumpToFirstError}
          variant="A"
        />
      )}

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
            variant={variant}
          />
        ))}
      </div>

      {variant === "B" && (
        <ErrorSummary errors={errors} onNext={handleNextError} variant="B" />
      )}

      <SubmitBar
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        submitStatus={submitStatus}
        hasErrors={errors.length > 0}
        onPrev={goPrev}
        onNext={goNext}
        onSubmit={submit}
        variant={variant}
      />

      {!taskMode && (
        <DemoControls value={demoOutcome} onChange={setDemoOutcome} />
      )}
    </div>
  );
}
