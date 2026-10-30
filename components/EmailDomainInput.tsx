"use client";

import { useState } from "react";
import styles from "./EmailDomainInput.module.css";

const DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "kakao.com",
  "nate.com",
  "hanmail.net",
  "outlook.com",
  "icloud.com",
];

const CUSTOM = "__custom__";

interface EmailDomainInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  hasError?: boolean;
  /** A: AS-IS 재현 톤(얇은 테두리). B: 개선안 톤. */
  variant?: "A" | "B";
}

function splitEmail(value: string): { id: string; domain: string } {
  const at = value.indexOf("@");
  if (at === -1) return { id: value, domain: "" };
  return { id: value.slice(0, at), domain: value.slice(at + 1) };
}

// 한국에서 자주 쓰는 이메일 도메인을 드롭다운으로 고르게 해, 아이디만 입력하면
// 되도록 한다. 목록에 없는 도메인은 '직접 입력'으로 자유롭게 쓸 수 있다.
export default function EmailDomainInput({
  value,
  onChange,
  onBlur,
  hasError,
  variant = "B",
}: EmailDomainInputProps) {
  const initial = splitEmail(value);
  const initialIsKnownDomain = DOMAINS.includes(initial.domain);

  const [id, setId] = useState(initial.id);
  const [domainChoice, setDomainChoice] = useState(
    initial.domain === ""
      ? DOMAINS[0]
      : initialIsKnownDomain
        ? initial.domain
        : CUSTOM,
  );
  const [customDomain, setCustomDomain] = useState(
    initialIsKnownDomain ? "" : initial.domain,
  );

  function emit(nextId: string, nextDomainChoice: string, nextCustomDomain: string) {
    const domain = nextDomainChoice === CUSTOM ? nextCustomDomain : nextDomainChoice;
    onChange(nextId.trim().length === 0 ? "" : `${nextId}@${domain}`);
  }

  const rowCls = variant === "A" ? styles.asIsRow : styles.row;
  const idCls = `${variant === "A" ? styles.asIsIdInput : styles.idInput} ${
    hasError ? styles.hasError : ""
  }`;
  const selectCls = variant === "A" ? styles.asIsSelect : styles.select;
  const customCls = `${variant === "A" ? styles.asIsCustomInput : styles.customInput} ${
    hasError ? styles.hasError : ""
  }`;

  return (
    <div className={styles.wrapper}>
      <div className={rowCls}>
        <input
          className={idCls}
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            emit(e.target.value, domainChoice, customDomain);
          }}
          onBlur={onBlur}
        />
        <span className={styles.at} aria-hidden="true">
          @
        </span>
        <select
          className={selectCls}
          value={domainChoice}
          onChange={(e) => {
            setDomainChoice(e.target.value);
            emit(id, e.target.value, customDomain);
          }}
          onBlur={onBlur}
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
          <option value={CUSTOM}>직접 입력</option>
        </select>
      </div>
      {domainChoice === CUSTOM && (
        <input
          className={customCls}
          type="text"
          placeholder="도메인을 입력해주세요 (예: company.com)"
          value={customDomain}
          onChange={(e) => {
            setCustomDomain(e.target.value);
            emit(id, domainChoice, e.target.value);
          }}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}
