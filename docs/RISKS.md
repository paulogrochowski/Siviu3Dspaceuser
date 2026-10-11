# RISKS — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

> Este documento lista os principais riscos técnicos e de produto identificados na Fase 0, e as estratégias de mitigação.

---

## 1. Riscos Tecnológicos (Alto Impacto)

### Risco T1: Fragmentação e Limitações do WebXR no iOS
- **Impacto:** Alto. Se o WebXR no iOS Safari for muito bugado, usuários de iPhone não terão a experiência in-browser (Fase 3).
- **Mitigação:** Estratégia de Fallback robusta e dependência do `Quick Look` (nativs) no iOS como via principal no MVP (Fase 3). WebXR fica focado em Android no início.

### Risco T2: Performance 3D em Mobile Antigos
- **Impacto:** Alto. O browser fecha (crash) devido a falta de RAM, ou FPS fica abaixo de 10.
- **Mitigação:** Cumprir estritamente o `PERFORMANCE-BUDGET.md`. Implementar LOD (Level of Detail) agressivo, limite severo de texturas e forçar Garbage Collection (`dispose`) das instâncias do Three.js.

### Risco T3: Complexidade State Management do 3D + UI
- **Impacto:** Médio. Re-renders desnecessários do React matam o FPS da aplicação.
- **Mitigação:** Isolar completamente o estado da cena 3D no Zustand (sem React Context). Componentes UI "assinam" seletores granulares do Zustand.

---

## 2. Riscos de Produto e Negócio

### Risco P1: Escala/Medidas Erradas geram Prejuízo
- **Impacto:** Crítico. O usuário orça um produto que não cabe, compra, e exige devolução da loja.
- **Mitigação:** Inserção ostensiva de avisos legais ("A escala em AR é aproximada", "Confirme as medidas físicas"). A longo prazo, alertar se a precisão do tracking XR estiver classificada como "low".

### Risco P2: Gargalo na Geração de Conteúdo 3D
- **Impacto:** Alto. Lojas não entram na plataforma pois não têm modelos GLB dos seus produtos.
- **Mitigação:** Para o MVP, oferecer modelos padronizados genéricos e mapeamento de texturas parametrizado (Fase 4). Futuro (Fase 8): IA para auxiliar construção de modelos simples.

### Risco P3: Lock-in do Backend (Supabase/Firebase)
- **Impacto:** Médio. Aumentos de preço do provedor BaaS limitam a margem B2B.
- **Mitigação:** Abordagem de arquitetura modular documentada no `ARCHITECTURE.md`. Manter lógica de negócio isolada, comunicando-se com banco/auth/storage apenas através de adapters definidos pelas interfaces no core da aplicação.
