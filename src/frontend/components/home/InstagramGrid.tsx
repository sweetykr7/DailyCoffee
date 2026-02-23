import React from 'react';
import { Instagram } from 'lucide-react';

const PLACEHOLDER_IMAGES = [
  { id: 1, color: 'bg-[#d4a574]' },
  { id: 2, color: 'bg-[#8b6651]' },
  { id: 3, color: 'bg-[#c4924a]' },
  { id: 4, color: 'bg-[#e8ddd0]' },
  { id: 5, color: 'bg-[#3d2b1f]' },
  { id: 6, color: 'bg-[#a87a3a]' },
];

export function InstagramGrid() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Instagram className="h-5 w-5 text-accent" />
            <p className="font-display text-sm font-medium uppercase tracking-wider text-accent">
              @dailycoffee_official
            </p>
          </div>
          <h2 className="text-2xl font-bold text-coffee md:text-3xl">Instagram</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {PLACEHOLDER_IMAGES.map((img) => (
            <div
              key={img.id}
              className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg ${img.color}`}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Instagram className="h-8 w-8 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
