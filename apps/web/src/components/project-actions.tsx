'use client';

import { useEffect, useState } from 'react';
import { Camera, Save, Sparkles } from 'lucide-react';

interface ProjectSnapshot {
  id: number;
  product: string;
  savedAt: string;
}

export function ProjectActions({
  selectedProduct,
  onCapture,
}: {
  selectedProduct: string;
  onCapture: () => void;
}) {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem('siviu3d-snapshots');
    if (stored) {
      try {
        setSnapshots(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem('siviu3d-snapshots');
      }
    }
  }, []);

  const saveProject = () => {
    const nextSnapshot: ProjectSnapshot = {
      id: Date.now(),
      product: selectedProduct,
      savedAt: new Date().toLocaleString('pt-BR'),
    };

    const nextSnapshots = [nextSnapshot, ...snapshots].slice(0, 5);
    setSnapshots(nextSnapshots);
    window.localStorage.setItem('siviu3d-snapshots', JSON.stringify(nextSnapshots));
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-200">
        <Save className="h-4 w-4 text-cyan-300" />
        Projeto e imagem
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={saveProject}
          className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
        >
          <Save className="h-4 w-4" />
          Salvar projeto
        </button>
        <button
          type="button"
          onClick={onCapture}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <Camera className="h-4 w-4" />
          Capturar imagem
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Histórico local
        </div>
        <div className="mt-3 space-y-2 text-sm text-slate-400">
          {snapshots.length === 0 ? (
            <p>Nenhum projeto salvo ainda.</p>
          ) : (
            snapshots.map((snapshot) => (
              <div key={snapshot.id} className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2">
                <p className="font-medium text-slate-200">{snapshot.product}</p>
                <p className="text-xs">{snapshot.savedAt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
