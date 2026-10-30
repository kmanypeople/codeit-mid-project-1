"use client";

import { useState } from "react";
import SurveyFlow from "@/components/SurveyFlow";
import { track, setSuperProps } from "@/lib/analytics";
import styles from "./AbTestFlow.module.css";

type Variant = "A" | "B";
type Order = "A-first" | "B-first";
type Step =
  | "intro"
  | "survey-1"
  | "rating-1"
  | "transition"
  | "survey-2"
  | "rating-2"
  | "preference"
  | "thanks";

const EASE_SCALE = [1, 2, 3, 4, 5, 6, 7] as const;

const TASKS = [
  "①  이메일 칸을 빈 채로 다음(또는 제출)을 눌러 오류를 확인한 뒤, 이메일을 입력해 오류를 고쳐보세요",
  "②  한 가지만 고를 수 있는 문항에 답해보세요",
  "③  여러 개를 고를 수 있는 문항에 답해보세요",
  "④  제출 후 완료 화면에서 정상적으로 제출됐는지 확인해보세요",
];

function variantForPosition(order: Order, position: 1 | 2): Variant {
  const firstVariant: Variant = order === "A-first" ? "A" : "B";
  const secondVariant: Variant = order === "A-first" ? "B" : "A";
  return position === 1 ? firstVariant : secondVariant;
}

