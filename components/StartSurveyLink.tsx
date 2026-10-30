"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import styles from "@/app/page.module.css";

export default function StartSurveyLink() {
  return (
    <Link
      href="/survey"
      className={styles.startButton}
      onClick={() => track("response_started")}
    >
      설문 시작하기
    </Link>
  );
}
