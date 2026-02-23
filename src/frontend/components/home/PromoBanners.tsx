import Link from 'next/link';

const BANNERS = [
  {
    id: 1,
    title: '첫 주문 10% 할인',
    description: '회원가입 후 첫 주문 시 자동 적용',
    href: '/register',
    bg: 'bg-gradient-to-r from-accent to-accent-light',
  },
  {
    id: 2,
    title: '무료배송',
    description: '3만원 이상 구매 시 무료배송',
    href: '/products',
    bg: 'bg-gradient-to-r from-coffee to-coffee-light',
  },
];

export function PromoBanners() {
  return (
    <section className="py-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={`${banner.bg} group flex items-center justify-between rounded-xl p-6 text-white transition-opacity hover:opacity-95`}
            >
              <div>
                <h3 className="text-lg font-bold">{banner.title}</h3>
                <p className="mt-1 text-sm text-white/80">{banner.description}</p>
              </div>
              <span className="text-2xl opacity-60 transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
