# API-DESIGN — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

> A API pública do Siviu3D será usada tanto pelo nosso próprio Frontend (apps/web) quanto por terceiros que integrarem o SDK (apps externas).

---

## Princípios

- RESTful JSON API
- Versionamento na URL: `/api/v1/...`
- Autenticação:
  - Frontend próprio: Session Cookie (Supabase)
  - SDK/Externo: Cabeçalho `Authorization: Bearer sk_live_...`
- Rate limiting por IP e por Tenant
- CORS configurável por Tenant

---

## Endpoints Principais (V1)

### Catálogo de Produtos

`GET /api/v1/products`
Retorna a lista de produtos públicos do tenant.
- **Query:** `?category=floor&limit=20&page=1`
- **Response:** Array de `SpatialProduct` (sem dados sensíveis).

`GET /api/v1/products/:id`
Detalhes de um produto, incluindo assets 3D e schemas de configuração.

### Projetos e Cenas

`POST /api/v1/projects`
Cria um novo projeto salvo para o usuário atual (ou anônimo via session temporária).
- **Body:** `{ name: "Minha Sala" }`

`POST /api/v1/projects/:id/scenes`
Salva o estado da cena atual.
- **Body:** `{ sceneData: { ... } }`

`GET /api/v1/projects/share/:token`
Recupera um projeto compartilhado via link público (somente leitura).

### Orçamento

`POST /api/v1/quotes/calculate`
Calcula preço estimado em tempo real sem persistir no banco.
- **Body:** Lista de `{ productId, variantId, quantity, area }`
- **Response:** Subtotal, impostos estimados, warnings de precificação.

`POST /api/v1/quotes`
Gera e salva um orçamento formal.

---

## Formato de Resposta Padrão

### Sucesso
```json
{
  "data": { ... },
  "meta": {
    "pagination": { "total": 100, "page": 1 }
  }
}
```

### Erro
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dados de entrada inválidos",
    "details": [
      { "field": "area", "issue": "Deve ser maior que zero" }
    ]
  }
}
```
