'use client';

import { CheckCircle2, Layers3 } from 'lucide-react';

const alternatives = [
  { id: 'minimal', name: 'Minimal', description: 'Tonalidade neutra e linhas simples.', badge: 'Mais limpo' },
  { id: 'warm', name: 'Quente', description: 'Materiais com sensação acolhedora.', badge: 'Mais acolhedor' },
  { id: 'premium', name: 'Premium', description: 'Acabamento sofisticado e contrastante.', badge: 'Mais impactante' },
];

export function ComparisonPanel({
  selectedComparison,
  onSelect,
}: {
  selectedComparison: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-200">
        <Layers3 className="h-4 w-4 text-cyan-300" />
        Comparação de alternativas
      </div>

      <div className="mt-4 space-y-3">
        {alternatives.map((alternative) => (
          <button
            key={alternative.id}
            type="button"
            onClick={() => onSelect(alternative.id)}
            className={`flex w-full items-start justify-between rounded-2xl border p-3 text-left transition ${
              selectedComparison === alternative.id
                ? 'border-cyan-400/50 bg-cyan-400/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div>
              <p className="font-medium text-white">{alternative.name}</p>
              <p className="mt-1 text-sm text-slate-400">{alternative.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-white/10 px-2 py-1">{alternative.badge}</span>
              {selectedComparison === alternative.id ? <CheckCircle2 className="h-4 w-4 text-cyan-300" /> : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
