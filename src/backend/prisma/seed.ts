import { PrismaClient, OptionType, CouponType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const main = async () => {
  console.log('Seeding database...');

  // ────────────────────────────────────────────
  // 1. Clear all data (FK-safe order)
  // ────────────────────────────────────────────
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  console.log('All data cleared.');

  // ────────────────────────────────────────────
  // 2. Create users
  // ────────────────────────────────────────────
  console.log('Creating users...');
  const saltRounds = 10;

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dailycoffee.co.kr',
      password: await bcrypt.hash('admin1234', saltRounds),
      name: '관리자',
      phone: '010-0000-0000',
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'kim.minjun@example.com',
      password: await bcrypt.hash('user1234', saltRounds),
      name: '김민준',
      phone: '010-1234-5678',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'lee.soyeon@example.com',
      password: await bcrypt.hash('user1234', saltRounds),
      name: '이소연',
      phone: '010-9876-5432',
      role: Role.USER,
    },
  });

  console.log(`Created users: ${adminUser.name}, ${user1.name}, ${user2.name}`);

  // ────────────────────────────────────────────
  // 3. Create categories
  // ────────────────────────────────────────────
  console.log('Creating categories...');

  const categoryData = [
    { name: '원두커피', slug: 'coffee-beans', description: '세계 각지의 프리미엄 원두' },
    { name: '스틱커피', slug: 'stick-coffee', description: '간편하게 즐기는 스틱커피' },
    { name: '드립백', slug: 'drip-bag', description: '간편 드립백 커피' },
    { name: '선물세트', slug: 'gift-set', description: '소중한 분께 커피 선물' },
    { name: '홈카페용품', slug: 'home-cafe', description: '집에서 즐기는 카페' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }

  console.log(`Created ${Object.keys(categories).length} categories.`);

  // ────────────────────────────────────────────
  // 4. Create products
  // ────────────────────────────────────────────
  console.log('Creating products...');

  interface ProductSeed {
    name: string;
    price: number;
    discountPrice?: number;
    categorySlug: string;
    description?: string;
    tags?: string[];
    isFeatured?: boolean;
    stock?: number;
    hasWeightOption?: boolean;
    hasGrindOption?: boolean;
  }

  const productSeeds: ProductSeed[] = [
    // ── 원두커피 (8) ──
    {
      name: '에티오피아 예가체프 G1',
      price: 18900,
      discountPrice: 15900,
      categorySlug: 'coffee-beans',
      description: '꽃향과 과일향이 조화로운 스페셜티 등급 원두. 밝은 산미와 깔끔한 바디감이 특징입니다.',
      tags: ['BEST', 'SALE'],
      isFeatured: true,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '콜롬비아 수프리모 후일라',
      price: 16500,
      categorySlug: 'coffee-beans',
      description: '부드러운 바디감에 캐러멜과 견과류 풍미를 느낄 수 있는 콜롬비아 대표 원두.',
      tags: [],
      isFeatured: false,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '과테말라 안티구아 SHB',
      price: 17800,
      discountPrice: 14800,
      categorySlug: 'coffee-beans',
      description: '화산 토양에서 재배된 고도 원두. 초콜릿과 스모키한 풍미가 특징.',
      tags: ['SALE'],
      isFeatured: false,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '케냐 AA TOP',
      price: 22000,
      categorySlug: 'coffee-beans',
      description: '케냐 최상급 등급의 원두. 와인 같은 산미와 베리류의 풍미가 돋보입니다.',
      tags: ['NEW'],
      isFeatured: true,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '브라질 산토스 NY2',
      price: 14500,
      discountPrice: 12000,
      categorySlug: 'coffee-beans',
      description: '고소한 견과류 향과 낮은 산미가 특징인 대중적인 브라질 원두.',
      tags: ['SALE', 'BEST'],
      isFeatured: true,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '코스타리카 따라주 SHB',
      price: 19500,
      categorySlug: 'coffee-beans',
      description: '밸런스가 뛰어난 중미 대표 원두. 깔끔한 산미와 단맛의 조화.',
      tags: [],
      isFeatured: false,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '인도네시아 만델링 G1',
      price: 21000,
      discountPrice: 18500,
      categorySlug: 'coffee-beans',
      description: '묵직한 바디감과 허브, 다크초콜릿 풍미. 깊은 맛을 좋아하는 분께 추천.',
      tags: ['SALE'],
      isFeatured: false,
      hasWeightOption: true,
      hasGrindOption: true,
    },
    {
      name: '데일리 블렌드 No.1',
      price: 13900,
      categorySlug: 'coffee-beans',
      description: '매일 마시기 좋은 데일리커피 시그니처 블렌드. 균형 잡힌 맛과 향.',
      tags: ['BEST'],
      isFeatured: true,
      hasWeightOption: true,
      hasGrindOption: true,
    },

    // ── 스틱커피 (7) ──
    {
      name: '다크로스트 스틱 (30개입)',
      price: 12900,
      categorySlug: 'stick-coffee',
      description: '깊고 진한 다크로스트 원두로 만든 프리미엄 스틱커피. 하루 한 잔의 여유.',
      tags: ['BEST'],
      isFeatured: true,
    },
    {
      name: '모카 스틱커피 (20개입)',
      price: 9800,
      categorySlug: 'stick-coffee',
      description: '달콤한 초콜릿 풍미와 커피의 조화. 부드럽고 풍부한 맛.',
      tags: [],
      isFeatured: false,
    },
    {
      name: '바닐라 라떼 스틱 (15개입)',
      price: 11500,
      discountPrice: 9900,
      categorySlug: 'stick-coffee',
      description: '부드러운 바닐라 향과 크리미한 라떼의 만남.',
      tags: ['SALE'],
      isFeatured: false,
    },
    {
      name: '디카페인 스틱 (25개입)',
      price: 13500,
      categorySlug: 'stick-coffee',
      description: '카페인 없이도 풍부한 커피 맛. 저녁에도 부담 없이 즐기세요.',
      tags: ['NEW'],
      isFeatured: false,
    },
    {
      name: '카라멜 마키아토 스틱 (15개입)',
      price: 11000,
      categorySlug: 'stick-coffee',
      description: '달콤 쌉싸름한 카라멜과 에스프레소의 하모니.',
      tags: [],
      isFeatured: false,
    },
    {
      name: '헤이즐넛 스틱커피 (20개입)',
      price: 10500,
      discountPrice: 8900,
      categorySlug: 'stick-coffee',
      description: '고소한 헤이즐넛 향이 가득한 풍미 커피.',
      tags: ['SALE'],
      isFeatured: false,
    },
    {
      name: '콜드브루 스틱 (10개입)',
      price: 8900,
      categorySlug: 'stick-coffee',
      description: '차가운 물에도 잘 녹는 콜드브루 스틱. 여름철 필수템.',
      tags: ['NEW'],
      isFeatured: true,
    },

    // ── 드립백 (6) ──
    {
      name: '에티오피아 드립백 (10개입)',
      price: 15800,
      discountPrice: 12900,
      categorySlug: 'drip-bag',
      description: '예가체프 원두를 간편 드립백으로. 꽃향과 과일향을 손쉽게 즐기세요.',
      tags: ['SALE', 'BEST'],
      isFeatured: true,
    },
    {
      name: '콜롬비아 드립백 (10개입)',
      price: 14500,
      categorySlug: 'drip-bag',
      description: '부드럽고 달콤한 콜롬비아 원두 드립백.',
      tags: [],
      isFeatured: false,
    },
    {
      name: '과테말라 드립백 (10개입)',
      price: 14900,
      categorySlug: 'drip-bag',
      description: '스모키하고 깊은 맛의 과테말라 원두 드립백.',
      tags: [],
      isFeatured: false,
    },
    {
      name: '블렌드 드립백 (15개입)',
      price: 16500,
      discountPrice: 13900,
      categorySlug: 'drip-bag',
      description: '데일리커피 시그니처 블렌드를 드립백으로 간편하게.',
      tags: ['SALE'],
      isFeatured: false,
    },
    {
      name: '싱글오리진 드립백 세트',
      price: 19800,
      categorySlug: 'drip-bag',
      description: '5가지 싱글오리진을 한 세트에. 다양한 원두를 비교하며 즐겨보세요.',
      tags: ['NEW'],
      isFeatured: false,
    },
    {
      name: '디카페인 드립백 (10개입)',
      price: 15500,
      categorySlug: 'drip-bag',
      description: '카페인 부담 없는 디카페인 드립백.',
      tags: [],
      isFeatured: false,
    },

    // ── 선물세트 (5) ──
    {
      name: '프리미엄 원두 선물세트',
      price: 45000,
      discountPrice: 39800,
      categorySlug: 'gift-set',
      description: '인기 원두 3종을 고급 패키지에 담은 선물세트. 커피 애호가에게 딱!',
      tags: ['BEST', 'SALE'],
      isFeatured: true,
    },
    {
      name: '드립백 종합 선물세트',
      price: 35000,
      discountPrice: 29800,
      categorySlug: 'gift-set',
      description: '5가지 맛 드립백을 아름다운 박스에 담았습니다.',
      tags: ['SALE'],
      isFeatured: false,
    },
    {
      name: '홈카페 스타터 선물세트',
      price: 55000,
      categorySlug: 'gift-set',
      description: '드리퍼, 서버, 원두가 포함된 홈카페 입문 세트.',
      tags: ['NEW'],
      isFeatured: false,
    },
    {
      name: '커피&머그컵 선물세트',
      price: 38000,
      discountPrice: 32900,
      categorySlug: 'gift-set',
      description: '데일리커피 시그니처 머그컵과 드립백의 조합.',
      tags: ['SALE'],
      isFeatured: false,
    },
    {
      name: '스페셜티 컬렉션 선물세트',
      price: 65000,
      categorySlug: 'gift-set',
      description: '전 세계 스페셜티 원두 5종을 엄선한 프리미엄 컬렉션.',
      tags: ['NEW'],
      isFeatured: false,
    },

    // ── 홈카페용품 (6) ──
    {
      name: '핸드드립 세트',
      price: 32000,
      discountPrice: 27900,
      categorySlug: 'home-cafe',
      description: '드리퍼, 서버, 필터가 포함된 올인원 핸드드립 세트.',
      tags: ['BEST', 'SALE'],
      isFeatured: false,
    },
    {
      name: '커피 그라인더',
      price: 48000,
      categorySlug: 'home-cafe',
      description: '세라믹 버 방식의 수동 커피 그라인더. 균일한 분쇄가 가능합니다.',
      tags: [],
      isFeatured: false,
    },
    {
      name: '드리퍼 세라믹',
      price: 18500,
      categorySlug: 'home-cafe',
      description: '열 보존이 뛰어난 세라믹 소재 드리퍼. 2~4인용.',
      tags: [],
      isFeatured: false,
    },
    {
      name: '커피 서버 500ml',
      price: 15000,
      discountPrice: 12900,
      categorySlug: 'home-cafe',
      description: '내열 유리 소재의 500ml 커피 서버. 눈금 표시 포함.',
      tags: ['SALE'],
      isFeatured: false,
    },
    {
      name: '전자저울 타이머',
      price: 35000,
      categorySlug: 'home-cafe',
      description: '0.1g 단위 측정과 타이머 기능을 갖춘 드립용 전자저울.',
      tags: ['NEW'],
      isFeatured: false,
    },
    {
      name: '드립 포트',
      price: 28000,
      discountPrice: 24900,
      categorySlug: 'home-cafe',
      description: '구즈넥 디자인으로 정밀한 물줄기 컨트롤이 가능한 드립 포트.',
      tags: ['SALE'],
      isFeatured: false,
    },
  ];

  const createdProducts: Record<string, string> = {};

  for (const seed of productSeeds) {
    const productSlug = slugify(seed.name);

    const product = await prisma.product.create({
      data: {
        name: seed.name,
        slug: productSlug,
        description: seed.description ?? null,
        price: seed.price,
        discountPrice: seed.discountPrice ?? null,
        stock: seed.stock ?? 100,
        tags: seed.tags ?? [],
        isActive: true,
        isFeatured: seed.isFeatured ?? false,
        categoryId: categories[seed.categorySlug],
      },
    });

    createdProducts[seed.name] = product.id;

    // Create primary image
    await prisma.productImage.create({
      data: {
        url: '/images/products/placeholder.svg',
        alt: seed.name,
        isPrimary: true,
        order: 0,
        productId: product.id,
      },
    });

    // Create weight options for coffee bean products
    if (seed.hasWeightOption) {
      const weightOptions = [
        { value: '200g', priceModifier: 0 },
        { value: '500g', priceModifier: 5000 },
        { value: '1kg', priceModifier: 12000 },
      ];

      for (const opt of weightOptions) {
        await prisma.productOption.create({
          data: {
            type: OptionType.WEIGHT,
            value: opt.value,
            priceModifier: opt.priceModifier,
            productId: product.id,
          },
        });
      }
    }

    // Create grind options for coffee bean products
    if (seed.hasGrindOption) {
      const grindOptions = [
        { value: '홀빈(분쇄안함)', priceModifier: 0 },
        { value: '중간분쇄', priceModifier: 0 },
        { value: '곱게분쇄', priceModifier: 0 },
      ];

      for (const opt of grindOptions) {
        await prisma.productOption.create({
          data: {
            type: OptionType.GRIND,
            value: opt.value,
            priceModifier: opt.priceModifier,
            productId: product.id,
          },
        });
      }
    }
  }

  console.log(`Created ${Object.keys(createdProducts).length} products with images and options.`);

  // ────────────────────────────────────────────
  // 5. Create reviews
  // ────────────────────────────────────────────
  console.log('Creating reviews...');

  const reviewData = [
    {
      userId: user1.id,
      productName: '에티오피아 예가체프 G1',
      rating: 5,
      content: '꽃향이 정말 좋아요! 핸드드립으로 내려 마시면 과일향이 은은하게 퍼집니다. 재구매 의사 100%입니다.',
    },
    {
      userId: user2.id,
      productName: '브라질 산토스 NY2',
      rating: 4,
      content: '고소하고 부드러워서 매일 아침 마시기 좋습니다. 가성비도 훌륭해요.',
    },
    {
      userId: user1.id,
      productName: '다크로스트 스틱 (30개입)',
      rating: 5,
      content: '회사에서 간편하게 마시기 딱 좋아요. 인스턴트치고 맛이 정말 괜찮습니다. 진한 맛 좋아하시는 분께 추천!',
    },
    {
      userId: user2.id,
      productName: '에티오피아 드립백 (10개입)',
      rating: 4,
      content: '캠핑 갈 때 챙겨갔는데 야외에서 마시니까 더 맛있더라고요. 포장도 예쁘고 선물용으로도 좋을 것 같아요.',
    },
    {
      userId: user1.id,
      productName: '프리미엄 원두 선물세트',
      rating: 5,
      content: '부모님 생신 선물로 드렸는데 너무 좋아하셨어요. 패키지도 고급스럽고 원두 퀄리티도 최고입니다.',
    },
  ];

  for (const review of reviewData) {
    await prisma.review.create({
      data: {
        userId: review.userId,
        productId: createdProducts[review.productName],
        rating: review.rating,
        content: review.content,
        images: [],
      },
    });
  }

  console.log(`Created ${reviewData.length} reviews.`);

  // ────────────────────────────────────────────
  // 6. Create coupons
  // ────────────────────────────────────────────
  console.log('Creating coupons...');

  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: CouponType.PERCENT,
      value: 10,
      minOrderAmount: 20000,
      maxDiscount: 5000,
      expiresAt: new Date('2026-12-31T23:59:59Z'),
      usedCount: 0,
      maxCount: 1000,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FIRST5000',
      type: CouponType.FIXED,
      value: 5000,
      minOrderAmount: 30000,
      maxDiscount: null,
      expiresAt: new Date('2026-12-31T23:59:59Z'),
      usedCount: 0,
      maxCount: 500,
    },
  });

  console.log('Created 2 coupons.');

  // ────────────────────────────────────────────
  // Done
  // ────────────────────────────────────────────
  console.log('Seeding completed successfully!');
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
