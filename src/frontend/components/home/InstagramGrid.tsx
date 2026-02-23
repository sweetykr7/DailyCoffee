import { Instagram } from 'lucide-react';

const PLACEHOLDER_IMAGES = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  color: i % 2 === 0 ? 'bg-coffee-light/20' : 'bg-accent/20',
}));

export function InstagramGrid() {
  return (
    <section className="py-12">
      <div className="container-custom text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Instagram className="h-5 w-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-coffee">
            @dailycoffee_official
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {PLACEHOLDER_IMAGES.map((img) => (
            <div
              key={img.id}
              className={`aspect-square rounded-lg ${img.color} flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer`}
            >
              <svg className="h-8 w-8 text-coffee/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-6a2 2 0 00-2-2zm-9 14c-2.79 0-5-2.24-5-5V5h12v7c0 2.79-2.24 5.01-5 5.01L9.5 17zM20 6h2v8h-2V6z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
