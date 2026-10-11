# MVP-SCOPE — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29  
**Status:** Aprovado para Fase 1

> O MVP não é a visão completa do produto. É a menor versão funcional que prova o núcleo da proposta de valor: **colocar um produto em escala real em um ambiente real pelo celular**.

---

## Critérios de Sucesso do MVP

O MVP é considerado funcional quando um usuário conseguir:

**Para objetos:**
1. ✅ Abrir o Siviu3D no celular
2. ✅ Escolher um produto do catálogo
3. ✅ Visualizar o produto em 3D (viewer interativo)
4. ✅ Acessar AR compatível com o dispositivo (Scene Viewer / Quick Look)
5. ✅ Posicionar o produto em escala aproximadamente real
6. ✅ Mudar uma variante de cor ou material
7. ✅ Visualizar as dimensões do produto
8. ✅ Salvar a configuração
9. ✅ Gerar uma imagem/screenshot do projeto
10. ✅ Receber um orçamento estimado

**Para superfícies:**
1. ✅ Escolher um piso do catálogo
2. ✅ Visualizar aplicado sobre uma superfície demonstrativa
3. ✅ Ajustar orientação da textura
4. ✅ Informar ou calcular a área em m²
5. ✅ Estimar quantidade de caixas e preço total

---

## Escopo INCLUSO no MVP

### Experiências demonstrativas (3 obrigatórias)

#### EXP-01: Sofá na Sala (OBJECT_PLACEMENT)
- Catálogo com 3 opções de sofá (modelos GLB licenciados ou criados)
- Viewer 3D com rotação livre
- AR via Scene Viewer (Android) ou Quick Look (iOS)
- Variantes: 2 cores por sofá
- Dimensões exibidas (Larg × Prof × Alt em cm)
- Captura de screenshot
- Orçamento com preço unitário

#### EXP-02: Piscina no Quintal (OBJECT_PLACEMENT)
- 2 modelos de piscina (retangular, redonda)
- Viewer 3D
- AR com aviso de escala
- Aviso legal antes de iniciar: escala aproximada, consulte profissional
- Dimensões exibidas
- Orçamento estimado (construção não inclusa, apenas o produto)

#### EXP-03: Troca de Piso (SURFACE_REPLACEMENT)
- 5 pisos demonstrativos (cerâmico, porcelanato, madeira, vinyl, pedra)
- Visualização em ambiente demonstrativo 3D pré-configurado (foto ou modelo simples)
- Aplicação da textura com escala real
- Campo para informar área em m²
- Cálculo automático de quantidade de caixas (baseado no rendimento do produto)
- Orçamento: quantidade × preço por m²

---

### Funcionalidades Core

| Funcionalidade | Detalhamento |
|---|---|
| Catálogo básico | Grid com thumbnail, nome, preço, dimensões. Filtro por categoria. |
| Visualizador 3D | Canvas React Three Fiber. Rotação, zoom. Exibição de dimensões. |
| Entrada AR | Botão contextual por plataforma. Deep link ou link rel="ar". |
| Troca de variante | Seletor de cor/material no viewer. Atualização em tempo real. |
| Captura de imagem | Screenshot do canvas. Download para galeria do usuário. |
| Salvamento de projeto | LocalStorage para MVP. Nome editável. Máximo de 10 projetos. |
| Orçamento estimado | Cálculo client-side. PDF simples ou tela de resumo. |
| Painel admin básico | CRUD de produtos. Upload de GLB. Configuração de variantes e preço. |

---

### Painel Administrativo (básico)

- Autenticação simples (email + senha)
- Listagem de produtos do tenant
- Criar/editar produto:
  - Nome, descrição, categoria
  - Upload de GLB (máximo 10 MB)
  - Thumbnail
  - Dimensões (Larg × Prof × Alt)
  - Preço base
  - Variantes com preço
  - Superfícies permitidas
- Ativar/desativar produto

---

## Escopo EXCLUÍDO do MVP

