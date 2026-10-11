# SECURITY — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29  
**Responsável:** Especialista em Segurança + CTO

---

## 1. Princípios

1. **Segurança por design** — decisões de segurança são tomadas na arquitetura, não adicionadas depois
2. **Defesa em profundidade** — múltiplas camadas de controle
3. **Menor privilégio** — cada componente acessa apenas o que precisa
4. **Falha segura** — em caso de erro, negar acesso
5. **Auditabilidade** — toda ação relevante deve ser rastreável

---

## 2. Autenticação e Sessão

### Decisões
- **Provider:** Supabase Auth (ou Firebase Auth)
- **Métodos:** Email/senha + Magic Link (para clientes finais)
- **JWT:** Curto prazo (1h) + Refresh Token (30 dias, rotativo)
- **HTTPS:** Obrigatório em todos os ambientes (incluindo staging)
- **Cookies:** `HttpOnly`, `Secure`, `SameSite=Strict`

### Regras
- Senhas: mínimo 10 caracteres, sem limite máximo, hash bcrypt (Supabase cuida)
- Não armazenar tokens em `localStorage` — usar cookies httponly
- Rate limit no login: máximo 5 tentativas em 5 minutos por IP
- Logout revoga o refresh token no servidor

---

## 3. Autorização e Multi-Tenancy

### Isolamento de Dados

**Camada de banco (Supabase RLS):**
```sql
-- Exemplo: nenhum produto de outro tenant é visível
CREATE POLICY "tenant_isolation_products" ON products
  FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

**Camada de API:**
- Middleware extrai `tenantId` do JWT em CADA request
- Nunca aceitar `tenantId` do body ou query string — sempre do JWT
- Validar que o recurso acessado pertence ao tenant do JWT

**Camada de Storage:**
- Buckets organizados por tenant: `/{tenantId}/...`
- Políticas de Storage: apenas o próprio tenant pode ler/escrever seus arquivos
- URLs assinadas com expiração para acesso a assets privados

### Papéis e Permissões

```typescript
// Permissões por papel
const permissions: Record<MembershipRole, string[]> = {
  owner: ['*'],                                    // tudo
  admin: ['products.*', 'users.*', 'orders.*'],    // tudo exceto billing
  editor: ['products.read', 'products.write', 'projects.read'],
  viewer: ['products.read', 'projects.read'],
}
```

---

## 4. Upload de Arquivos

### Validações obrigatórias antes de aceitar qualquer upload

```typescript
// services/asset-processor/src/validate.ts

const ALLOWED_MIME_TYPES = {
  model: ['model/gltf-binary', 'model/gltf+json'],
  image: ['image/png', 'image/jpeg', 'image/webp'],
  texture: ['image/png', 'image/jpeg'],
}

const MAX_FILE_SIZES = {
  glb: 50 * 1024 * 1024,    // 50 MB antes de otimização
  image: 10 * 1024 * 1024,  // 10 MB
  texture: 10 * 1024 * 1024,
}

async function validateUpload(file: File): Promise<ValidationResult> {
  // 1. Verificar tamanho
  if (file.size > MAX_FILE_SIZES[detectType(file)]) {
    return { valid: false, reason: 'FILE_TOO_LARGE' }
  }
  
  // 2. Verificar magic bytes (não apenas extensão)
  const magic = await readMagicBytes(file)
  if (!isValidMagic(magic, file.type)) {
    return { valid: false, reason: 'INVALID_FILE_TYPE' }
  }
  
  // 3. Para GLB: parsear estrutura básica do GLTF
  if (file.type === 'model/gltf-binary') {
    const valid = await validateGLBStructure(file)
    if (!valid) return { valid: false, reason: 'INVALID_GLB' }
  }
  
  return { valid: true }
}
```

### Varredura de malware
- Para MVP: validação de magic bytes e estrutura
- Fase 2+: integrar com VirusTotal API ou similar para arquivos > 5 MB
- Nunca executar conteúdo de upload no servidor de aplicação

---

## 5. Segurança de API

### Rate Limiting
```
Endpoints públicos: 100 req/min por IP
Endpoints autenticados: 1000 req/min por usuário
Upload de arquivo: 10 req/min por usuário
Geração de orçamento: 50 req/min por tenant
```

### Headers de segurança obrigatórios (Next.js)
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=self, microphone=(), geolocation=self' },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://*.supabase.co;
      media-src 'self' blob:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      worker-src 'self' blob:;
    `.replace(/\s+/g, ' ')
  },
]
```

### Proteção de chaves
- **NUNCA** expor chaves de serviço (service role) no cliente
- Supabase: `SUPABASE_ANON_KEY` no cliente (limitada por RLS), `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor
- Todas as variáveis de ambiente de servidor prefixadas sem `NEXT_PUBLIC_`
- Auditoria de `.env` no CI para garantir que chaves privadas não vazam

---

## 6. Câmera e Privacidade

### Consentimento (LGPD)
Antes de qualquer acesso à câmera:

