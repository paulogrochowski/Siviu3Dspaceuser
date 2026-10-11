# PERFORMANCE-BUDGET — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

> Performance não é uma feature — é um requisito. Um viewer AR que trava não é utilizável. Definimos metas mensuráveis e ferramentas para monitorá-las.

---

## 1. Dispositivos de Referência

| Tier | Dispositivo de Teste | Justificativa |
|---|---|---|
| **Baixo** | Moto G8 (Snapdragon 665, 4GB RAM) | Perfil do usuário de construção civil no Brasil |
| **Médio** | iPhone 12 (A14 Bionic, 4GB RAM) | Base iOS mínima para AR de qualidade |
| **Alto** | Samsung S24 (Snapdragon 8 Gen 3, 12GB RAM) | Referência de top-of-line Android |

O dispositivo de **referência primária** é o **iPhone 12**. Se funciona bem lá, funciona em todos os iOS modernos e no Android médio.

---

## 2. Metas de Performance

### 2.1 Render / FPS

| Métrica | Meta | Limite Crítico |
|---|---|---|
| FPS no viewer 3D (idle) | ≥ 30 FPS | < 20 FPS = inaceitável |
| FPS durante animação de troca de material | ≥ 24 FPS | < 15 FPS = inaceitável |
| FPS em sessão WebXR | ≥ 30 FPS | < 24 FPS = tontura |
| Tempo de resposta ao tap/click | < 100ms | > 300ms = percebível |

### 2.2 Carregamento

| Métrica | Meta | Limite Crítico |
|---|---|---|
| First Contentful Paint (FCP) | < 1.5s | > 3s = alto abandono |
| Largest Contentful Paint (LCP) | < 2.5s | > 4s = penalização Google |
| Time to Interactive (TTI) | < 3s | > 5s = inaceitável |
| Tempo até primeiro frame 3D | < 3s (WiFi) | > 6s (3G) = fallback necessário |
| Tempo de entrada em AR | < 2s após tap | > 4s = abandono |

### 2.3 Tamanho de Bundle

| Bundle | Meta | Limite |
|---|---|---|
| JavaScript inicial (gzipped) | < 200 KB | > 350 KB |
| CSS inicial | < 30 KB | > 60 KB |
| Three.js + R3F (lazy) | < 450 KB | < 600 KB |
| Total First Load | < 500 KB | > 800 KB |

> Three.js sozinho tem ~600KB minificado. Será carregado de forma lazy apenas quando o viewer for necessário.

### 2.4 Memória

| Métrica | Meta | Limite Crítico |
|---|---|---|
| RAM em idle (página catálogo) | < 80 MB | > 150 MB |
| RAM com viewer 3D ativo | < 200 MB | > 350 MB (crash risk no iOS) |
| RAM durante sessão AR | < 300 MB | > 450 MB |
| VRAM (GPU texture memory) | < 100 MB | > 200 MB |

### 2.5 Assets 3D

| Asset | Tamanho recomendado | Máximo absoluto |
|---|---|---|
| Modelo GLB (LOD0 — principal) | < 2 MB | 5 MB |
| Modelo GLB (LOD1 — médio) | < 800 KB | 2 MB |
| Modelo GLB (LOD2 — distante) | < 200 KB | 500 KB |
| Modelo USDZ (iOS) | < 3 MB | 8 MB |
| Textura por material (KTX2) | < 512 KB | 2 MB |
| Thumbnail de produto (WebP) | < 80 KB | 150 KB |
| Screenshot exportado (PNG) | < 1.5 MB | 3 MB |

---

## 3. Estratégias de Otimização

### 3.1 JavaScript

```
- Código de viewer (Three.js + R3F) em dynamic import lazy:
  const Viewer = dynamic(() => import('@/components/viewer/SpatialViewer'), { ssr: false })
  
- Separar bundle do admin do bundle do cliente
- Tree-shaking agressivo — importar apenas o necessário do Three.js
- Evitar importar bibliotecas grandes só para uma função
  (ex: não importar lodash inteiro para usar um map)
```

### 3.2 Modelos 3D

```
Pipeline obrigatório de upload:
1. Validar extensão (.glb, .gltf)
2. Validar tamanho (máximo 50 MB antes de otimização)
3. Executar gltf-transform:
   - dedup()         # remove geometrias/materiais duplicados
   - flatten()       # simplifica hierarquia
   - join()          # agrupa meshes onde possível
   - meshopt()       # compressão Meshopt
4. Gerar 3 LODs com simplify() em 100%, 50%, 25%
5. Validar que LOD0 < 5 MB — rejeitar se exceder
6. Mover para Storage, registrar URLs no banco
```

