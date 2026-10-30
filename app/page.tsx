import Link from "next/link";
import styles from "./page.module.css";
import { surveyDefinition } from "@/lib/mockData";

export default function HomePage() {
  const pageCount = surveyDefinition.pages.length;
  const questionCount = surveyDefinition.pages.reduce(
    (sum, page) => sum + page.questions.length,
    0,
  );

  return (
    <main className="page-shell">
      <div className="page-shell__inner">
        <section className={styles.card}>
          <span className={styles.eyebrow}>왈라 설문 데모</span>
          <h1 className={styles.title}>{surveyDefinition.title}</h1>
          <p className={styles.description}>{surveyDefinition.description}</p>

          <div className={styles.meta}>
            <span className={styles.metaChip}>{pageCount}페이지</span>
            <span className={styles.metaChip}>문항 {questionCount}개</span>
            <span className={styles.metaChip}>약 2분 소요</span>
          </div>

          <Link href="/survey" className={styles.startButton}>
            설문 시작하기
          </Link>

          <p className={styles.footnote}>
            이 설문은 오류 안내 · 진행도 · 선택 규칙 표시 · 제출 상태 안내를
            점검하기 위한 더미 데이터 검증용 데모입니다.
          </p>
        </section>
      </div>
    </main>
  );
}
