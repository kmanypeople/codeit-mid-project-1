// 왈라 응답 경험 개선 PRD 기반 설문 데이터 모델

export type QuestionType = "single" | "multi" | "text" | "email";

export interface ChoiceOption {
  id: string;
  label: string;
  /** 이 옵션을 고르면 자유 입력칸을 함께 보여준다 ('기타' 등) */
  hasOtherInput?: boolean;
}

interface QuestionBase {
  id: string;
  label: string;
  required: boolean;
  type: QuestionType;
  /** 문항 아래 보조 설명 */
  helperText?: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: "single" | "multi";
  options: ChoiceOption[];
  /** multi 전용: 최대 선택 개수. 없으면 제한 없음 */
  maxSelect?: number;
}

export interface TextLikeQuestion extends QuestionBase {
  type: "text" | "email";
  placeholder?: string;
}

export type Question = ChoiceQuestion | TextLikeQuestion;

export interface SurveyPage {
  id: string;
  title: string;
  questions: Question[];
}

export interface SurveyDefinition {
  title: string;
  description: string;
  pages: SurveyPage[];
}

/** 단일 문항의 답변 값 */
export type AnswerValue =
  | { type: "single"; optionId: string | null }
  | { type: "multi"; optionIds: string[] }
  | { type: "text"; value: string };

export type Answers = Record<string, AnswerValue>;

/** '기타' 등 옵션에 딸린 자유 입력 텍스트. 세션 내 복원 대상 */
export type OtherTexts = Record<string, string>;

export type FieldErrorReason = "required" | "format" | "maxSelect";

export interface FieldError {
  questionId: string;
  reason: FieldErrorReason;
  message: string;
}

export type SubmitStatus =
  | "idle"
  | "submitting"
  | "failed"
  | "unknown"
  | "success";

export type DemoOutcome = "random" | "success" | "failed" | "unknown";
