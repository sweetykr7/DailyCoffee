import { Suspense } from 'react';
import { ProductsClient } from './ProductsClient';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="text-coffee-light">상품을 불러오는 중...</div></div>}>
      <ProductsClient />
    </Suspense>
  );
}
