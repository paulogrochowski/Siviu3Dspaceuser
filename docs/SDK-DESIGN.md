# SDK-DESIGN — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

> O objetivo da Fase 7 é permitir que qualquer site e-commerce (Shopify, VTEX, WooCommerce, site custom) incorpore o Siviu3D com facilidade.

---

## 1. Web Component (Custom Element)

Forneceremos um script que registra um Web Component nativo. Isso isola o React/Three.js do resto do site hospedeiro.

### Instalação

```html
<script type="module" src="https://cdn.siviu3d.com/v1/sdk.js"></script>
```

### Uso Simples (Botão Flutuante)

```html
<siviu3d-button
  product-id="prod_123"
  tenant-id="tenant_abc"
  public-key="pk_live_xxxx"
  theme="dark"
>
  Ver no meu ambiente
</siviu3d-button>
```

### Uso Completo (Viewer Embutido)

```html
<siviu3d-viewer
  product-id="prod_123"
  tenant-id="tenant_abc"
  public-key="pk_live_xxxx"
  height="500px"
  width="100%"
  hide-ui="false"
></siviu3d-viewer>
```

---

## 2. Eventos e Integração com Carrinho

O site hospedeiro precisa reagir quando o usuário configura um produto no Siviu3D e quer comprar.

```javascript
const viewer = document.querySelector('siviu3d-viewer');

viewer.addEventListener('siviu3d:add-to-cart', (event) => {
  const { productId, variantId, quantity, price, configuration } = event.detail;
  
  // Lógica do site hospedeiro (ex: Shopify Storefront API)
  minhaLoja.adicionarAoCarrinho({ id: variantId, qtd: quantity });
});
```

---

## 3. Segurança e Performance

- O SDK carrega o core 3D (Three.js) sob demanda (`import()`), apenas se o usuário interagir.
- Uso do Shadow DOM garante que o CSS do site hospedeiro não quebre a UI do Siviu3D e vice-versa.
- A `public-key` só permite acesso de leitura aos produtos e orçamentos do respectivo tenant.
