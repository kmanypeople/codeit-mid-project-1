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
    return {
      questionId: question.id,
      reason: "required",
      message: `'${question.label}'에 응답해주세요.`,
    };
  }

  if (question.type === "email" && !empty && answer?.type === "text") {
    if (!EMAIL_PATTERN.test(answer.value.trim())) {
      return {
        questionId: question.id,
        reason: "format",
        message: "이메일 주소를 확인해주세요. 예: name@example.com",
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
