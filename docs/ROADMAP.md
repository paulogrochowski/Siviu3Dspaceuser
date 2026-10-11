# ROADMAP — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

---

## Visão Geral

| Fase | Nome | Duração estimada | Status |
|---|---|---|---|
| 0 | Descoberta e Arquitetura | 1 semana | 🔄 Em andamento |
| 1 | Fundação | 2-3 semanas | ⏳ Aguardando |
| 2 | Viewer 3D | 2-3 semanas | ⏳ Aguardando |
| 3 | AR para Objetos | 2-3 semanas | ⏳ Aguardando |
| 4 | Superfícies | 2-3 semanas | ⏳ Aguardando |
| 5 | Projetos | 3-4 semanas | ⏳ Aguardando |
| 6 | Configuração e Orçamento | 3-4 semanas | ⏳ Aguardando |
| 7 | SDK Incorporável | 3-4 semanas | ⏳ Aguardando |
| 8 | Inteligência Artificial | 6-8 semanas | ⏳ Aguardando |
| 9 | Marketplace | 8-12 semanas | ⏳ Aguardando |

**MVP funcional:** Conclusão das Fases 1 a 4 (~10 semanas)

---

## FASE 0 — Descoberta e Arquitetura

**Objetivo:** Criar a base de conhecimento e tomar decisões técnicas antes de escrever código de produção.

**Entregáveis:**
- [x] Análise do projeto predecessor (Copos Mania)
- [x] Auditoria de reuso documentada (REUSE-AUDIT.md)
- [x] Modelo de domínio (DOMAIN-MODEL.md)
- [x] Decisões técnicas (ADR-001 a ADR-004, TECH-STACK-DECISION.md)
- [x] Escopo do MVP (MVP-SCOPE.md)
- [x] Orçamento de performance (PERFORMANCE-BUDGET.md)
- [x] Política de segurança (SECURITY.md)
- [x] Estratégia de testes (TEST-STRATEGY.md)
- [x] Riscos identificados (RISKS.md)
- [x] Estrutura de diretórios criada
- [ ] Aprovação do responsável técnico para iniciar Fase 1

**Critério de conclusão:** Todos os documentos produzidos e aprovados. Decisão de backend tomada.

---

## FASE 1 — Fundação

**Objetivo:** Infraestrutura que todo o resto vai usar. Sem atalhos aqui.

**Backend:**
- [ ] Projeto Supabase criado (dev + prod)
- [ ] Schema inicial do banco (migrations)
- [ ] Row Level Security configurado para multi-tenancy
- [ ] Autenticação: email/senha + magic link
- [ ] Bucket de storage com políticas de acesso
- [ ] Tenant seed: 1 tenant de demonstração

**Frontend:**
- [ ] `apps/web` com Next.js 15 + TypeScript strict
- [ ] `tooling/tsconfig.base.json` e `tooling/eslint.base.js`
- [ ] `packages/schemas` com schemas Zod para todas as entidades
- [ ] Design system base: tokens de cor, tipografia, espaçamento
- [ ] Componentes UI base: Button, Input, Select, Modal, Toast
- [ ] Layout mobile-first: nav inferior, header, grid
- [ ] Páginas: Home, Catálogo, Produto, Login, Dashboard básico

**DevOps:**
- [ ] Repositório Git no Siviu3D (já inicializado)
- [ ] `.gitignore` completo (sem .env, sem node_modules)
- [ ] GitHub Actions: typecheck + lint + test
- [ ] Deploy preview no Vercel

**Critério de conclusão:** Usuário consegue criar conta, logar e ver o catálogo vazio.

---

## FASE 2 — Viewer 3D

**Objetivo:** Produto visível em 3D interativo com qualidade.

**Engine:**
- [ ] `packages/scene-engine`: estrutura de state da cena
- [ ] Componente `SpatialViewer` com R3F + Drei
- [ ] Carregamento de GLB com `useGLTF` + Suspense
- [ ] LOD básico (seleção por distância)
- [ ] `OrbitControls` para mobile (touch-friendly)
- [ ] Iluminação: Environment + DirectionalLight
- [ ] `ContactShadows` para objetos no chão
- [ ] Sistema de seleção de objeto (tap/click)
- [ ] Transformações: mover, rotacionar (Fase 3)

**Produto:**
- [ ] Página de produto com viewer
- [ ] Exibição de dimensões (overlay no viewer)
- [ ] Seletor de variante com atualização em tempo real
- [ ] Seletor de material/textura
- [ ] Captura de screenshot (canvas.toBlob)
- [ ] Loading skeleton enquanto GLB carrega

**Performance:**
- [ ] Medir FPS com r3f-perf em desenvolvimento
- [ ] Verificar que bundle < 250KB gzipped
- [ ] Dispose correto de geometrias/materiais

**Critério de conclusão:** Sofá renderizando a 30 FPS em iPhone 12 com variante de cor funcionando.

---

## FASE 3 — AR para Objetos

**Objetivo:** Produto posicionado no ambiente real do usuário.

- [ ] `packages/ar-adapters`: interface `ARAdapter` + 3 implementações
- [ ] Detector de plataforma (iOS/Android/Desktop/WebXR)
- [ ] Scene Viewer adapter: deep link Android com GLB URL
- [ ] Quick Look adapter: link rel="ar" iOS com USDZ URL
- [ ] Servidor de conversão GLB → USDZ (Supabase Edge Function ou serviço)
- [ ] WebXR adapter (basic): hit test + âncora no piso
- [ ] Fallback adapter: mensagem + link para celular
- [ ] Botão "Ver no meu ambiente" contextual por plataforma
- [ ] Aviso legal antes de abrir AR (escala aproximada)
- [ ] Testes em dispositivos reais: iPhone 12+, Android Snapdragon 865+

