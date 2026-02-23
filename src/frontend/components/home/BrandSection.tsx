import React from 'react';

export function BrandSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container-custom text-center">
        <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-accent">
          About Daily Coffee
        </p>
        <h2 className="mt-4 font-serif text-2xl font-semibold italic text-coffee md:text-3xl lg:text-4xl">
          매일의 커피가 특별해지는 순간
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-sub md:text-base">
          데일리커피는 전 세계 최고의 산지에서 엄선한 원두를 매일 신선하게 로스팅합니다.
          당신의 일상에 한 잔의 여유와 깊은 풍미를 전합니다.
          스페셜티 원두부터 간편한 스틱커피까지, 모든 커피 라이프를 책임집니다.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-6 md:gap-8">
          {[
            { value: '200+', label: '프리미엄 원두' },
            { value: '50K+', label: '누적 고객' },
            { value: '4.8', label: '평균 평점' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-bold text-accent md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs text-sub md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
