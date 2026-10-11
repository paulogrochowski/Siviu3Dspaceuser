# ADR-001 — Estrutura do Projeto: Monorepo vs. Aplicação Modular

**Data:** 2026-07-29  
**Status:** Aceito  
**Decisores:** CTO, Arquiteto de Software

---

## Contexto

O Siviu3D precisa eventualmente suportar:
- `apps/web` — portal do cliente
- `apps/admin` — painel da empresa
- `apps/studio` — editor profissional
- `packages/*` — engines compartilhadas
- `services/*` — workers de processamento

A decisão é: começar com monorepo completo, aplicação única, ou estrutura modular lógica?

---

## Opções Avaliadas

### Opção 1: Monorepo completo desde o início (Turborepo + pnpm workspaces)
**Prós:** Separação máxima, melhor para times, build cache  
**Contras:** Overhead de configuração alto, tooling complexo, lento para MVP solo

### Opção 2: Aplicação Next.js única com tudo inline
**Prós:** Zero overhead, máxima velocidade  
**Contras:** Difícil separar depois, tudo acoplado, difícil escalar times

### Opção 3: Estrutura de diretórios de monorepo + pnpm workspaces + uma app ativa por vez ✅ ESCOLHIDA
**Prós:** 
- Diretórios criados corretamente desde o início (sem refatoração futura)
- pnpm workspaces configurado mas com apenas `apps/web` ativa no MVP
- Packages são pastas locais com `package.json` minimal
- Quando necessário, cada package já está pronto para publicação

---

## Decisão

**Estrutura de monorepo com pnpm workspaces**, mas **apenas `apps/web` ativo no MVP**.

```
Siviu3D/               ← root (pnpm-workspace.yaml aqui)
├── apps/
│   └── web/           ← ATIVO no MVP (Next.js completo)
│   └── admin/         ← placeholder, ativado na Fase 5
│   └── studio/        ← placeholder, ativado na Fase 6
├── packages/
│   └── schemas/       ← ATIVO desde o início (tipos Zod compartilhados)
│   └── ui/            ← ATIVO desde a Fase 2
│   └── [outros]/      ← stubs que evoluem conforme necessidade
└── tooling/           ← tsconfig.base.json, eslint.base.js
```

**Por que não Turborepo ainda:**  
O overhead de configuração do Turborepo não se justifica com uma única app ativa. Será adicionado quando `apps/admin` entrar em desenvolvimento paralelo.

---

## Consequências

- **Positivas:** Estrutura correta desde o início, sem refatoração futura
- **Negativas:** `packages/` com código mínimo inicialmente pode parecer overengineering
- **Mitigação:** Documentação clara de que a estrutura é intencional e evoluirá

---

## Revisão

Revisar esta decisão ao iniciar desenvolvimento de `apps/admin` (Fase 5).
