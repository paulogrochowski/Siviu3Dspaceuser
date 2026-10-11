'use client';

import { ChevronRight, Sparkles } from 'lucide-react';

const categories = [
  {
    name: 'Reforma',
    children: ['Parede', 'Piso', 'Teto', 'Portas'],
  },
  {
    name: 'Decor',
    children: ['Móveis', 'Luminárias', 'Objetos decorativos'],
  },
  {
    name: 'Externo',
    children: ['Piscina', 'Pergolado', 'Jardim'],
  },
];

export function MenuCategories({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-200">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        Menu de categorias
      </div>

      <div className="mt-4 space-y-2">
        {categories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => onSelectCategory(category.name)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left ${
                selectedCategory === category.name ? 'bg-cyan-400/10 text-cyan-100' : 'text-slate-200'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            {selectedCategory === category.name ? (
              <div className="border-t border-white/10 px-3 py-3 text-sm text-slate-300">
                {category.children.map((child) => (
                  <div key={child} className="rounded-xl px-2 py-2 hover:bg-white/5">
                    {child}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
