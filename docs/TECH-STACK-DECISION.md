# TECH-STACK-DECISION — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29  
**Status:** Decisões principais tomadas. Pendências marcadas.

---

## 1. Frontend

### Decisão: Next.js 15 + React 19 + TypeScript 5 (strict)

| Critério | Avaliação |
|---|---|
| Velocidade de MVP | ✅ App Router + Server Components aceleram muito |
| SSR/SSG | ✅ Necessário para SEO do portal e documentação pública |
| Ecossistema | ✅ Maior ecossistema de componentes disponível |
| Experiência prévia | ✅ Projeto de copos já valida a stack |
| Mobile/PWA | ✅ Suporte nativo via next-pwa |
| TypeScript strict | ✅ Suporte completo |

**Alternativas descartadas:**
- Vite + React SPA: descartado porque perde SSR/SSG (necessário para SEO)
- Remix: descartado por ecossistema menor e menos validado com R3F
- SvelteKit: descartado por ausência de ecossistema 3D comparável

**Configuração TypeScript obrigatória:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 2. Engine 3D

### Decisão: Three.js 0.174.0 + React Three Fiber 9.0.4 + Drei 9.122.0

| Critério | Avaliação |
|---|---|
| Maturidade | ✅ Three.js é o padrão da indústria para 3D web |
| React integration | ✅ R3F elimina boilerplate de scene management |
| GLB/GLTF | ✅ `GLTFLoader` nativo |
| AR/WebXR | ✅ Three.js tem suporte a WebXR |
| Performance | ✅ WebGL 2, instancing, LOD |
| Validado | ✅ Mesmo stack do projeto de copos |

**Versões fixadas** (não usar `latest` — breaking changes frequentes):
```json
{
  "three": "0.174.0",
  "@react-three/fiber": "9.0.4",
  "@react-three/drei": "9.122.0",
  "@types/three": "0.174.0"
}
```

**Alternativas avaliadas:**
- Babylon.js: API mais complexa, ecossistema React menor
- PlayCanvas: engine de jogos, overhead desnecessário
- A-Frame: muito limitado para a complexidade do Siviu3D

**Futuro:** Avaliar Three.js WebGPU backend quando disponível em dispositivos mainstream (2027+).

---

## 3. Estilização

### Decisão: Tailwind CSS 3.x + shadcn/ui (base) + CSS Modules para componentes complexos

| Critério | Avaliação |
|---|---|
| Velocidade de desenvolvimento | ✅ Tailwind accelera muito |
| Design system controlável | ✅ CSS variables para theming multi-tenant |
| Bundle size | ✅ PurgeCSS remove classes não usadas |
| Responsividade | ✅ Utilities mobile-first |

**Por que não só shadcn/ui:**  
O Siviu3D precisa de componentes especializados (viewer AR, seletor de superfície, régua de medição) que vão além do que shadcn oferece. Tailwind + CSS custom para esses casos.

**Por que não CSS Modules apenas:**  
Velocidade de MVP é prioridade. Tailwind mantém consistência sem esforço.

---

## 4. Estado Global

### Decisão: Zustand para estado de cena + React Query para dados do servidor

| Store | Tecnologia | Justificativa |
|---|---|---|
| Estado da cena 3D | Zustand | Síncrono, performático, sem re-renders desnecessários |
| Objeto selecionado | Zustand | Acesso direto do R3F sem prop drilling |
| Histórico undo/redo | Zustand (middleware immer) | Estado imutável para histórico |
| Dados do servidor | React Query (TanStack) | Cache, invalidação, loading states |
| Autenticação | Zustand + cookie JWT | Estado simples e persistido |

**Alternativas descartadas:**
- Redux: overhead desnecessário para este caso de uso
- Jotai: bom, mas Zustand tem melhor integração com Three.js
- Context API: não performático para estado de cena (re-renders frequentes)

---

## 5. Validação de Schemas

### Decisão: Zod 3.x para todos os schemas de dados

```typescript
// Exemplo de schema versionado
export const SpatialProductV1 = z.object({
  _schemaVersion: z.literal('1.0'),
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  experienceType: z.enum([
    'OBJECT_PLACEMENT',
    'SURFACE_REPLACEMENT', 
    'STRUCTURAL_ASSEMBLY',
    'ENVIRONMENT_COMPOSITION',
    'PRODUCT_CUSTOMIZATION'
  ]),
  // ...
})

export type SpatialProduct = z.infer<typeof SpatialProductV1>
```

**Versionamento:** Todo schema exporta uma versão literal (`_schemaVersion`). Migrations explícitas ao incrementar.

---

## 6. Formulários

### Decisão: React Hook Form 7.x + Zod resolver

Combinação já validada no projeto de copos. Permite:
- Formulários controlados sem re-render desnecessário
- Validação integrada com schemas Zod
- TypeScript inference automático

---

## 7. Backend — DECISÃO PENDENTE ⚠️

**Esta é a decisão mais crítica ainda em aberto.** Ver [ADR-002](ADR-002-BACKEND.md) para análise completa.

