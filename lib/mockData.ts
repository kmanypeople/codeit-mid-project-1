import { ChoiceOption, Question, SurveyDefinition } from "./types";

// PRD F-01~F-04 통합 검증용 더미 설문: 2페이지, 단일/복수 선택, 필수 누락·이메일 형식
// 오류, 최대 선택 개수 제한, '기타' 자유 입력을 모두 포함한다.
export const surveyDefinition: SurveyDefinition = {
  title: "왈라 라이브 공연장 이용 경험 설문",
  description:
    "오늘 공연장 이용 경험에 대해 2페이지, 약 2분 정도 소요되는 간단한 설문입니다.",
  pages: [
    {
      id: "page-1",
      title: "기본 정보",
      questions: [
        {
          id: "q1-visit-purpose",
          type: "single",
          label: "오늘 공연장을 방문한 목적은 무엇인가요?",
          required: true,
          options: [
            { id: "purpose-watch", label: "공연 관람" },
            { id: "purpose-practice", label: "연습실 이용" },
            { id: "purpose-recording", label: "녹음 작업" },
            { id: "purpose-etc", label: "기타", hasOtherInput: true },
          ],
        },
        {
          id: "q2-transport",
          type: "multi",
          label: "오늘 이용한 교통수단을 모두 선택해주세요",
          helperText: "최대 3개까지 선택할 수 있어요.",
          required: true,
          maxSelect: 3,
          options: [
            { id: "transport-subway", label: "지하철" },
            { id: "transport-bus", label: "버스" },
            { id: "transport-car", label: "자가용" },
            { id: "transport-taxi", label: "택시" },
            { id: "transport-walk", label: "도보" },
            { id: "transport-etc", label: "기타", hasOtherInput: true },
          ],
        },
        {
          id: "q3-email",
          type: "email",
          label: "결과 안내를 받을 이메일 주소를 입력해주세요",
          required: true,
          placeholder: "name@example.com",
        },
      ],
    },
    {
      id: "page-2",
      title: "세부 의견",
      questions: [
        {
          id: "q4-inconvenience",
          type: "multi",
          label: "이용 중 불편했던 점이 있다면 모두 선택해주세요",
          helperText: "여러 개를 선택할 수 있어요. 없다면 비워두셔도 됩니다.",
          required: false,
          options: [
            { id: "issue-noise", label: "방음이 잘 안 됨" },
            { id: "issue-booking", label: "예약 화면이 헷갈림" },
            { id: "issue-equipment", label: "장비 상태" },
            { id: "issue-price", label: "가격" },
            { id: "issue-etc", label: "기타", hasOtherInput: true },
          ],
        },
        {
          id: "q5-revisit",
          type: "single",
          label: "왈라를 다시 이용하고 싶으신가요?",
          required: true,
          options: [
            { id: "revisit-yes", label: "네, 다시 이용할 것 같아요" },
            { id: "revisit-maybe", label: "아직 잘 모르겠어요" },
            { id: "revisit-no", label: "아니요, 어려울 것 같아요" },
          ],
        },
      ],
    },
  ],
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionOptions(question: Question): Question {
  if (question.type !== "single" && question.type !== "multi") return question;
  // '기타'(자유 입력)는 관례상 항상 마지막에 둔다. 나머지만 섞는다.
  const fixed: ChoiceOption[] = question.options.filter((o) => o.hasOtherInput);
  const movable: ChoiceOption[] = question.options.filter((o) => !o.hasOtherInput);
  return { ...question, options: [...shuffle(movable), ...fixed] };
}

/**
 * A/B 테스트에서 같은 참가자가 두 버전을 순서대로 체험할 때, 선택지 위치를
 * 외워서 두 번째 버전을 기계적으로 더 빠르게 끝내는 학습효과(데이터 오염)를
 * 줄이기 위해 매 노출마다 선택지 순서를 독립적으로 무작위화한 사본을 만든다.
 */
export function shuffleSurveyOptions(def: SurveyDefinition): SurveyDefinition {
  return {
    ...def,
    pages: def.pages.map((page) => ({
      ...page,
      questions: page.questions.map(shuffleQuestionOptions),
    })),
  };
}
