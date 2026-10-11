# REUSE-AUDIT — Siviu3D

**Versão:** 2.0  
**Data:** 2026-07-29  
**Analista:** Equipe de engenharia Siviu3D  
**Projeto analisado:** `C:\Users\paulo\SITE PRODUTOS PERSONALIZADOS` (Copos Mania)

> ⚠️ **Nenhum código foi copiado nesta etapa.** Este documento registra a análise e define o que poderá ser reaproveitado, com as adaptações obrigatórias, somente após aprovação.

---

## 1. Arquivos Analisados

| Arquivo | Tamanho | Finalidade identificada |
|---|---|---|
| `package.json` | 2.4 KB | Dependências e scripts |
| `src/lib/types.ts` | 1.6 KB | Tipos de domínio (copos) |
| `src/lib/utils.ts` | 2.4 KB | Utilitários genéricos + Bezier |
| `src/lib/image-utils.ts` | 5.5 KB | Processamento de imagem canvas |
| `src/components/customizer/LiveCupPreview.tsx` | 7.0 KB | Viewer 3D com R3F + OrbitControls |
| `src/components/customizer/cup-customizer.tsx` | 5.1 KB | Interface de personalização |
| `src/components/customizer/customization-form.tsx` | 15.8 KB | Formulário de configuração |
| `src/components/customizer/image-uploader.tsx` | 14.4 KB | Upload e manipulação de imagens |
| `src/hooks/use-mobile.tsx` | 0.6 KB | Detecção de dispositivo móvel |
| `src/hooks/use-cart.tsx` | 2.6 KB | Estado do carrinho |
| `src/hooks/use-toast.ts` | 3.9 KB | Sistema de notificações |
| `src/app/layout.tsx` | 1.2 KB | Layout raiz Next.js |
| `src/app/globals.css` | 2.7 KB | CSS global + variáveis Tailwind |
| `src/ai/` | — | Integração Genkit/Google AI |
| `next.config.ts` | 0.6 KB | Configuração Next.js |
| `tsconfig.json` | 0.6 KB | TypeScript config |
| `tailwind.config.ts` | 2.9 KB | Tema Tailwind |

---

## 2. Componentes Reaproveitáveis

### 2.1 Padrão de setup do Canvas React Three Fiber
**Arquivo:** `LiveCupPreview.tsx` (linhas 183–198)  
**O que é:** Setup do `<Canvas>` com câmera, iluminação, `OrbitControls`, `Environment`, `ContactShadows` e `Suspense`.  
**Por que é reutilizável:** O padrão é completamente agnóstico ao tipo de objeto. Qualquer viewer 3D do Siviu3D precisa exatamente dessa estrutura.  
**Adaptações necessárias:**
- Renomear de `LiveCupPreview` para `SpatialViewer` ou similar
- Remover `ContactShadows` com cor do copo — usar shadow dinâmico
- Parametrizar posição de câmera por tipo de experiência (`OBJECT_PLACEMENT` vs `SURFACE_REPLACEMENT`)
- Adicionar suporte a múltiplos objetos na cena
- Adicionar sistema de seleção de objeto ativo  
**Risco:** Baixo  
**Dependências:** `@react-three/fiber@9.0.4`, `@react-three/drei@9.122.0`, `three@0.174.0`

---

### 2.2 Criação de textura por Canvas 2D
**Arquivo:** `LiveCupPreview.tsx` — função `createGradientTexture` e `useCompositeTexture`  
**O que é:** Composição de camadas (imagens, texto, gradientes) em canvas 2D para gerar `CanvasTexture` do Three.js.  
**Por que é reutilizável:** A lógica de gerar texturas proceduralmente em canvas é exatamente o que o Surface Engine precisará para aplicar padrões, gradientes e personalizações em superfícies de paredes e pisos.  
**Adaptações necessárias:**
- Desacoplar completamente das propriedades de copos (`paintType`, `finish`, `layers`)
- Criar interface genérica `TextureCompositionLayer` para o Siviu3D
- Adicionar suporte a escala física real (ex: azulejo de 60×60cm em textura tileable)
- Adicionar suporte a repetição UV para pisos
- Tipar corretamente (remover `any` em `applySelectiveTransparency`)  
**Risco:** Médio — a dependência entre composição de textura e geometria específica do copo precisa ser desfeita completamente  
**Dependências:** API Canvas nativa (sem dependências externas)

---

