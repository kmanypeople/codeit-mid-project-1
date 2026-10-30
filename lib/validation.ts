import { AnswerValue, FieldError, Question, SurveyPage } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(answer: AnswerValue | undefined): boolean {
  if (!answer) return true;
  if (answer.type === "single") return answer.optionId === null;
  if (answer.type === "multi") return answer.optionIds.length === 0;
  return answer.value.trim().length === 0;
}

/**
 * 문항 하나를 검사한다. 필수 누락 → "required", 형식 오류 → "format".
 * F-01: 빈 문항은 그 자체로 오류가 아니다 — 호출 시점(다음/제출 클릭)에서만 평가한다.
 */
export function validateQuestion(
  question: Question,
  answer: AnswerValue | undefined,
): FieldError | null {
  const empty = isEmpty(answer);

  if (question.required && empty) {
    const message =
      question.type === "single"
        ? "필수 문항이에요. 하나를 선택해 주세요."
        : question.type === "multi"
          ? "필수 문항이에요. 하나 이상 선택해 주세요."
          : "필수 문항이에요. 입력해 주세요.";
    return {
      questionId: question.id,
      reason: "required",
      message,
    };
  }

  if (question.type === "email" && !empty && answer?.type === "text") {
    if (!EMAIL_PATTERN.test(answer.value.trim())) {
      return {
        questionId: question.id,
        reason: "format",
        message: "올바른 이메일 형식이 아니에요.",
      };
    }
  }

  return null;
}

export function validatePage(
  page: SurveyPage,
  answers: Record<string, AnswerValue>,
): FieldError[] {
  const errors: FieldError[] = [];
  for (const question of page.questions) {
    const error = validateQuestion(question, answers[question.id]);
    if (error) errors.push(error);
  }
  return errors;
}
