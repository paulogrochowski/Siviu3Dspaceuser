# Siviu3D

**Plataforma de Visualização Espacial para Construção Civil, Arquitetura e Comércio Visual**

> Aponte a câmera do celular para qualquer ambiente e veja produtos em escala real — piso novo, piscina no quintal, sofá na sala — antes de comprar ou contratar.

---

## Status Atual

**Fase 0 — Descoberta e Arquitetura** (em andamento)

Nenhum código de aplicação foi implementado ainda. Esta fase entrega:
- Análise completa do ambiente e projeto predecessor
- Auditoria de reuso documentada e aprovada
- Documentação de arquitetura e decisões técnicas detalhadas
- Escopo executável do MVP e roadmap de 9 fases

---

## O Produto

O Siviu3D permite que qualquer pessoa aponte o celular para um ambiente real e:

| Categoria | Exemplos |
|---|---|
| **Objetos** | Sofá, piscina, pergolado, churrasqueira, móveis |
| **Superfícies** | Piso, tinta, revestimento, papel de parede, deck |
| **Estruturas** | Telhado, fachada, escada, portas, janelas |
| **Medição** | Distância, área, folgas, validação de encaixe |
| **Orçamento** | Preço em tempo real, m², mão de obra, frete |
| **Compra** | Catálogo, carrinho, pedido, instalação |

---

## Estrutura do Monorepo

```
Siviu3D/
├── apps/
│   ├── web/          # Portal do cliente (Next.js) — câmera, catálogo, AR
│   ├── admin/        # Painel da empresa — cadastro de produtos, pedidos
│   ├── studio/       # Studio profissional — projetos detalhados
│   └── docs/         # Documentação pública
├── packages/
│   ├── spatial-core/       # Detecção de planos, âncoras, rastreamento
│   ├── scene-engine/       # Cena Three.js, objetos, hierarquia, undo/redo
│   ├── product-engine/     # Catálogo, dimensões, variantes, regras
│   ├── surface-engine/     # Aplicação de piso/tinta, recorte, área
│   ├── measurement-engine/ # Distância, área, volume, validação dimensional
│   ├── pricing-engine/     # Orçamento, m², mão de obra, frete
│   ├── project-engine/     # Ambientes, versões, histórico, share
│   ├── ar-adapters/        # WebXR, Scene Viewer, Quick Look, fallback
│   ├── sdk/                # Web component incorporável
│   ├── ui/                 # Design system compartilhado
│   ├── schemas/            # Zod schemas versionados
│   ├── database/           # Acesso a dados, migrations, seeds
│   └── observability/      # Logs, métricas, feature flags
├── services/
│   ├── asset-processor/    # Otimização GLB, conversão USDZ, thumbnails
│   ├── ai-pipeline/        # Segmentação, profundidade, recomendação
│   └── render-worker/      # Renderização assíncrona de imagens
├── docs/                   # Documentação técnica interna
├── scripts/                # Automações de build, deploy, seed
├── tests/                  # Testes E2E e integração cross-packages
└── tooling/                # ESLint, Prettier, tsconfig base, Jest
```

---

## Documentação Técnica

| Documento | Descrição | Status |
|---|---|---|
| [PRODUCT-VISION.md](docs/PRODUCT-VISION.md) | Visão, proposta de valor e posicionamento | ✅ |
| [PRD.md](docs/PRD.md) | Requisitos detalhados do produto | ✅ |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura modular do sistema | ✅ |
| [DOMAIN-MODEL.md](docs/DOMAIN-MODEL.md) | Modelo de domínio e entidades | ✅ |
| [DATA-MODEL.md](docs/DATA-MODEL.md) | Schemas de dados e banco | ✅ |
| [MVP-SCOPE.md](docs/MVP-SCOPE.md) | Escopo executável do primeiro MVP | ✅ |
| [ROADMAP.md](docs/ROADMAP.md) | Fases 0 a 9 com critérios de conclusão | ✅ |
| [REUSE-AUDIT.md](docs/REUSE-AUDIT.md) | Auditoria de reuso do projeto predecessor | ✅ |
| [TECH-STACK-DECISION.md](docs/TECH-STACK-DECISION.md) | Decisões de stack com justificativas | ✅ |
| [ADR-001](docs/ADR-001-PROJECT-STRUCTURE.md) | ADR: Estrutura do projeto | ✅ |
| [ADR-002](docs/ADR-002-BACKEND.md) | ADR: Backend e banco de dados | ✅ |
| [ADR-003](docs/ADR-003-3D-ENGINE.md) | ADR: Engine 3D e renderização | ✅ |
| [ADR-004](docs/ADR-004-AR-STRATEGY.md) | ADR: Estratégia de realidade aumentada | ✅ |
| [SECURITY.md](docs/SECURITY.md) | Política de segurança e LGPD | ✅ |
| [PERFORMANCE-BUDGET.md](docs/PERFORMANCE-BUDGET.md) | Orçamento de performance e metas | ✅ |
| [API-DESIGN.md](docs/API-DESIGN.md) | Design da API REST | ✅ |
| [SDK-DESIGN.md](docs/SDK-DESIGN.md) | Design do SDK incorporável | ✅ |
| [TEST-STRATEGY.md](docs/TEST-STRATEGY.md) | Estratégia de testes | ✅ |
| [RISKS.md](docs/RISKS.md) | Riscos identificados e mitigações | ✅ |

---

## Princípios de Engenharia

- **Mobile-first**: câmera, AR e UI projetadas para celular desde o início
- **AR como diferencial**: posicionamento espacial real, não apenas 3D estático
- **Multi-tenant nativo**: cada empresa com catálogo, preços e identidade próprios
- **Domínio antes de UI**: lógica de negócio isolada, testável e agnóstica de framework
- **Performance mensurável**: orçamentos definidos e monitorados desde o início
- **TypeScript strict**: schemas Zod validados, `any` proibido
- **Segurança por design**: tenant isolation no backend, uploads validados, LGPD

---

## Separação de Projetos

| Projeto | Caminho | Função |
|---|---|---|
| **Siviu3D** | `C:\Users\paulo\Siviu3D` | Plataforma espacial — este projeto |
| **Copos Mania** | `C:\Users\paulo\SITE PRODUTOS PERSONALIZADOS` | Loja de copos — projeto independente, não modificar |

---

## Licença

Proprietário — © 2026 Siviu3D. Todos os direitos reservados.