```typescript
// Consentimento explícito antes de pedir permissão do browser
function requestCameraAccess(): Promise<MediaStream> {
  // Exibir modal com:
  // - Para que serve (visualizar produtos no ambiente)
  // - O que NÃO fazemos (não gravamos, não enviamos imagens sem ação)
  // - Link para política de privacidade
  // - Botões: "Entendi, continuar" e "Cancelar"
  
  return showConsentModal()
    .then(() => navigator.mediaDevices.getUserMedia({ video: true }))
}
```

### O que nunca fazemos com a câmera
- Não gravar vídeo sem ação explícita do usuário
- Não enviar frames da câmera para nossos servidores sem consentimento explícito
- Não guardar imagens sem ação de "salvar" do usuário
- Não usar reconhecimento facial

### Screenshots e imagens salvas
- Imagem salva permanece com o usuário (LocalStorage no MVP)
- Na nuvem (Fase 5+): imagem associada ao projeto do usuário, isolada por tenant
- Usuário pode deletar qualquer imagem a qualquer momento
- Direito de exclusão de dados garantido (ver Seção 9)

---

## 7. Segurança de SDK

Para o SDK incorporável (Fase 7):

- `api-key` no cliente é uma **publish key** de escopo limitado (apenas leitura de catálogo)
- Nunca expor chaves de escrita ou admin no SDK
- CORS configurado para permitir apenas os domínios registrados pelo tenant
- Eventos de analytics são enviados identificando apenas o tenant, sem dados de PII do usuário final

---

## 8. Auditoria e Logs

### Eventos auditados obrigatoriamente

| Evento | Dados registrados |
|---|---|
| Login/logout | userId, IP, timestamp, sucesso/falha |
| Upload de arquivo | tenantId, userId, fileName, fileSize, resultado |
| Criação/edição de produto | tenantId, userId, productId, campos alterados |
| Geração de orçamento | tenantId, projectId, valor |
| Compartilhamento de projeto | tenantId, projectId, userId, token gerado |
| Acesso a projeto compartilhado | shareToken, IP, timestamp |
| Exclusão de dados | userId, tipo de dado, timestamp |

### Retenção de logs
- Logs de auditoria: 2 anos (compliance LGPD)
- Logs de acesso (nginx/vercel): 90 dias
- Logs de erro: 30 dias
- Eventos de analytics: 13 meses

---

## 9. LGPD — Direitos do Titular

O sistema DEVE implementar:

| Direito | Implementação |
|---|---|
| Acesso | Endpoint `GET /api/me/data` retorna todos os dados do usuário |
| Correção | Perfil editável em qualquer momento |
| Exclusão | Endpoint `DELETE /api/me` — soft delete, anonimização em 30 dias, exclusão em 90 dias |
| Portabilidade | Endpoint `GET /api/me/export` retorna JSON/ZIP com todos os projetos |
| Consentimento para câmera | Modal explícito antes de qualquer uso |
| Revogação de consentimento | Configurações da conta → Privacidade → Revogar acesso à câmera |

### Dados não coletados sem consentimento explícito
- Imagens da câmera
- Localização GPS
- Dados biométricos

---

## 10. Dependências e Supply Chain

- Auditar dependências npm regularmente: `pnpm audit`
- Usar `pnpm audit --audit-level=high` no CI — falhar build em vulnerabilidades altas/críticas
- Dependências com `*` ou `latest` são proibidas — sempre versões fixadas
- Revisar `package.json` de novos packages antes de instalar
- Não instalar packages de autores desconhecidos sem avaliação

---

## 11. Plano de Resposta a Incidentes

**Nível 1 — Baixo** (ex: spam de usuário)
- Responsável: Eng. disponível
- Tempo de resposta: 24h
- Ação: Bloquear conta, investigar logs

**Nível 2 — Médio** (ex: tentativa de acesso a dados de outro tenant)
- Responsável: CTO
- Tempo de resposta: 4h
- Ação: Isolar tenant, investigar, corrigir, notificar tenant afetado

**Nível 3 — Alto** (ex: vazamento de dados confirmado)
- Responsável: CTO + Jurídico
- Tempo de resposta: 1h
- Ação: Desligar serviço afetado, notificar ANPD em até 72h (LGPD Art. 48), notificar titulares afetados, post-mortem público em 7 dias

---

## 12. Checklist de Segurança por Fase

### Fase 1 (obrigatório antes de lançar)
- [ ] HTTPS em todos os ambientes
- [ ] RLS configurado e testado para multi-tenancy
- [ ] Rate limiting em APIs de autenticação
- [ ] Headers de segurança configurados
- [ ] Variáveis de ambiente auditadas
- [ ] .gitignore com .env* e secrets

### MVP (antes de abrir para usuários externos)
- [ ] Validação de upload com magic bytes
- [ ] Consentimento de câmera com modal
- [ ] Política de privacidade publicada
- [ ] LGPD: exclusão de dados funcionando
- [ ] Auditoria de dependências no CI
- [ ] Testes de penetração básico (OWASP Top 10)
