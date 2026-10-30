"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

interface PageViewTrackerProps {
  page: string;
}

// 서버 컴포넌트 페이지(예: 인트로 화면)에서 마운트 시 1회 page_viewed를 기록한다.
export default function PageViewTracker({ page }: PageViewTrackerProps) {
  useEffect(() => {
    track("page_viewed", { page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
