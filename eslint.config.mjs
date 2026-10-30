import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // exFAT 외장 드라이브에서 macOS가 만드는 AppleDouble 리소스 포크 파일(._*)은 제외한다.
  { ignores: ["**/._*", ".next/**"] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
