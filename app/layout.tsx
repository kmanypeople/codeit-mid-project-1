import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "왈라 응답 경험 개선 데모",
  description:
    "오류 안내 · 진행도 · 단일/복수 선택 구분 · 제출 상태 엔딩을 통합한 더미 검증용 설문 데모",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
