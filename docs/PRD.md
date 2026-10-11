# PRD — Product Requirements Document

**Projeto:** Siviu3D  
**Versão:** 1.0  
**Data:** 2026-07-29  

---

## 1. Visão Geral

O Siviu3D é uma plataforma SaaS B2B que permite que empresas de materiais de construção e decoração ofereçam aos seus clientes finais uma experiência de visualização de produtos em realidade aumentada (AR) diretamente no ambiente real do cliente.

---

## 2. Personas

1. **João, o Consumidor (End User):** Quer reformar a sala, mas tem medo de comprar o piso errado. Quer ver como fica antes de pagar. Usa o celular (Android/iOS).
2. **Maria, a Lojista (Tenant Admin):** Dona de uma loja de revestimentos. Quer aumentar as vendas online e reduzir devoluções. Não tem equipe de TI.
3. **Carlos, o Arquiteto (Profissional):** Precisa mostrar ao cliente final como o projeto vai ficar. Quer ferramentas para montar ambientes completos.

---

## 3. Requisitos Funcionais (Épicos)

### Épico 1: Visualização 3D e AR (Core)
- **RF1.1:** O sistema deve renderizar modelos 3D (GLB) interativos em um canvas web (rotação, zoom).
- **RF1.2:** O sistema deve permitir a entrada em modo Realidade Aumentada.
- **RF1.3:** Em AR, o objeto deve ser ancorado no piso detectado e manter escala real.
- **RF1.4:** O usuário deve poder trocar materiais/cores do objeto no viewer.

### Épico 2: Substituição de Superfícies
- **RF2.1:** O usuário deve poder selecionar uma área plana (piso/parede) e aplicar uma textura de revestimento.
- **RF2.2:** A textura aplicada deve respeitar a escala física real do material (ex: azulejo de 60x60cm).
- **RF2.3:** O sistema deve calcular a área (m²) da superfície delimitada.

### Épico 3: Projetos e Orçamentos
- **RF3.1:** O usuário deve poder salvar a cena atual como um projeto.
- **RF3.2:** O usuário deve poder adicionar múltiplos objetos ao mesmo projeto.
- **RF3.3:** O sistema deve calcular um orçamento estimado com base nos itens do projeto.

### Épico 4: Gestão do Tenant (Admin)
- **RF4.1:** A empresa deve poder cadastrar produtos, categorias e preços.
- **RF4.2:** A empresa deve poder fazer upload de arquivos GLB e texturas.
- **RF4.3:** O sistema deve isolar completamente os dados entre diferentes tenants.

---

## 4. Requisitos Não-Funcionais

- **RNF1 (Performance):** Renderização 3D deve manter mínimo de 30 FPS em dispositivos mobile médios.
- **RNF2 (Acessibilidade):** O portal B2B deve ser responsivo e seguir WCAG 2.1 AA.
- **RNF3 (Segurança):** Uploads devem ser validados quanto a tipo e tamanho.
- **RNF4 (Compatibilidade):** Suporte a Safari (iOS 15+) e Chrome (Android 10+).

---

## 5. Casos de Uso Críticos

### UC1: "Testar Sofá na Sala"
1. Usuário acessa o link do produto (ex: Sofá 3 Lugares).
2. Clica em "Ver no meu ambiente".
3. Browser pede acesso à câmera / redireciona para visualizador AR nativo.
4. Usuário aponta para o chão; o sofá aparece em escala real.
5. Usuário move o sofá para o canto desejado.
6. Usuário tira uma foto e salva o projeto.

### UC2: "Orçamento de Piso"
1. Usuário acessa um modelo de piso cerâmico.
2. Inicia o modo de superfície.
3. Informa a área do cômodo (ex: 15m²).
4. O sistema calcula a quantidade de caixas necessárias com base no rendimento da caixa.
5. Sistema exibe o valor total estimado.

---

## 6. Suposições e Restrições

- Assumimos que o usuário possui um smartphone com suporte mínimo a WebGL e câmera.
- Restrição: A precisão das medidas em AR por câmera única (sem LiDAR) é aproximada (margem de erro de 5-10%). O sistema sempre deve emitir alerta sobre isso.
