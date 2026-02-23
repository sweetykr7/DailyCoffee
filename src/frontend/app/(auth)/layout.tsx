import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12">
      <Link href="/" className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-wider text-coffee">
          DAILY COFFEE
        </h1>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
