import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DAILY COFFEE | 데일리커피',
  description: '매일 신선한 커피를 만나보세요. 프리미엄 원두커피, 스틱커피, 드립백, 홈카페용품 전문 온라인몰',
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
