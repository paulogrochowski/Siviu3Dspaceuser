'use client';

import { Ruler, Sparkles, ScanLine } from 'lucide-react';

export function EnvironmentPanel() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-200">
        <ScanLine className="h-4 w-4 text-cyan-300" />
        Ambiente e medidas
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Área</p>
          <p className="mt-2 text-xl font-semibold text-white">24 m²</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Altura</p>
          <p className="mt-2 text-xl font-semibold text-white">2,8 m</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Distância</p>
          <p className="mt-2 text-xl font-semibold text-white">3,2 m</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
        <div className="flex items-center gap-2 text-sm text-cyan-100">
          <Ruler className="h-4 w-4" />
          Estimativa de escala
        </div>
        <p className="mt-2 text-sm text-slate-300">
          O cenário mostra escala aproximada para validação visual. A medição precisa deve ser confirmada por profissional habilitado.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Modo AR
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Em dispositivos compatíveis, o usuário pode abrir a visualização em realidade aumentada para posicionar o produto no ambiente real.
        </p>
      </div>
    </div>
  );
}
