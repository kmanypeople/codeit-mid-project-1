"use client";

import { DemoOutcome } from "@/lib/types";
import styles from "./DemoControls.module.css";

interface DemoControlsProps {
  value: DemoOutcome;
  onChange: (outcome: DemoOutcome) => void;
}

const OPTIONS: { value: DemoOutcome; label: string }[] = [
  { value: "random", label: "랜덤" },
  { value: "success", label: "성공" },
  { value: "failed", label: "실패" },
  { value: "unknown", label: "결과 미확인(타임아웃)" },
];

// 실제 제품 UI가 아니라 UT/데모 시연을 위한 제출 결과 시뮬레이션 스위치.
export default function DemoControls({ value, onChange }: DemoControlsProps) {
  return (
    <div className={styles.box}>
      <span className={styles.title}>데모 전용 · 제출 결과 시뮬레이션</span>
      <div className={styles.optionRow}>
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.optionButton} ${
              value === option.value ? styles.active : ""
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className={styles.hint}>
        제출하기를 눌렀을 때 서버 응답을 어떤 상태로 가정할지 미리 고를 수
        있어요. 실제 중복 제출 방지가 구현된 것은 아닙니다.
      </span>
    </div>
  );
}
