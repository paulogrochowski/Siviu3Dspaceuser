'use client';

import { Heart, ShoppingCart, Home, Settings, User, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const homeCategories = [
  { id: 'construcao', name: 'Construção', emoji: '🏠', color: 'bg-amber-100' },
  { id: 'decoracao', name: 'Decoração', emoji: '🎨', color: 'bg-pink-100' },
  { id: 'moveis', name: 'Móveis', emoji: '🛋️', color: 'bg-green-100' },
  { id: 'iluminacao', name: 'Iluminação', emoji: '💡', color: 'bg-yellow-100' },
];

const destaques = [
  { id: 1, name: 'Sofá Moderno', price: '$ 1.250', image: 'bg-amber-200', liked: false },
  { id: 2, name: 'Cozinha Clean', price: '$ 3.750', image: 'bg-orange-200', liked: false },
  { id: 3, name: 'Luminária Trio', price: '$ 850', image: 'bg-yellow-200', liked: false },
  { id: 4, name: 'Parede Interna', price: '$ 650', image: 'bg-slate-200', liked: false },
];

const maisVendidos = [
  { id: 5, name: 'Casa Forest', price: '$ 5.200', image: 'bg-green-300', liked: false },
  { id: 6, name: 'Lote Urbano', price: '$ 4.100', image: 'bg-blue-300', liked: false },
  { id: 7, name: 'Escritório Pro', price: '$ 2.800', image: 'bg-purple-300', liked: false },
  { id: 8, name: 'Sala Zen', price: '$ 3.200', image: 'bg-cyan-300', liked: false },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [destaquesList, setDestaquesList] = useState(destaques);
  const [vendidosList, setVendidosList] = useState(maisVendidos);
  const [activePage, setActivePage] = useState('home');

  const toggleLike = (id: number, list: typeof destaques, setList: typeof setDestaquesList) => {
    setList(list.map(item => item.id === id ? { ...item, liked: !item.liked } : item));
  };

  const slides = ['bg-gradient-to-br from-green-400 via-blue-400 to-green-300', 'bg-gradient-to-br from-blue-400 to-purple-400', 'bg-gradient-to-br from-yellow-300 to-orange-400'];

  return (
    <main className="bg-white text-slate-900 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🔷</div>
          <div>
            <h1 className="text-lg font-bold">Siviu3D Store</h1>
            <p className="text-xs text-blue-200">Transforme seu mundo!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 cursor-pointer" />
          <div className="relative">
            <ShoppingCart className="h-5 w-5 cursor-pointer" />
            <span className="absolute -top-2 -right-2 bg-blue-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Banner */}
        <div className="relative h-48 overflow-hidden">
          <div className={`absolute inset-0 ${slides[currentSlide]} transition-all duration-500`} />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Construa, decore e realize sonhos!</h2>
            </div>
            <button className="bg-green-500 text-white font-bold px-4 py-2 rounded-full w-fit text-sm hover:bg-green-600">
              Ver destaques
            </button>
          </div>
          {/* Carousel Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition ${i === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
            ))}
          </div>
        </div>

        {/* Categorias */}
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Categorias</h3>
            <a href="#" className="text-blue-500 text-sm font-semibold">Ver todas</a>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {homeCategories.map(cat => (
              <div key={cat.id} className={`${cat.color} rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition`}>
                <span className="text-3xl">{cat.emoji}</span>
                <p className="text-xs font-semibold text-center text-slate-800">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Destaques */}
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Destaques</h3>
            <a href="#" className="text-blue-500 text-sm font-semibold">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {destaquesList.map(product => (
              <div key={product.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white border border-slate-200">
                <div className={`${product.image} h-32 relative`}>
                  <button 
                    onClick={() => toggleLike(product.id, destaquesList, setDestaquesList)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md"
                  >
                    <Heart className={`h-4 w-4 ${product.liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-slate-900 line-clamp-2">{product.name}</p>
                  <p className="text-green-600 font-bold text-sm">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mais Vendidos */}
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Mais vendidos</h3>
            <a href="#" className="text-blue-500 text-sm font-semibold">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {vendidosList.map(product => (
              <div key={product.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white border border-slate-200">
                <div className={`${product.image} h-32 relative`}>
                  <button 
                    onClick={() => toggleLike(product.id, vendidosList, setVendidosList)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md"
                  >
                    <Heart className={`h-4 w-4 ${product.liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-slate-900 line-clamp-2">{product.name}</p>
                  <p className="text-green-600 font-bold text-sm">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-20">
        <button className="flex flex-col items-center gap-1 text-xs font-semibold text-green-500 hover:text-green-600">
          <Home className="h-5 w-5" />
          Início
        </button>
        <button className="flex flex-col items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ShoppingCart className="h-5 w-5" />
          Categorias
        </button>
        <button className="flex flex-col items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <Heart className="h-5 w-5" />
          Favoritos
        </button>
        <button className="flex flex-col items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <Settings className="h-5 w-5" />
          Pedidos
        </button>
        <button className="flex flex-col items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <User className="h-5 w-5" />
          Perfil
        </button>
      </nav>
    </main>
  );
}
