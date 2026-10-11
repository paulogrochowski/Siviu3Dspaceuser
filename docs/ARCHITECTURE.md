# ARCHITECTURE — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29  
**Status:** Aprovado para Fase 0

---

## 1. Princípio Central

O Siviu3D é construído por **tipos de experiência**, não por produtos. A lógica não conhece "sofá" ou "piso" — ela conhece `OBJECT_PLACEMENT` e `SURFACE_REPLACEMENT`. Isso garante que qualquer novo produto ou categoria se encaixa na plataforma sem mudanças de infraestrutura.

---

## 2. Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    APLICAÇÕES                           │
│   apps/web  │  apps/admin  │  apps/studio  │  SDK      │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
┌──────────────────────▼──────────────────────────────────┐
│                  ENGINES DE DOMÍNIO                     │
│  Spatial │ Scene │ Product │ Surface │ Measurement      │
│  Pricing │ Project │ Commerce │ Configuration           │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
┌──────────────────────▼──────────────────────────────────┐
│               INFRAESTRUTURA COMPARTILHADA              │
│   schemas/  │  database/  │  ui/  │  observability/    │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
┌──────────────────────▼──────────────────────────────────┐
│                 SERVIÇOS EXTERNOS                       │
│  Supabase │ Storage │ AI APIs │ Payment │ CDN           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Módulos — Detalhamento

### A. Spatial Engine (`packages/spatial-core`)

Responsável por toda a inteligência espacial do sistema. Abstrai o hardware de AR (câmera, sensores, profundidade) e expõe APIs agnósticas ao ambiente de execução.

```typescript
interface SpatialEngine {
  // Detecção de superfícies
  detectPlanes(): Promise<SpatialPlane[]>
  detectWalls(): Promise<SpatialPlane[]>
  
  // Âncoras
  createAnchor(pose: Pose): Promise<SpatialAnchor>
  updateAnchor(anchorId: string, pose: Pose): Promise<void>
  
  // Estimativa de iluminação
  getLightEstimate(): Promise<LightEstimate>
  
  // Escala real
  getRealWorldScale(): number
  
  // Rastreamento
  getTrackingState(): 'limited' | 'normal' | 'not-available'
}
```

**Implementações:**
- `WebXRSpatialEngine` — usa WebXR Device API
- `SceneViewerAdapter` — Android via intent para Scene Viewer
- `QuickLookAdapter` — iOS via anchor tag `rel="ar"`
- `FallbackSpatialEngine` — sem AR, apenas 3D com controle de câmera

---

### B. Scene Engine (`packages/scene-engine`)

Gerencia o grafo de cena 3D. Completamente desacoplado do Three.js — a engine manipula um modelo de dados de cena; o renderer (Three.js) consome esse modelo.

```typescript
interface SceneState {
  objects: SceneObject[]
  selectedObjectId: string | null
  camera: CameraState
  lights: LightState[]
  history: SceneOperation[] // para undo/redo
}

interface SceneObject {
  id: string
  type: ExperienceType
  assetUrl: string
  pose: Pose // posição + rotação + escala
  variantId?: string
  materialOverrides?: MaterialOverride[]
  locked: boolean
  visible: boolean
}
```

**Operações com undo/redo:**
- `addObject`, `removeObject`, `moveObject`, `rotateObject`, `scaleObject`
- `applyMaterial`, `applyVariant`
- `addSurface`, `removeSurface`, `changeSurfaceMaterial`

---

### C. Product Engine (`packages/product-engine`)

Catálogo de produtos com dimensões reais, modelos 3D e regras de instalação. Segue o schema `SpatialProduct`.

```typescript
type SpatialProduct = {
  id: string
  tenantId: string
  name: string
  slug: string
  category: ProductCategory
  experienceType: ExperienceType
  
  asset: ProductAsset    // GLB, USDZ, thumbnail, LODs
  dimensions: Dimensions // em mm para precisão
  placement: PlacementRules
  variants: ProductVariant[]
  materials: MaterialVariant[]
  configurationSchema: ConfigurationSchema // schema Zod
  pricingRules: PricingRules
  installationRules: InstallationRules
  
  status: 'draft' | 'active' | 'archived'
  publishedAt?: Date
  metadata: ProductMetadata
}
```

---

### D. Surface Engine (`packages/surface-engine`)

Aplicação de materiais em superfícies detectadas (pisos, paredes, teto).

**Fluxo de aplicação de piso:**
1. Usuário toca na área de piso na câmera
2. Spatial Engine fornece plano detectado + bounds
3. Surface Engine cria `SurfaceMesh` com UV mapeado para escala real
4. Material é aplicado com `repeat` calculado por `(dimensão_real / dimensão_textura)`
5. Borders são recortados ao plano detectado