### 3.3 Texturas

```
Pipeline de textura:
1. Aceitar PNG ou JPG
2. Resize para potência de 2: 512, 1024, 2048
3. Converter para KTX2 com Basis Universal (ktx2):
   - Modo ETC1S para texturas difusas (menor tamanho)
   - Modo UASTC para normais e roughness (maior qualidade)
4. Browser escolhe automaticamente via WebGL extension
```

### 3.4 Renderização Three.js

```
- dpr={[1, 1.5]}: limita pixel ratio em mobile (não usar devicePixelRatio direto)
- performance={{ min: 0.5 }}: R3F reduz resolução se FPS cair muito
- Sombras desativadas por padrão em mobile (ContactShadows em vez de shadow maps)
- Máximo 2 luzes ativas simultaneamente
- useGLTF.preload() para modelos que provavelmente serão usados
- Dispose explícito ao desmontar qualquer objeto 3D
- Instancing para objetos repetidos (ex: grama, pedras)
- Frustum culling habilitado (padrão Three.js)
```

### 3.5 React / Next.js

```
- Evitar re-renders: usar React.memo em componentes pesados
- Separar store da cena 3D do estado de UI (Zustand slices separados)
- React Query para dados do servidor com cache inteligente
- Imagens: next/image com lazy loading automático
- Fontes: next/font com display: swap
- Pré-fetch de rotas com next/link
```

---

## 4. Medição e Monitoramento

### 4.1 Em Desenvolvimento

```bash
# Bundle analyzer
ANALYZE=true pnpm build

# Lighthouse CI
npx lighthouse https://localhost:3000 --view

# Web Vitals no browser
# Adicionar ao _app: import { onCLS, onFID, onLCP } from 'web-vitals'
```

**r3f-perf em desenvolvimento:**
```typescript
// Apenas em NODE_ENV === 'development'
import { Perf } from 'r3f-perf'

<Canvas>
  {process.env.NODE_ENV === 'development' && <Perf />}
  ...
</Canvas>
```

### 4.2 Em Produção

| Ferramenta | O que monitora |
|---|---|
| Vercel Analytics | Core Web Vitals reais de usuários |
| Custom analytics | FPS médio por sessão AR, tempo de carregamento de GLB |
| Supabase logs | Tempo de resposta das queries |
| Alertas automáticos | FPS < 20 por > 3s → log de evento para análise |

### 4.3 Testes de Performance no CI

```yaml
# .github/workflows/perf.yml
- name: Lighthouse Check
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      http://localhost:3000
      http://localhost:3000/catalog
    budgetPath: ./lighthouse-budget.json
    uploadArtifacts: true
```

```json
// lighthouse-budget.json
{
  "resourceSizes": [
    { "resourceType": "script", "budget": 500 },
    { "resourceType": "total", "budget": 800 }
  ],
  "timings": [
    { "metric": "first-contentful-paint", "budget": 1500 },
    { "metric": "interactive", "budget": 3000 }
  ]
}
```

---

## 5. Performance Budget — Checklist antes do Deploy

Antes de cada release, verificar:

- [ ] FPS ≥ 30 no iPhone 12 com modelo de teste
- [ ] Bundle JS inicial < 200 KB gzipped
- [ ] LCP < 2.5s no Lighthouse (mobile, 3G throttled)
- [ ] Nenhum modelo GLB > 5 MB em produção
- [ ] Nenhuma textura > 2 MB em produção
- [ ] Sem vazamentos de memória (teste de 10 minutos no viewer)
- [ ] dispose() chamado em todos os useEffect que criam recursos Three.js
- [ ] r3f-perf removido do bundle de produção

---

## 6. Critérios de Degradação Aceitável

Em dispositivos de baixo tier, o sistema deve degradar gracefully:

| Feature | High tier | Low tier |
|---|---|---|
| Sombras | ContactShadows ativas | Desativadas |
| Environment map | HDR completo | Cor sólida |
| Antialiasing | MSAA x4 | MSAA x2 ou off |
| dpr | 1.5 | 1.0 |
| LOD selecionado | LOD0 | LOD2 |
| AR in-browser | WebXR | Scene Viewer / Quick Look |

**Detecção automática:**
```typescript
function getPerformanceTier(): 'low' | 'medium' | 'high' {
  const memory = (navigator as any).deviceMemory  // GB
  const cores = navigator.hardwareConcurrency
  
  if (memory <= 2 || cores <= 4) return 'low'
  if (memory <= 6 || cores <= 8) return 'medium'
  return 'high'
}
```
