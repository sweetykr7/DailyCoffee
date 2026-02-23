export function BrandSection() {
  return (
    <section className="py-16">
      <div className="container-custom text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
          About Us
        </p>
        <h2 className="mb-6 font-display text-3xl font-bold text-coffee">
          DAILY COFFEE
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-coffee-light">
          데일리커피는 매일 신선한 커피를 로스팅하여 고객에게 전달합니다.
          산지에서 직접 선별한 원두를 전문 로스터가 최적의 방법으로 볶아,
          커피 본연의 풍미를 온전히 느낄 수 있도록 합니다.
          집에서도 카페 못지않은 한 잔을 즐겨보세요.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '100+', label: '커피 상품' },
            { value: '50,000+', label: '누적 고객' },
            { value: '4.8', label: '평균 평점' },
            { value: '99%', label: '만족도' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-bold text-accent">{stat.value}</p>
              <p className="mt-1 text-sm text-sub">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
