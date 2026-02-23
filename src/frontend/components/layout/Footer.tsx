import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-coffee-dark text-cream/80">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-wider mb-4">
              DAILY COFFEE
            </h2>
            <p className="text-sm leading-relaxed text-cream/60">
              매일 신선한 커피를 만나보세요.<br />
              프리미엄 원두커피, 스틱커피, 드립백,<br />
              홈카페용품 전문 온라인몰
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">쇼핑 안내</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=coffee-beans" className="hover:text-accent transition-colors">
                  커피원두
                </Link>
              </li>
              <li>
                <Link href="/products?category=stick-coffee" className="hover:text-accent transition-colors">
                  스틱커피
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-cafe" className="hover:text-accent transition-colors">
                  홈카페
                </Link>
              </li>
              <li>
                <Link href="/products?category=gift" className="hover:text-accent transition-colors">
                  선물하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">고객센터</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <span className="text-lg font-bold text-white">02-2226-4444</span>
              </div>
              <p className="text-cream/60">
                평일 09:00 ~ 18:00<br />
                토/일/공휴일 휴무
              </p>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <span>help@dailycoffee.co.kr</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-accent" />
                <span>서울특별시 중구 데일리커피로 123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
          <p>&copy; {new Date().getFullYear()} 데일리커피. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