| Funcionalidade | Motivo da exclusão | Fase |
|---|---|---|
| App nativo iOS/Android | Meses de desenvolvimento, sem ROI no MVP | Fase 9 |
| WebXR in-browser | Ainda instável em iOS, complexo | Fase 3 |
| Segmentação de piso por IA | Infraestrutura de IA é Fase 8 | Fase 8 |
| Foto → 3D automático | Pesquisa ainda em andamento | Fase 8 |
| Marketplace de profissionais | Complexidade de pagamento e onboarding | Fase 9 |
| Marketplace de fornecedores | Idem | Fase 9 |
| Múltiplos ambientes por projeto | Fase 5 | Fase 5 |
| Colaboração em tempo real | Supabase Realtime, Fase 5 | Fase 5 |
| BIM integration | Futuro distante | Após Fase 9 |
| Simulação estrutural | Fora do escopo do produto | Fora do roadmap |
| Cálculo de engenharia real | Idem | Fora do roadmap |
| Medição AR em tempo real | WebXR Measurement, Fase 3 | Fase 3 |
| SDK incorporável | Fase 7 | Fase 7 |
| API pública | Fase 7 | Fase 7 |
| Multi-tenancy completo | Fase 1 (fundação), mas UI de admin básica apenas | Fase 1 |

---

## Modelos 3D para o MVP

**Estratégia:** Usar modelos free/CC0 com licença explícita documentada.

| Objeto | Fonte sugerida | Licença |
|---|---|---|
| Sofá 3 lugares | Sketchfab CC0 ou criado no Blender | CC0 / MIT |
| Sofá 2 lugares | Idem | CC0 / MIT |
| Piscina retangular | Criado no Blender (geometria simples) | Proprietário |
| Piscina redonda | Criado no Blender | Proprietário |
| Textura piso cerâmico | Polyhaven.com | CC0 |
| Textura porcelanato | Polyhaven.com | CC0 |
| Textura madeira | Polyhaven.com | CC0 |
| Textura vinyl | Polyhaven.com | CC0 |
| Textura pedra | Polyhaven.com | CC0 |

**Regra:** Toda fonte de modelo 3D e textura DEVE ser documentada em `docs/ASSET-CREDITS.md`.

---

## Fluxo do Usuário — MVP

```
[Página Inicial]
  ↓
  Catálogo de produtos
  ↓
  Seleciona produto
  ↓
  [Página do Produto]
  ├── Viewer 3D (sempre disponível)
  ├── Dimensões do produto
  ├── Seletor de variante
  ├── Preço
  └── Botão "Ver no meu ambiente"
       ↓
       ┌── Android → Scene Viewer (GLB)
       ├── iOS → Quick Look (USDZ)
       └── Desktop/sem suporte → Mensagem + link para celular
  ↓
  [Resumo / Orçamento]
  ├── Produto selecionado + variante
  ├── Preço estimado
  ├── Screenshot (se capturado)
  └── Botão "Salvar projeto"
```

---

## Marcos e Entregáveis

| Marco | Entregável | Critério de aceite |
|---|---|---|
| M1 — Fundação | Projeto Next.js rodando com Supabase auth | Login + logout funcionando |
| M2 — Viewer 3D | Sofá renderizando com R3F | 30 FPS em iPhone 12 |
| M3 — AR Android | Scene Viewer abrindo com modelo correto | Modelo em escala real no ambiente |
| M4 — AR iOS | Quick Look abrindo com USDZ | Idem no iOS |
| M5 — Piso | Textura aplicada em superfície demonstrativa | Escala real, orientação ajustável |
| M6 — Orçamento | Tela de orçamento gerada | Preço correto baseado na área/quantidade |
| M7 — Admin | CRUD de produtos com upload de GLB | Produto criado visível no catálogo |
| MVP completo | Todos os critérios de sucesso atendidos | Demo gravada em celular real |

---

## Limitações do MVP — Comunicação ao Usuário

O sistema deve comunicar claramente:

1. **Escala:** "A escala do produto é aproximada. Confirme as medidas antes da compra."
2. **AR:** "A qualidade da realidade aumentada depende do seu dispositivo e das condições de iluminação."
3. **Orçamento:** "Os preços são estimativas. Solicite uma proposta formal para valores definitivos."
4. **Instalação:** "A instalação não está inclusa neste orçamento. Solicite uma proposta de instalação separadamente."
5. **Estrutural:** "Para obras estruturais (piscina, pergolado, etc.), consulte um engenheiro ou arquiteto."
