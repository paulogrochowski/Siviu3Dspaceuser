# ADR-002 — Backend e Banco de Dados

**Data:** 2026-07-29  
**Status:** Proposto — Aguardando aprovação  
**Decisores:** CTO, Engenheiro de Backend

---

## Contexto

O Siviu3D precisa de:
- Autenticação (email/senha, OAuth, magic link)
- Multi-tenancy com isolamento real de dados
- Banco relacional para consultas complexas (projetos, catálogo, orçamentos)
- Storage de assets (GLBs, texturas, thumbnails, renders)
- Processamento assíncrono (otimização de GLB, conversão USDZ)
- Escalabilidade para SaaS B2B
- Integração futura com AI Pipeline
- Compliance LGPD

---

## Análise Comparativa

| Critério | Supabase | Firebase | PostgreSQL dedicado |
|---|---|---|---|
| **Velocidade de MVP** | 2-3 semanas | 1-2 semanas | 6-10 semanas |
| **Banco de dados** | PostgreSQL nativo | Firestore (NoSQL) | PostgreSQL nativo |
| **Consultas complexas** | ✅ SQL completo | ⚠️ Limitado | ✅ SQL completo |
| **Multi-tenancy** | ✅ Row Level Security | ⚠️ Manual | ✅ RLS ou schema-per-tenant |
| **Auth integrada** | ✅ | ✅ | ❌ Implementar (Auth.js) |
| **Storage** | ✅ Buckets + URLs assinadas | ✅ Firebase Storage | ❌ Implementar (S3/R2) |
| **Realtime** | ✅ Postgres CDC | ✅ Firestore listeners | ❌ Implementar (Ably/Pusher) |
| **Edge Functions** | ✅ Deno Deploy | ✅ Cloud Functions | ❌ Implementar |
| **Custo inicial** | $25/mês (Pro) | Pay-as-you-go | $50-100/mês (VPS) |
| **Custo em escala** | Previsível | ⚠️ Pode escalar rápido | Controlado |
| **Vendor lock-in** | Médio (exportável) | Alto | Zero |
| **Escalabilidade** | ✅ até ~1M req/dia | ✅ | ✅ sem limite prático |
| **Integração com IA** | ✅ pgvector para embeddings | ⚠️ Complexo | ✅ pgvector nativo |
| **Experiência prévia** | ❌ Novo | ✅ Usado nos copos | ❌ Novo |

---

## Análise de Multi-Tenancy

### Supabase (Row Level Security)
```sql
-- Política RLS para tabela products
CREATE POLICY "tenant_isolation" ON products
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Garante que cada empresa vê apenas seus produtos
-- Aplicado automaticamente em todas as queries
```

### Firebase (manual)
```typescript
// Todos os documentos ficam em /tenants/{tenantId}/products/{productId}
// Verificação manual em todas as regras e functions
// Mais fácil de errar, mais difícil de auditar
```

**Vantagem clara do Supabase:** RLS garante isolamento no nível do banco, não apenas no código.

---

## Análise de pgvector para AI Pipeline

O Supabase inclui `pgvector` nativo, que será necessário na Fase 8 para:
- Embeddings de produtos para recomendação semântica
- Busca por similaridade de imagens
- Clustering de catálogo

Com Firebase, isso exigiria um serviço externo (Pinecone, Weaviate, etc.).

---

## Decisão Recomendada

**Supabase** como backend principal do MVP.

### Justificativa
1. PostgreSQL nativo com RLS resolve multi-tenancy de forma robusta e auditável
2. Auth, Storage e Realtime integrados eliminam necessidade de serviços adicionais
3. pgvector prepara o terreno para a Fase 8 sem infraestrutura adicional
4. Exportabilidade: o schema PostgreSQL pode ser migrado para servidor dedicado sem reescrever código
5. Custo inicial previsível e baixo para MVP

### Mitigação do lock-in
- Usar Drizzle ORM (não Supabase client diretamente) para queries de banco
- Encapsular Storage atrás de interface `StorageAdapter`
- Encapsular Auth atrás de interface `AuthAdapter`
- Dessa forma, trocar de Supabase para PostgreSQL dedicado é uma questão de trocar os adapters

---

## Schema de Multi-Tenancy

```sql
-- Abordagem: shared schema com RLS
-- Mais simples, mais econômico, suficiente para MVP

CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free',
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Toda tabela de conteúdo tem tenant_id com RLS
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  -- ...
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_products" ON products
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

## Alternativa para Escalabilidade Futura

Se o número de tenants crescer além de 10.000 ativos ou se houver requisito de isolamento de dados por contrato, migrar para **schema-per-tenant**:

```sql
CREATE SCHEMA tenant_abc123;
CREATE TABLE tenant_abc123.products (...);
```

Essa migração é possível sem mudança de API pública se os adapters estiverem bem encapsulados.

---

## Consequências

- **Positivas:** MVP em semanas, não meses. RLS robusto. pgvector pronto.
- **Negativas:** Dependência de Supabase. Se eles mudarem preços, é necessário migrar.
- **Mitigação:** Adapters desacoplam o código. Schema PostgreSQL é exportável.

---

## ⚠️ Pendência de Aprovação

Esta decisão requer aprovação antes de iniciar implementação. Questões para o responsável técnico:

1. Há restrição de orçamento que impeça o plano Pro do Supabase ($25/mês)?
2. Há preferência por Firebase por familiaridade com o projeto de copos?
3. Há requisito de dados on-premise ou em cloud específica?

**Prazo para decisão:** Antes do início da Fase 1.
