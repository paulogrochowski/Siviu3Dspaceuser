'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ExperienceScene } from '../../components/experience-scene';

type ProductId = 'sofa' | 'luminaria' | 'mesa' | 'planta';

const products: Array<{
  id: ProductId;
  name: string;
  category: string;
  price: string;
  finish: string;
}> = [
  { id: 'sofa', name: 'Sofá modular', category: 'Móveis', price: 'R$ 3.890', finish: 'Cinza' },
  { id: 'luminaria', name: 'Luminária pendente', category: 'Iluminação', price: 'R$ 690', finish: 'Preto' },
  { id: 'mesa', name: 'Mesa de jantar', category: 'Móveis', price: 'R$ 2.490', finish: 'Carvalho' },
  { id: 'planta', name: 'Vaso decorativo', category: 'Decoração', price: 'R$ 420', finish: 'Natural' },
];

const finishes = ['Original', 'Claro', 'Escuro', 'Quente'];

export default function ExperienciaPage() {
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [environmentModelUrl, setEnvironmentModelUrl] = useState<string | null>(null);
  const [geometryOnly, setGeometryOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductId | null>(null);
  const [placed, setPlaced] = useState<ProductId[]>([]);
  const [finish, setFinish] = useState('Original');
  const [reconstructionState, setReconstructionState] = useState<'idle' | 'processing' | 'ready' | 'error'>('idle');
  const [reconstructionError, setReconstructionError] = useState<string | null>(null);

  const selected = useMemo(
    () => products.find((product) => product.id === selectedProduct) ?? null,
    [selectedProduct],
  );

  const latestRequest = useRef(0);
  useEffect(() => () => { if (roomImage) URL.revokeObjectURL(roomImage); }, [roomImage]);

  const handleRoom = async (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 20 * 1024 * 1024) {
      setReconstructionError('Escolha uma foto JPG, PNG ou WebP de até 20 MB.');
      return;
    }
    const requestId = ++latestRequest.current;
    const url = URL.createObjectURL(file);
    setRoomImage(url);
    setEnvironmentModelUrl(null);
    setSelectedProduct(null);
    setPlaced([]);
    setReconstructionError(null);
    setReconstructionState('processing');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('geometryOnly', geometryOnly ? 'true' : 'false');

      const response = await fetch('/api/experience/reconstruct', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error(`O servidor não devolveu JSON (HTTP ${response.status}). Atualize a página e tente novamente; se persistir, verifique o túnel.`);
      }
      const payload = (await response.json()) as {
        modelUrl?: string;
        error?: string;
        code?: string;
      };

      if (!response.ok || !payload.modelUrl) {
        throw new Error(payload.error || 'Não foi possível reconstruir o ambiente.');
      }

      if (requestId !== latestRequest.current) return;
      setEnvironmentModelUrl(payload.modelUrl);
      setReconstructionState('ready');
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      setReconstructionState('error');
      setReconstructionError(
        error instanceof Error ? error.message : 'Falha na reconstrução do ambiente.',
      );
    }
  };

  const loadPreviousModel = async () => {
    ++latestRequest.current;
    try {
      const response = await fetch('/api/experience/last-model', { cache: 'no-store' });
      const payload = (await response.json()) as { modelUrl?: string; error?: string };
      if (!response.ok || !payload.modelUrl) throw new Error(payload.error || 'Modelo anterior indisponível.');
      setRoomImage(null);
      setEnvironmentModelUrl(payload.modelUrl);
      setSelectedProduct(null);
      setPlaced([]);
      setReconstructionError(null);
      setReconstructionState('ready');
    } catch (error) {
      setReconstructionError(error instanceof Error ? error.message : 'Não foi possível carregar o modelo anterior.');
      setReconstructionState('error');
    }
  };

  const addProduct = (id: ProductId) => {
    setSelectedProduct(id);
    setPlaced((current) => (current.includes(id) ? current : [...current, id]));
  };

  const removeProduct = (id: ProductId) => {
    setPlaced((current) => current.filter((item) => item !== id));
    setSelectedProduct((current) => (current === id ? null : current));
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090d]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500">
              S3
            </span>
            <span>Siviu3D</span>
          </a>
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Experimente antes de comprar
          </div>
          <a
            href="/"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
          >
            Sair da experiência
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="mb-6">
          <a href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </a>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Experimente o produto no seu espaço.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Escolha uma foto. O Siviu3D transforma o ambiente em um modelo 3D para você explorar e
            depois experimentar os produtos dentro dele.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#101118] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-medium">Seu ambiente</p>
                <p className="text-xs text-slate-500">
                  {reconstructionState === 'ready'
                    ? 'Modelo 3D reconstruído a partir da sua foto'
                    : reconstructionState === 'processing'
                      ? 'O ambiente está sendo reconstruído'
                      : 'Escolha uma foto e a reconstrução começa automaticamente'}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={geometryOnly}
                  onChange={(event) => setGeometryOnly(event.target.checked)}
                  disabled={reconstructionState === 'processing'}
                  className="h-4 w-4 accent-cyan-400"
                />
                Apenas geometria, sem textura (20 créditos)
              </label>
              <button
                type="button"
                onClick={loadPreviousModel}
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-400/20"
                title="Abre um modelo GLB gerado antes, sem consumir créditos."
              >
                Ver GLB anterior (grátis)
              </button>
              <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10">
                <span className="inline-flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  {roomImage ? 'Trocar ambiente' : 'Escolher foto'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => handleRoom(event.target.files?.[0])}
                />
              </label>
            </div>

            <div className="relative min-h-[560px] bg-[#090b10]">
              {reconstructionState === 'ready' && environmentModelUrl ? (
                <ExperienceScene
                  environmentModelUrl={environmentModelUrl}
                  placed={placed}
                  selected={selectedProduct}
                  finish={finish}
                />
              ) : !roomImage ? (
                <label className="absolute inset-0 grid cursor-pointer place-items-center p-8">
                  <div className="max-w-md text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                      <Camera className="h-7 w-7 text-cyan-200" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold">Comece pelo seu ambiente</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Sala, quarto, cozinha, varanda ou área externa. Escolha a foto e o Siviu3D
                      começa a reconstrução automaticamente.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
                      Escolher foto <ArrowRight className="h-4 w-4" />
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => handleRoom(event.target.files?.[0])}
                    />
                  </div>
                </label>
              ) : (
                <div className="absolute inset-0 grid place-items-center overflow-hidden">
                  <img src={roomImage} alt="Ambiente escolhido" className="h-full w-full object-cover opacity-45" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-[#08090d]/30" />

                  <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-black/65 p-5 backdrop-blur-xl">
                    {reconstructionState === 'processing' ? (
                      <>
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" />
                          Reconstruindo seu ambiente em 3D...
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Estamos transformando paredes, piso, objetos e perspectiva da foto em uma
                          cena espacial. Quando terminar, você poderá explorar o ambiente.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-sm font-medium text-red-100">
                          <Camera className="h-4 w-4" />
                          Não foi possível reconstruir o ambiente.
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {reconstructionError}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-white/10 bg-[#101118] p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Layers3 className="h-4 w-4 text-cyan-300" />
                Produtos para experimentar
              </div>
              <div className="mt-4 space-y-2">
                {products.map((product) => {
                  const isPlaced = placed.includes(product.id);
                  return (
                    <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-slate-500">
                            {product.category} · {product.finish}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={reconstructionState !== 'ready'}
                          onClick={() => addProduct(product.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 disabled:opacity-30"
                          title={isPlaced ? 'Selecionar produto' : 'Experimentar'}
                        >
                          {isPlaced ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {reconstructionState !== 'ready' && (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Os produtos entram na cena depois que a reconstrução 3D terminar.
                </p>
              )}
            </section>

            {selected ? (
              <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Editando</p>
                <h2 className="mt-2 text-lg font-semibold">{selected.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{selected.price}</p>

                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-300">Acabamento</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {finishes.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFinish(value)}
                        className={`rounded-xl border px-3 py-2 text-xs transition ${
                          finish === value
                            ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeProduct(selected.id)}
                  className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Retirar do ambiente
                </button>
              </section>
            ) : null}

            <section className="rounded-3xl border border-white/10 bg-[#101118] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Princípio da experiência</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                A foto não é o resultado. Ela é a entrada. O objetivo é reconstruir o espaço e
                colocar os produtos dentro dele, para o cliente experimentar de verdade.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
