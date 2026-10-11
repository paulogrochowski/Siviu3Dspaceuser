'use client';

import { Calculator, ShoppingBag } from 'lucide-react';

interface QuoteSummaryProps {
  subtotal: number;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToQuote: () => void;
  addedToQuote: boolean;
}

export function QuoteSummary({
  subtotal,
  quantity,
  onQuantityChange,
  onAddToQuote,
  addedToQuote,
}: QuoteSummaryProps) {
  const total = subtotal * quantity;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-200">
        <Calculator className="h-4 w-4 text-cyan-300" />
        Resumo de orçamento
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
          <span>Quantidade</span>
          <input
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(event) => onQuantityChange(Number(event.target.value))}
            className="w-16 rounded-xl border border-white/10 bg-slate-900 px-2 py-1 text-right text-white"
          />
        </div>
        <div className="mt-3 border-t border-white/10 pt-3 text-base font-semibold text-white">
          <div className="flex items-center justify-between">
            <span>Total estimado</span>
            <span>R$ {total.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToQuote}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
          addedToQuote
            ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40'
            : 'bg-white text-slate-900 hover:bg-slate-200'
        }`}
      >
        <ShoppingBag className="h-4 w-4" />
        {addedToQuote ? 'Adicionado ao orçamento' : 'Adicionar ao orçamento'}
      </button>
    </div>
  );
}