### 2.3 Algoritmos de visão computacional em canvas
**Arquivo:** `image-utils.ts`  
**O que é:** Flood fill, detecção de silhueta por seed points, aplicação de máscara de transparência.  
**Por que é reutilizável:** O Surface Engine precisará de algoritmos similares para delimitar áreas de piso, detectar bordas de parede, e aplicar texturas apenas dentro de uma região selecionada.  
**Adaptações necessárias:**
- Renomear e documentar com contexto espacial
- Remover `any` em `applySelectiveTransparency`
- Adicionar tipagem completa para `TransparencyConfig`
- Considerar migração para Web Worker para não bloquear a thread principal
- Avaliar substituição por biblioteca de CV mais robusta (OpenCV.js) na Fase 8  
**Risco:** Médio — algoritmos funcionais mas precisam de refactoring para performance em mobile  
**Dependências:** API Canvas nativa

---

### 2.4 Hook `useIsMobile`
**Arquivo:** `use-mobile.tsx`  
**O que é:** Hook que detecta se o dispositivo é mobile usando `matchMedia`.  
**Por que é reutilizável:** Genérico, sem qualquer acoplamento ao domínio de copos.  
**Adaptações necessárias:**
- Expandir para detectar também capacidade de câmera (`navigator.mediaDevices`)
- Adicionar detecção de suporte a WebXR (`navigator.xr`)
- Adicionar detecção de OS (iOS vs Android) para fluxo de AR correto  
**Risco:** Baixo  
**Dependências:** Nenhuma

---

### 2.5 Sistema de toast/notificações
**Arquivo:** `use-toast.ts`  
**O que é:** Hook de gerenciamento de notificações toast com fila e timeout.  
**Por que é reutilizável:** Completamente genérico, sem referência a copos.  
**Adaptações necessárias:**
- Verificar compatibilidade com o design system do Siviu3D
- Possível substituição por `sonner` ou `react-hot-toast` para simplificar  
**Risco:** Baixo  
**Dependências:** Nenhuma externa

---

### 2.6 Padrão de upload com dropzone
**Arquivo:** `image-uploader.tsx`  
**O que é:** Componente de upload com drag & drop, preview e validação.  
**Por que é reutilizável:** O admin panel do Siviu3D precisará de upload de modelos 3D e texturas.  
**Adaptações necessárias:**
- Remover lógica específica de processamento de imagens de copos
- Generalizar para aceitar GLB, GLTF, PNG, JPG, KTX2
- Adicionar validação de tamanho e tipo de arquivo
- Integrar com storage do Siviu3D (Supabase Storage ou equivalente)  
**Risco:** Médio — muita lógica embedded que precisa ser extraída  
**Dependências:** `react-dropzone@14.2.3`

---

### 2.7 Configuração Next.js e TypeScript
**Arquivo:** `next.config.ts`, `tsconfig.json`  
**O que é:** Configuração de projeto Next.js com TypeScript.  
**Por que é reutilizável:** Ponto de partida para as apps do monorepo.  
**Adaptações necessárias:**
- Atualizar para Next.js 15+ com App Router
- Configurar `strict: true` completo
- Adicionar configuração de transpilePackages para os packages internos
- Criar `tsconfig.base.json` em `tooling/` para o monorepo  
**Risco:** Baixo  
**Dependências:** `next@15.1.11`, `typescript@^5`

---

### 2.8 Stack de dependências 3D validada
**O que é:** Versões testadas e compatíveis entre `react@19`, `@react-three/fiber@9.0.4`, `@react-three/drei@9.122.0`, `three@0.174.0`.  
**Por que é reutilizável:** Esta combinação foi validada em produção. O monorepo de overrides resolve conflitos de peer deps.  
**Adaptações necessárias:**
- Manter as versões fixadas (`0.174.0` do Three.js, não `latest`)
- Copiar o bloco `overrides` do `package.json` para o workspace root
- Avaliar upgrade do Three.js para versão com WebGPU quando estável  
**Risco:** Baixo — versões já testadas

---

## 3. Componentes Rejeitados

### 3.1 `cup-customizer.tsx` — **REJEITADO**
**Motivo:** Lógica de domínio 100% específica de copos: seleção de modelo de copo, geometria lathe, etapas de personalização de copo. Não possui valor reutilizável sem reescrever por completo.  
**Risco de reaproveitamento:** Alto acoplamento ao domínio de copos introduziria contaminação no Siviu3D.

### 3.2 `customization-form.tsx` — **REJEITADO**
**Motivo:** 15KB de formulário orientado a copos (acabamento, cor, degradê, arte, camadas de copo). Nenhuma abstração aproveitável sem reescrever por completo.

