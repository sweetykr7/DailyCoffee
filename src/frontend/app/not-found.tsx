import Link from 'next/link';
import { Coffee } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-cream-warm p-6">
        <Coffee size={48} className="text-accent" />
      </div>
      <h1 className="font-display text-6xl font-bold text-coffee">404</h1>
      <p className="mt-3 text-lg text-coffee-light">
        찾으시는 페이지가 존재하지 않습니다
      </p>
      <p className="mt-1 text-sm text-sub">
        주소가 잘못되었거나, 페이지가 이동되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-coffee px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-coffee-light"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
