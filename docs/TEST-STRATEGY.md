# TEST-STRATEGY — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

---

## 1. Pirâmide de Testes

- **Unitários (Jest / Vitest):** Lógica pura, cálculos de área, regras de pricing. (Alvo: 80% coverage nas engines de domínio).
- **Integração (Testing Library):** Componentes React, hooks Zustand interconectados. (Foco em fluxos críticos).
- **End-to-End (Playwright):** Testes de navegador simulando usuário real.

---

## 2. Abordagem para AR e 3D

Testar fluxos 3D e AR de forma automatizada é notoriamente difícil, pois envolvem WebGL e interações de hardware (câmera).

### Testes Visuais de Regressão
Usar Playwright para tirar screenshots do Canvas 3D e comparar com uma baseline (pixelmatch). Ajuda a garantir que atualizações do Three.js não quebrem shaders ou iluminação.

### Mock de WebXR
Criar um polyfill mockado do `navigator.xr` para simular detecção de piso (hit test) e ancoragem em testes automatizados.

### QA Manual Obrigatório
Fluxos críticos de AR (Scene Viewer e Quick Look) exigem teste manual periódico em devices reais (iPhone e Android) antes de releases, pois dependem de aplicativos do SO fora do nosso controle.

---

## 3. Testes em Mobile

Configurar o Playwright para emular as viewports de mobile. Como a plataforma é *mobile-first*, os testes E2E rodam primordialmente no profile de mobile.