export default function AbTestFlow() {
  const [step, setStep] = useState<Step>("intro");
  const [order, setOrder] = useState<Order>("A-first");
  const [testSessionId, setTestSessionId] = useState("");
  const [v1StartedAt, setV1StartedAt] = useState(0);
  const [v2StartedAt, setV2StartedAt] = useState(0);
  const [v1DurationMs, setV1DurationMs] = useState(0);
  const [v2DurationMs, setV2DurationMs] = useState(0);
  const [choice, setChoice] = useState<"v1" | "v2" | "tie" | null>(null);
  const [reason, setReason] = useState("");
  const [ease1, setEase1] = useState<number | null>(null);
  const [ease2, setEase2] = useState<number | null>(null);
  const [feedback1, setFeedback1] = useState("");
  const [feedback2, setFeedback2] = useState("");

  function beginTest() {
    const sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nextOrder: Order = Math.random() < 0.5 ? "A-first" : "B-first";
    setTestSessionId(sessionId);
    setOrder(nextOrder);
    setSuperProps({ ab_test_session_id: sessionId });
    track("ab_test_started", { order: nextOrder, test_session_id: sessionId });

    const variant1 = variantForPosition(nextOrder, 1);
    setSuperProps({ ab_variant: variant1, ab_order_position: 1 });
    track("ab_version_started", { variant: variant1, position: 1 });
    setV1StartedAt(Date.now());
    setStep("survey-1");
  }

  function finishSurvey1() {
    const variant1 = variantForPosition(order, 1);
    const durationMs = Date.now() - v1StartedAt;
    setV1DurationMs(durationMs);
    track("ab_version_finished", {
      variant: variant1,
      position: 1,
      duration_ms: durationMs,
    });
    setStep("rating-1");
  }

  function submitRating1() {
    if (ease1 === null) return;
    const variant1 = variantForPosition(order, 1);
    track("ab_ease_rating_submitted", {
      variant: variant1,
      position: 1,
      ease_score: ease1,
      feedback: feedback1 || undefined,
    });
    setStep("transition");
  }

  function beginSurvey2() {
    const variant2 = variantForPosition(order, 2);
    setSuperProps({ ab_variant: variant2, ab_order_position: 2 });
    track("ab_version_started", { variant: variant2, position: 2 });
    setV2StartedAt(Date.now());
    setStep("survey-2");
  }

  function finishSurvey2() {
    const variant2 = variantForPosition(order, 2);
    const durationMs = Date.now() - v2StartedAt;
    setV2DurationMs(durationMs);
    track("ab_version_finished", {
      variant: variant2,
      position: 2,
      duration_ms: durationMs,
    });
    setStep("rating-2");
  }

  function submitRating2() {
    if (ease2 === null) return;
    const variant2 = variantForPosition(order, 2);
    track("ab_ease_rating_submitted", {
      variant: variant2,
      position: 2,
      ease_score: ease2,
      feedback: feedback2 || undefined,
    });
    setStep("preference");
  }

  function submitPreference() {
    if (!choice) return;
    const chosenVariant =
      choice === "tie" ? "tie" : variantForPosition(order, choice === "v1" ? 1 : 2);
    track("ab_preference_submitted", {
      order,
      test_session_id: testSessionId,
      chosen_label: choice,
      chosen_variant: chosenVariant,
      reason: reason || undefined,
      v1_duration_ms: v1DurationMs,
      v2_duration_ms: v2DurationMs,
    });
    setStep("thanks");
  }

  function resetForNextParticipant() {
    setChoice(null);
    setReason("");
    setEase1(null);
    setEase2(null);
    setFeedback1("");
    setFeedback2("");
    setStep("intro");
  }

  if (step === "intro") {
    return (
      <section className={styles.card}>
        <span className={styles.eyebrow}>왈라 설문 UX 사용성 테스트</span>
        <h1 className={styles.title}>잠깐, 설문 체험 전에 안내드려요</h1>
        <p className={styles.description}>
          같은 내용의 짧은 설문(2페이지, 5문항)을 서로 다른 화면 두 가지로 각각
          한 번씩 체험해주세요. 어느 쪽이 먼저 나올지는 무작위로 정해져요.
        </p>
        <div className={styles.taskBox}>
          <p className={styles.taskBoxTitle}>
            각 버전에서 아래 네 가지를 모두 해보며 진행해주세요
          </p>
          <ul className={styles.taskList}>
            {TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <button type="button" className={styles.primaryButton} onClick={beginTest}>
          체험 시작하기
        </button>
      </section>
    );
  }

  if (step === "survey-1" || step === "survey-2") {
    const position = step === "survey-1" ? 1 : 2;
    const variant = variantForPosition(order, position);
    return (
      <div className={styles.surveyWrap}>
        <div className={styles.versionTag}>버전 {position}</div>
        <SurveyFlow
          key={step}
          variant={variant}
          taskMode
          onFinish={position === 1 ? finishSurvey1 : finishSurvey2}
        />
      </div>
    );
  }

  if (step === "rating-1" || step === "rating-2") {
    const position = step === "rating-1" ? 1 : 2;
    const ease = position === 1 ? ease1 : ease2;
    const setEase = position === 1 ? setEase1 : setEase2;
    const feedback = position === 1 ? feedback1 : feedback2;
    const setFeedback = position === 1 ? setFeedback1 : setFeedback2;
    const onSubmit = position === 1 ? submitRating1 : submitRating2;

    return (
      <section className={styles.card}>
        <span className={styles.chip}>방금 체험하신 버전은 버전 {position}입니다</span>
        <h1 className={styles.title}>이 버전은 얼마나 쉬웠나요?</h1>
        <div className={styles.scaleRow}>
          {EASE_SCALE.map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.scaleButton} ${
                ease === n ? styles.scaleButtonSelected : ""
              }`}
              onClick={() => setEase(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className={styles.scaleAnchors}>
          <span>1 매우 어려웠다</span>
          <span>7 매우 쉬웠다</span>
        </div>
        <label className={styles.feedbackLabel}>
          이 버전에서 아쉬웠던 점이 있다면 적어주세요 (선택)
          <textarea
            className={styles.feedbackInput}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="짧게 적어주세요"
            rows={3}
          />
        </label>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onSubmit}
          disabled={ease === null}
        >
          다음
        </button>
      </section>
    );
  }

  if (step === "transition") {
    return (
      <section className={styles.card}>
        <span className={styles.eyebrow}>버전 1 완료</span>
        <h1 className={styles.title}>이번엔 버전 2예요</h1>
        <p className={styles.description}>
          같은 설문을 이번엔 다른 화면으로 한 번 더 체험해주세요. 아까와
          똑같이 네 가지를 모두 해보시면 돼요.
        </p>
        <div className={styles.taskBox}>
          <ul className={styles.taskList}>
            {TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={beginSurvey2}
        >
          버전 2 시작하기
        </button>
      </section>
    );
  }

  if (step === "preference") {
    return (
      <section className={styles.card}>
        <span className={styles.eyebrow}>마지막 질문</span>
        <h1 className={styles.title}>어떤 버전이 더 사용하기 쉬웠나요?</h1>
        <div className={styles.choiceList}>
          {(
            [
              { value: "v1" as const, label: "버전 1이 더 편했어요" },
              { value: "v2" as const, label: "버전 2가 더 편했어요" },
              { value: "tie" as const, label: "둘 다 비슷했어요" },
            ]
          ).map((opt) => (
            <label
              key={opt.value}
              className={`${styles.choiceRow} ${
                choice === opt.value ? styles.choiceRowSelected : ""
              }`}
            >
              <input
                type="radio"
                name="preference"
                checked={choice === opt.value}
                onChange={() => setChoice(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <label className={styles.feedbackLabel}>
          왜 그렇게 느끼셨나요? 자유롭게 적어주세요 (선택)
          <textarea
            className={styles.feedbackInput}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="짧게 적어주세요"
            rows={3}
          />
        </label>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={submitPreference}
          disabled={!choice}
        >
          답변 제출하기
        </button>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.iconCircle} aria-hidden="true">
        ✓
      </div>
      <h1 className={styles.title}>참여해주셔서 감사합니다!</h1>
      <p className={styles.description}>
        소중한 답변이 기록됐어요. 다음 참가자가 이어서 체험할 수 있어요.
      </p>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={resetForNextParticipant}
      >
        다음 참가자 시작하기
      </button>
    </section>
  );
}