### Opção A: Supabase (recomendada para MVP)

| Critério | Supabase |
|---|---|
| Velocidade MVP | ✅ 2-3 semanas |
| PostgreSQL | ✅ nativo |
| Row Level Security | ✅ perfeito para multi-tenancy |
| Storage | ✅ buckets, URLs assinadas |
| Auth | ✅ integrado |
| Realtime | ✅ para colaboração futura |
| Custo MVP | ~$25/mês (Pro plan) |
| Vendor lock-in | Médio — mas exportável |
| Escalabilidade | ✅ até ~1M usuários |

### Opção B: Firebase

| Critério | Firebase |
|---|---|
| Velocidade MVP | ✅ 1-2 semanas (familiar no projeto de copos) |
| Multi-tenancy | ⚠️ Requer implementação manual |
| SQL | ❌ NoSQL (Firestore) — consultas complexas difíceis |
| Storage | ✅ Firebase Storage |
| Custos em escala | ⚠️ Pode ficar caro com volume |
| Integração com IA | Médio |

### Opção C: PostgreSQL dedicado + API própria

| Critério | PostgreSQL dedicado |
|---|---|
| Controle | ✅ Total |
| Velocidade MVP | ❌ 4-8 semanas extras |
| Manutenção | ❌ Alta |
| Custo inicial | Alto |
| Recomendado para MVP | ❌ Não |

**Recomendação:** Começar com **Supabase**. Migrar para PostgreSQL dedicado se crescimento > 100k usuários mensais.

**⚠️ PENDÊNCIA:** Aprovação do responsável técnico antes de implementar.

---

## 8. Armazenamento de Assets

### Decisão: Supabase Storage (se Supabase for escolhido) ou Cloudflare R2

| Critério | Supabase Storage | Cloudflare R2 |
|---|---|---|
| Custo egress | Incluído no plano | $0 egress |
| Integração | ✅ Nativa com Supabase | Requer SDK adicional |
| CDN | ✅ CDN embutido | ✅ CDN Cloudflare |
| URLs assinadas | ✅ | ✅ |

**Estrutura de diretórios no bucket:**
```
{tenantId}/
  products/
    {productId}/
      model.glb
      model.usdz
      thumbnail.webp
      lod-0.glb
      lod-1.glb
      textures/
        diffuse.ktx2
        normal.ktx2
  projects/
    {projectId}/
      scene.json
      renders/
        {timestamp}.webp
```

---

## 9. Processamento Assíncrono

### Decisão: Supabase Edge Functions + Cron para MVP; avaliar Inngest ou Trigger.dev em escala

**Jobs necessários:**
1. `optimize-glb`: comprimir com Draco/Meshopt ao fazer upload
2. `generate-usdz`: converter GLB → USDZ para iOS
3. `generate-thumbnail`: render do modelo + salvar WebP
4. `compress-texture`: converter PNG → KTX2
5. `analyze-3d-file`: validar triângulos, materiais, bounds

---

## 10. Monorepo Tooling

### Decisão: pnpm workspaces (sem Turborepo no MVP)

| Critério | pnpm workspaces | Turborepo |
|---|---|---|
| Simplicidade | ✅ | ⚠️ Overhead inicial |
| Caching | ❌ Manual | ✅ Automático |
| Velocidade | ✅ pnpm é rápido | ✅✅ |
| Necessário no MVP | ❌ Não | ❌ Não |

**Decisão:** pnpm workspaces nativo para o MVP. Adicionar Turborepo quando houver múltiplos packages com builds independentes.

---

## 11. Qualidade de Código

| Ferramenta | Função |
|---|---|
| TypeScript strict | Tipagem obrigatória |
| ESLint + @typescript-eslint | Linting |
| Prettier | Formatação |
| Husky + lint-staged | Pre-commit hooks |
| Jest + Testing Library | Testes unitários e de componente |
| Playwright | Testes E2E |

---

## 12. CI/CD

### MVP: Vercel (para Next.js) + GitHub Actions

**Deploy automático:**
- `main` → produção (vercel.com)
- `develop` → staging (vercel preview)

**Pipeline CI:**
```
push → typecheck → lint → test:unit → build → deploy:preview
PR merge main → test:e2e → deploy:prod
```

---

## Resumo de Decisões

| Área | Decisão | Status |
|---|---|---|
| Framework | Next.js 15 | ✅ Decidido |
| Engine 3D | Three.js + R3F | ✅ Decidido |
| Styling | Tailwind + shadcn | ✅ Decidido |
| Estado | Zustand + React Query | ✅ Decidido |
| Validação | Zod | ✅ Decidido |
| Formulários | React Hook Form | ✅ Decidido |
| Backend | **Supabase (recomendado)** | ⚠️ Aguardando aprovação |
| Storage | Supabase Storage | ⚠️ Depende do backend |
| Monorepo | pnpm workspaces | ✅ Decidido |
| CI/CD | Vercel + GitHub Actions | ✅ Decidido |