**Critério de conclusão:** Sofá e piscina abrindo em AR no iPhone e Android com escala correta.

---

## FASE 4 — Superfícies

**Objetivo:** Usuário consegue "trocar o piso" de um cômodo.

- [ ] `packages/surface-engine`: tipos, cálculo de área, aplicação de textura
- [ ] Ambiente demonstrativo 3D (sala genérica com piso detectável)
- [ ] Seleção de superfície de piso (touch area)
- [ ] Aplicação de textura com scale real (repeat UV baseado em dimensões físicas)
- [ ] Ajuste de orientação da textura (rotação em 90° steps)
- [ ] Campo de área (manual por ora — AR real na Fase 8)
- [ ] Cálculo de quantidade de caixas (área / rendimento do produto)
- [ ] Orçamento de piso: área × preço/m²
- [ ] Galeria de 5 pisos demonstrativos com texturas KTX2

**Critério de conclusão:** Usuário consegue visualizar 5 pisos diferentes e calcular orçamento por m².

---

## FASE 5 — Projetos

**Objetivo:** Usuário salva e organiza seus projetos.

- [ ] `packages/project-engine`: CRUD de projetos e ambientes
- [ ] Sincronização com Supabase (substituir LocalStorage do MVP)
- [ ] Múltiplos ambientes por projeto
- [ ] Múltiplos objetos por ambiente
- [ ] Serialização/deserialização de cena (JSON ↔ SceneData)
- [ ] Histórico de versões (simples — nova versão ao salvar)
- [ ] Comparação de versões (side by side)
- [ ] Compartilhamento via link (shareToken)
- [ ] Visualização de projeto compartilhado (sem login)
- [ ] `apps/admin`: painel completo para empresa
  - Listagem de projetos dos clientes
  - Visualização de cenas dos clientes
  - Comentários em projetos

**Critério de conclusão:** Usuário salva projeto com 3 objetos e 1 superfície, compartilha link com cliente.

---

## FASE 6 — Configuração e Orçamento

**Objetivo:** Orçamento profissional gerado automaticamente.

- [ ] `packages/pricing-engine`: regras complexas de preço
- [ ] `packages/configuration-engine` (ou inline): regras de compatibilidade entre variantes
- [ ] Configurador visual: UI de seleção de opções com dependências
- [ ] Preço em tempo real ao selecionar variantes
- [ ] Orçamento completo: produto + mão de obra + frete
- [ ] PDF de orçamento gerado server-side
- [ ] Envio de orçamento por email
- [ ] Histórico de orçamentos no painel admin
- [ ] Orçamento por m² para superfícies com detalhamento

**Critério de conclusão:** PDF de orçamento gerado e enviado por email com todos os itens.

---

## FASE 7 — SDK Incorporável

**Objetivo:** Qualquer loja pode adicionar "Ver em AR" ao próprio site.

- [ ] `packages/sdk`: web component `<siviu3d-viewer>`
- [ ] Atributos: `product-id`, `tenant-id`, `api-key`, `theme`
- [ ] Eventos: `add-to-cart`, `save-project`, `view-ar`, `configure`
- [ ] Theming via CSS custom properties
- [ ] API pública REST: produtos, variantes, orçamento
- [ ] API key management no painel admin
- [ ] Documentação de integração
- [ ] Exemplo de integração com página HTML simples
- [ ] Exemplo de integração com Shopify (liquid snippet)

**Critério de conclusão:** SDK funcionando em uma página HTML externa com produto de teste.

---

## FASE 8 — Inteligência Artificial

**Objetivo:** IA acelera o uso e melhora a experiência.

- [ ] `services/ai-pipeline`: infraestrutura de processamento
- [ ] Segmentação de piso por foto (Segment Anything Model ou similar)
- [ ] Estimativa de profundidade (DPT ou MiDaS)
- [ ] Remoção de objetos da cena (inpainting)
- [ ] Recomendação de produtos por estilo (CLIP embeddings + pgvector)
- [ ] Análise de compatibilidade de produtos na cena
- [ ] Conversão foto → área 3D assistida (semi-automático)
- [ ] Auto-geração de thumbnails de produtos
- [ ] Auto-classificação de produtos por imagem
- [ ] Pipeline de otimização automática de GLB no upload

**Critério de conclusão:** Usuário tira foto do ambiente e recebe detecção automática de área de piso.

---

## FASE 9 — Marketplace

**Objetivo:** Plataforma completa de conexão entre clientes, lojas e profissionais.

- [ ] Marketplace de fornecedores (catálogo multi-vendor)
- [ ] Marketplace de profissionais (arquitetos, instaladores, piscineiros)
- [ ] Sistema de avaliações
- [ ] Solicitação de proposta (RFQ)
- [ ] Pagamento integrado (Stripe ou Pagar.me)
- [ ] Split de pagamento para comissão da plataforma
- [ ] Gestão de pedidos (status, entrega, instalação)
- [ ] App nativo iOS/Android (React Native + Expo)
- [ ] Notificações push

**Critério de conclusão:** Usuário consegue solicitar proposta de piscineiro, receber proposta e aceitar via plataforma.

---

## Dependências entre Fases

```
Fase 0 → Fase 1 (aprovação necessária)
Fase 1 → Fase 2
Fase 2 → Fase 3 (necessita viewer funcionando)
Fase 2 → Fase 4 (necessita viewer funcionando)
Fase 3 + 4 → MVP completo
Fase 1 → Fase 5 (necessita banco)
Fase 5 → Fase 6
Fase 6 → Fase 7
Fase 7 → Fase 8 (API necessária para IA)
Fase 6 + 8 → Fase 9
```