```typescript
interface SurfaceMesh {
  id: string
  surfaceType: 'floor' | 'wall' | 'ceiling'
  bounds: Polygon3D
  material: SurfaceMaterial
  textureScale: { u: number; v: number } // escala física real
  area: number // m²
  rotation: number // rotação da textura em graus
}
```

---

### E. Measurement Engine (`packages/measurement-engine`)

Sistema de medição espacial com múltiplos modos.

```typescript
type MeasurementMode = 
  | 'distance'    // ponto a ponto
  | 'area'        // polígono fechado
  | 'perimeter'   // perímetro do polígono
  | 'height'      // altura vertical
  | 'clearance'   // folga entre objeto e superfície/parede
  | 'fit-check'   // verifica se produto cabe no espaço

interface Measurement {
  id: string
  mode: MeasurementMode
  points: Point3D[]
  result: {
    value: number
    unit: 'mm' | 'cm' | 'm' | 'm²' | 'm³'
    formatted: string // "1,20 m"
  }
  label?: string
}
```

---

### F. Pricing Engine (`packages/pricing-engine`)

Calcula orçamento em tempo real conforme o usuário configura o projeto.

```typescript
interface QuoteCalculator {
  calculate(input: QuoteInput): QuoteResult
}

interface QuoteInput {
  products: Array<{
    productId: string
    variantId?: string
    quantity: number
    area?: number // m² para superfícies
    length?: number // ml para molduras, rodapés
  }>
  tenantId: string
  postalCode?: string // para frete
}

interface QuoteResult {
  items: QuoteItem[]
  subtotal: number
  freight?: number
  installation?: number
  taxes: number
  total: number
  currency: 'BRL'
  validUntil: Date
  warnings: string[] // ex: "preço sujeito a alteração"
}
```

---

### G. AR Adapters (`packages/ar-adapters`)

Abstração que normaliza as diferenças entre plataformas de AR.

```
Detecção de plataforma:
if (navigator.xr && await navigator.xr.isSessionSupported('immersive-ar'))
  → WebXRAdapter
else if (isAndroid)
  → SceneViewerAdapter (intent: intent://arvr.google.com/scene-viewer/1.0?...)
else if (isIOS)
  → QuickLookAdapter (<a href="model.usdz" rel="ar">)
else
  → FallbackAdapter (viewer 3D com OrbitControls)
```

---

### H. Integration SDK (`packages/sdk`)

Web component incorporável para qualquer loja ou site.

```html
<!-- Uso básico -->
<siviu3d-viewer
  product-id="prod_abc123"
  tenant-id="loja_xyz"
  api-key="pk_live_..."
  theme="light"
  on-add-to-cart="handleAddToCart"
/>
```

---

## 4. Padrão de Isolamento

```
packages/
  [engine]/
    src/
      domain/      # tipos, entidades, regras de negócio puras
      ports/       # interfaces para serviços externos
      adapters/    # implementações concretas
      __tests__/   # testes unitários
    index.ts       # API pública do package
```

Cada engine **não importa** de outra engine diretamente. Comunicação via events ou state management (Zustand) na camada de aplicação.

---

## 5. Decisão de Estrutura — Monorepo

Para o MVP, a estrutura de monorepo já está criada (`apps/`, `packages/`, `services/`) mas inicialmente será executada como uma única app Next.js em `apps/web`. Os packages serão pastas locais importadas via path aliases até que a maturidade justifique publicação.

**Vantagem:** Separa lógica de domínio desde o início sem overhead de publicação npm.  
**Risco mitigado:** Não há lock-in — quando necessário, cada package pode se tornar um npm workspace independente.

Ver detalhes em [ADR-001](ADR-001-PROJECT-STRUCTURE.md).

---

## 6. Multi-Tenancy

O `tenantId` percorre **todas as camadas**:

```
Request HTTP → Middleware (extrai tenant do JWT ou subdomínio)
  → API Route (valida tenant)
    → Service (filtra por tenantId)
      → Database (Row-Level Security no Supabase)
        → Storage (bucket por tenant)
```

Nenhum dado de um tenant é acessível a outro em nenhuma camada.

---

## 7. Requisitos Não-Funcionais

| Requisito | Meta |
|---|---|
| FPS em AR | ≥ 30 FPS em dispositivo médio (iPhone 12, Snapdragon 865) |
| Carregamento do viewer | < 3s até primeiro frame (3G otimizado) |
| Tamanho do bundle inicial | < 250 KB gzipped |
| Modelo 3D max | < 5 MB por objeto (após compressão Draco/Meshopt) |
| Textura max | < 2 MB por textura (KTX2 comprimido) |
| Disponibilidade | 99,5% (SLA SaaS básico) |
| LGPD | Consentimento explícito antes de acesso à câmera |