### 3.3 `src/lib/types.ts` — **REJEITADO parcialmente**
**Motivo:** `CustomizationOptions`, `CartItem`, `SavedDesign`, `Layer`, `FavoriteImage` são todos orientados ao domínio de copos.  
**Exceção:** `Vector2D` pode ser reaproveitado como utilitário matemático genérico.

### 3.4 `use-cart.tsx` — **REJEITADO**
**Motivo:** Regras de negócio de carrinho orientadas a copos personalizados (isQuoteRequest, customization específica).

### 3.5 `src/ai/` — **REJEITADO**
**Motivo:** Fluxos Genkit específicos para geração de arte de copos. O AI Pipeline do Siviu3D terá arquitetura completamente diferente (segmentação, profundidade, recomendação de produtos).

### 3.6 `src/app/` — **REJEITADO**
**Motivo:** Rotas e páginas da loja de copos (personalizar, modelos, minha-galeria). Identidade visual e branding da Copos Mania.

### 3.7 `globals.css` / `tailwind.config.ts` — **REJEITADO**
**Motivo:** Tema e variáveis CSS do sistema Copos Mania. O Siviu3D terá design system próprio.

---

## 4. Adaptações Necessárias por Componente

| Componente | Esforço | Prioridade para MVP |
|---|---|---|
| Canvas R3F setup | Baixo (1-2h) | Alta — necessário na Fase 2 |
| Criação de textura canvas | Médio (4-8h) | Média — Fase 4 |
| Algoritmos CV (flood fill etc.) | Médio (4-8h) | Média — Fase 4 |
| Hook `useIsMobile` expandido | Baixo (1h) | Alta — Fase 1 |
| Sistema de toast | Baixo (1h) | Média — Fase 1 |
| Componente de upload | Médio (8-16h) | Alta — Fase 2 (upload de GLBs) |
| Config Next.js / tsconfig | Baixo (2h) | Alta — Fase 1 |
| Stack deps 3D | Trivial (30min) | Alta — Fase 1 |

---

## 5. Riscos Técnicos Identificados

### R01 — Versão de Three.js pode estar desatualizada para WebXR
`three@0.174.0` ainda não tem suporte completo ao WebXR Depth Sensing. Monitorar releases do Three.js e avaliar upgrade controlado.

### R02 — React Three Fiber com React 19 ainda em maturação
A combinação R3F 9.x + React 19 + Suspense ainda apresenta edge cases. O bloco `overrides` do projeto de copos mitiga parcialmente, mas requer testes dedicados no Siviu3D.

### R03 — Algoritmos de CV em canvas bloqueiam a thread principal
`getFloodFillMask` executa síncronamente e pode bloquear a UI em imagens grandes. Para o Siviu3D, mover para Web Worker desde o início.

### R04 — Ausência de LOD no projeto de copos
O projeto de copos não implementa LOD (Level of Detail). Para o Siviu3D, com objetos maiores e cenas complexas, LOD é obrigatório para performance em mobile.

### R05 — Firebase vs Supabase — decisão ainda em aberto
O projeto de copos usa Firebase. O Siviu3D pode ir para Supabase para ganhar PostgreSQL nativo e melhor multi-tenancy. Decisão na ADR-002.

---

## 6. Dependências Envolvidas no Reaproveitamento

```
Reaproveitáveis sem upgrade:
- react@19.0.0
- @react-three/fiber@9.0.4
- @react-three/drei@9.122.0
- three@0.174.0
- react-dropzone@14.2.3
- next@15.1.11
- typescript@^5
- zod@^3.24.2

Avaliar substituição/upgrade:
- firebase@11.9.1 → Supabase (decisão ADR-002)
- @genkit-ai/* → arquitetura de AI própria (Fase 8)
- tailwindcss@^3.4.1 → manter ou migrar para CSS Modules no design system

NÃO trazer para o Siviu3D:
- openai@^4.76.0 (decisão diferente no AI Pipeline)
- genkit@1.39.0 (substituir por solução específica)
- Qualquer arquivo .env ou chave de API
```

---

## 7. Conclusão

O projeto de copos é uma **referência de padrões e stack**, não uma base de código para copiar. A stack 3D (R3F + Drei + Three.js) foi validada em produção e será reaproveitada com as versões fixadas. Os algoritmos genéricos (canvas, CV, hooks) serão adaptados após esta auditoria.

**Próximo passo:** Aguardar aprovação deste relatório antes de qualquer cópia ou adaptação de código.
