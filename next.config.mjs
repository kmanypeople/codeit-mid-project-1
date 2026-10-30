/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 사이트 첫 화면과 기존 A/B 테스트 라우트(app/ab-test)를 새 정적 화면으로 보낸다.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ab-test.html",
        permanent: false,
      },
      {
        source: "/ab-test",
        destination: "/ab-test.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
