'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Layers3, Ruler, ShoppingCart } from 'lucide-react';

const catalog = [
  {
    id: 'sofa',
    name: 'Sofá modular',
    category: 'Móveis',
    price: 3890,
    description: 'Modelo confortável com acabamento em tecido cinza.',
    accent: 'Lavanda',
  },
  {
    id: 'pool',
    name: 'Piscina de jardim',
    category: 'Exterior',
    price: 12450,
    description: 'Piscina de área externa com borda minimalista.',
    accent: 'Azul profundo',
  },
  {
    id: 'floor',
    name: 'Piso premium',
    category: 'Superfície',
    price: 145,
    description: 'Revestimento monocromático para ambientes sofisticados.',
    accent: 'Cinza claro',
  },
];

const presets = [
  { id: 'sofa', label: 'Sofá', color: '#8b5cf6' },
  { id: 'pool', label: 'Piscina', color: '#38bdf8' },
  { id: 'floor', label: 'Piso', color: '#64748b' },
];

export function CatalogPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selectedProduct = useMemo(
    () => catalog.find((item) => item.id === selectedId) ?? catalog[0],
    [selectedId]
  );

  const [materials, setMaterials] = useState('tecido');
  const [area, setArea] = useState(24);

  const estimatedQuote = useMemo(() => {
    const base = selectedProduct.price;
    const materialFactor = materials === 'tecido' ? 1 : 1.08;
    const areaFactor = area > 20 ? 1.1 : 1;
    return Math.round(base * materialFactor * areaFactor);
  }, [area, materials, selectedProduct.price]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <Layers3 className="h-4 w-4 text-cyan-300" />
        Catálogo do MVP
      </div>

      <div className="grid gap-2">
        {catalog.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`rounded-2xl border p-3 text-left transition ${
              selectedProduct.id === item.id
                ? 'border-cyan-400/60 bg-cyan-400/10 shadow-lg'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>
              <span className="text-sm font-semibold text-cyan-200">R$ {item.price.toLocaleString('pt-BR')}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{selectedProduct.name}</p>
            <p className="mt-1 text-sm text-slate-400">{selectedProduct.description}</p>
          </div>
          <div className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
            {selectedProduct.accent}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`rounded-full px-3 py-1 text-sm ${selectedProduct.id === preset.id ? 'bg-cyan-400/20 text-cyan-100' : 'bg-white/10 text-slate-300'}`}
              style={selectedProduct.id === preset.id ? { border: `1px solid ${preset.color}` } : undefined}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Configuração rápida
        </div>
        <div className="mt-3 space-y-3 text-sm text-slate-300">
          <label className="flex flex-col gap-1">
            <span>Material</span>
            <select
              value={materials}
              onChange={(event) => setMaterials(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
            >
              <option value="tecido">Tecido</option>
              <option value="couro">Couro</option>
              <option value="metal">Metal</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span>Área estimada (m²)</span>
            <input
              type="range"
              min="10"
              max="40"
              value={area}
              onChange={(event) => setArea(Number(event.target.value))}
              className="accent-cyan-400"
            />
            <span className="text-xs text-slate-400">{area} m²</span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
        <div className="flex items-center gap-2 text-sm text-cyan-100">
          <Ruler className="h-4 w-4" />
          Orçamento estimado
        </div>
        <p className="mt-2 text-3xl font-semibold text-white">R$ {estimatedQuote.toLocaleString('pt-BR')}</p>
        <p className="mt-1 text-sm text-slate-300">Inclui configuração visual e estimativa base do MVP.</p>
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-200"
      >
        <ShoppingCart className="h-4 w-4" />
        Solicitar orçamento
      </button>
    </div>
  );
}
