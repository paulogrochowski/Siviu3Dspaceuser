# DOMAIN-MODEL — Siviu3D

**Versão:** 1.0  
**Data:** 2026-07-29

---

## 1. Modelo de Domínio — Diagrama

```
Tenant (empresa cliente)
│
├── Users (funcionários da empresa)
│   └── Memberships (papel: owner, admin, editor, viewer)
│
├── Customers (clientes finais da empresa)
│   └── Projects (projetos do cliente)
│       ├── Environments (cômodos/espaços)
│       │   └── Scenes (estados da cena)
│       │       ├── SceneObjects (objetos posicionados)
│       │       └── Surfaces (superfícies modificadas)
│       ├── Measurements (medições realizadas)
│       ├── Quotes (orçamentos gerados)
│       │   └── QuoteItems (itens do orçamento)
│       └── Renders (imagens exportadas)
│
├── Products (catálogo da empresa)
│   ├── ProductVariants (variações: cor, tamanho)
│   ├── Materials (materiais/acabamentos)
│   └── Assets (arquivos 3D, texturas)
│
├── Suppliers (fornecedores vinculados)
│   └── Professionals (profissionais vinculados)
│
└── Orders (pedidos realizados)
    └── OrderItems (itens do pedido)
```

---

## 2. Entidades Principais

### Tenant
Representa uma empresa cliente do Siviu3D (B2B).

```typescript
type Tenant = {
  id: string                    // UUID
  slug: string                  // ex: "piso-sul" para piso-sul.siviu3d.com
  name: string                  // Nome da empresa
  plan: TenantPlan              // 'free' | 'starter' | 'pro' | 'enterprise'
  settings: TenantSettings      // logo, cores, domínio customizado
  billingEmail: string
  trialEndsAt?: Date
  createdAt: Date
  updatedAt: Date
}

type TenantSettings = {
  logoUrl?: string
  primaryColor?: string         // hex
  customDomain?: string         // ex: "loja.pisosul.com.br"
  defaultCurrency: 'BRL'
  defaultUnit: 'mm' | 'cm' | 'm'
  features: string[]            // feature flags por tenant
}
```

---

### User / Membership
Usuário humano com papel em um ou mais tenants.

```typescript
type User = {
  id: string
  email: string
  name: string
  avatarUrl?: string
  emailVerifiedAt?: Date
  createdAt: Date
}

type Membership = {
  id: string
  userId: string
  tenantId: string
  role: MembershipRole
  joinedAt: Date
}

type MembershipRole = 'owner' | 'admin' | 'editor' | 'viewer'
```

---

### SpatialProduct
Produto com capacidade de visualização espacial.

```typescript
type ExperienceType =
  | 'OBJECT_PLACEMENT'      // sofá, piscina, churrasqueira
  | 'SURFACE_REPLACEMENT'   // piso, tinta, revestimento
  | 'STRUCTURAL_ASSEMBLY'   // pergolado, cozinha, telhado
  | 'ENVIRONMENT_COMPOSITION' // projeto completo
  | 'PRODUCT_CUSTOMIZATION' // produto personalizável

type SpatialProduct = {
  id: string
  tenantId: string
  name: string
  slug: string
  description?: string
  category: ProductCategory
  subcategory?: string
  experienceType: ExperienceType
  
  asset: ProductAsset
  dimensions: ProductDimensions
  placement: PlacementRules
  
  variants: ProductVariant[]
  materials: MaterialVariant[]
  
  configurationSchema: ConfigurationSchema  // Zod schema serializado
  pricingRules: PricingRules
  installationRules?: InstallationRules
  
  sku?: string
  barcode?: string
  weight?: number           // kg
  
  status: 'draft' | 'active' | 'archived'
  publishedAt?: Date
  
  seoTitle?: string
  seoDescription?: string
  tags: string[]
  
  metadata: Record<string, string | number | boolean>
  createdAt: Date
  updatedAt: Date
}
```

---

### ProductAsset
Arquivos 3D e mídias do produto.

```typescript
type ProductAsset = {
  glbUrl?: string           // modelo principal (Draco comprimido)
  usdzUrl?: string          // para iOS Quick Look
  thumbnailUrl?: string     // imagem de capa (WebP)
  previewImageUrls: string[] // galeria de fotos reais
  
  lods: AssetLOD[]          // níveis de detalhe
  textures: AssetTexture[]  // texturas KTX2
  
  triangleCount?: number    // do LOD0
  fileSize?: number         // bytes do GLB
  boundingBox?: BoundingBox // tamanho real do modelo
}

type AssetLOD = {
  level: 0 | 1 | 2
  url: string
  triangleCount: number
  fileSize: number
}

type AssetTexture = {
  type: 'diffuse' | 'normal' | 'roughness' | 'metalness' | 'emissive' | 'ao'
  url: string               // KTX2
  resolution: number        // 512, 1024, 2048
}
```

---

### ProductDimensions
Dimensões físicas reais do produto.

```typescript
type ProductDimensions = {
  width: number             // sempre em mm para precisão
  height: number
  depth: number
  unit: 'mm'                // armazenado sempre em mm, exibido conforme preferência
  
  // Para superfícies
  tileWidth?: number        // mm — largura do tile (azulejo 60x60)
  tileHeight?: number       // mm — altura do tile
  
  // Para volumes irregulares
  notes?: string            // ex: "diâmetro máximo: 3500mm"
}
```

---

### PlacementRules
Regras de posicionamento espacial.

```typescript
type SurfaceType = 'floor' | 'wall' | 'ceiling' | 'ground' | 'water' | 'custom'

type PlacementRules = {
  surfaces: SurfaceType[]   // onde pode ser colocado
  allowRotation: boolean
  allowScaling: boolean
  lockRealScale: boolean    // impede distorção da escala real
  requiresAnchor: boolean   // precisa de superfície detectada
  
  minClearance?: number     // folga mínima de paredes (mm)
  requiresLevelSurface?: boolean  // ex: piscina precisa de piso nivelado
  
  installationWarnings: string[]  // avisos exibidos ao usuário
}
```

---

### ProductVariant / MaterialVariant

```typescript
type ProductVariant = {
  id: string
  productId: string
  name: string              // ex: "Azul Navy", "4 Lugares"
  sku?: string
  glbUrl?: string           // override do modelo se a geometria muda
  priceModifier: number     // delta sobre o preço base (pode ser negativo)
  stock?: number
  thumbnailUrl?: string
  attributes: Record<string, string>  // ex: { color: "#1a237e", seats: "4" }
  isDefault: boolean
}

type MaterialVariant = {
  id: string
  productId: string
  name: string              // ex: "Carvalho Natural", "Mármore Branco"
  textureUrls: {
    diffuse?: string
    normal?: string
    roughness?: string
  }
  priceModifier: number
  thumbnailUrl?: string
}
```

---

### Project / Environment / Scene

```typescript
type Project = {
  id: string
  tenantId: string
  customerId?: string
  name: string
  description?: string
  status: 'draft' | 'shared' | 'archived'
  shareToken?: string       // token para link público de compartilhamento
  thumbnailUrl?: string
  environments: Environment[]
  createdAt: Date
  updatedAt: Date
}

type Environment = {
  id: string
  projectId: string
  name: string              // ex: "Sala de Estar", "Quintal"
  type: EnvironmentType
  scenes: Scene[]
  measurements: Measurement[]
}

type EnvironmentType = 
  | 'living-room' | 'bedroom' | 'kitchen' | 'bathroom'
  | 'backyard' | 'facade' | 'garage' | 'other'

type Scene = {
  id: string
  environmentId: string
  name: string              // ex: "Versão com piso claro"
  isActive: boolean
  sceneData: SceneData      // serialização do estado da cena
  thumbnailUrl?: string
  createdAt: Date
}

type SceneData = {
  version: string           // para migrations
  objects: SceneObject[]
  surfaces: SceneSurface[]
  camera: CameraState
  lights: LightState[]
}

type SceneObject = {
  id: string
  productId: string
  variantId?: string
  materialId?: string
  position: Vector3
  rotation: Euler
  scale: Vector3
  locked: boolean
  label?: string
  notes?: string
}

type SceneSurface = {
  id: string
  surfaceType: 'floor' | 'wall' | 'ceiling'
  bounds: Polygon3D
  productId: string         // produto de piso/tinta
  variantId?: string
  textureRotation: number   // graus
  textureScale: number      // multiplicador sobre o padrão
  area: number              // m² calculado
}
```

---

### Measurement

```typescript
type MeasurementMode = 
  | 'distance' | 'area' | 'height' | 'clearance' | 'fit-check'

type Measurement = {
  id: string
  environmentId: string
  mode: MeasurementMode
  points: Vector3[]
  result: MeasurementResult
  label?: string
  createdAt: Date
}

type MeasurementResult = {
  value: number
  unit: 'mm' | 'cm' | 'm' | 'm²' | 'm³'
  formatted: string         // "1,20 m", "14,5 m²"
  isApproximate: boolean    // sempre true para medições AR
}
```

---

### Quote / QuoteItem

```typescript
type Quote = {
  id: string
  projectId: string
  tenantId: string
  status: 'draft' | 'sent' | 'accepted' | 'expired'
  validUntil: Date
  
  items: QuoteItem[]
  
  subtotal: number
  freightEstimate?: number
  installationEstimate?: number
  discountAmount: number
  taxAmount: number
  total: number
  currency: 'BRL'
  
  notes?: string
  termsAndConditions?: string
  
  createdAt: Date
  sentAt?: Date
}

type QuoteItem = {
  id: string
  quoteId: string
  productId: string
  variantId?: string
  materialId?: string
  
  quantity: number
  area?: number             // m² (para pisos e tintas)
  length?: number           // ml (para rodapés, molduras)
  
  unitPrice: number
  totalPrice: number
  
  installationPrice?: number
  freightPrice?: number
  
  notes?: string
}
```

---

### Supplier / Professional

```typescript
type Supplier = {
  id: string
  tenantId: string          // tenant que cadastrou o fornecedor
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: Address
  categories: string[]      // tipos de produto que fornece
  isVerified: boolean
}

type Professional = {
  id: string
  tenantId?: string         // null se autônomo no marketplace
  name: string
  cpf?: string
  specialties: ProfessionalSpecialty[]
  serviceArea: string[]     // CEPs ou cidades atendidas
  rating?: number           // 0-5, calculado
  reviewCount: number
  isAvailable: boolean
  portfolioUrls: string[]
  priceRange?: { min: number; max: number; unit: string }
}

type ProfessionalSpecialty = 
  | 'architect' | 'engineer' | 'mason' | 'installer' 
  | 'pool-builder' | 'carpenter' | 'landscaper' | 'electrician' | 'other'
```

---

### AuditLog
Rastreamento de todas as ações para compliance e debugging.

```typescript
type AuditLog = {
  id: string
  tenantId: string
  userId?: string           // null se ação do sistema
  action: string            // ex: "product.created", "quote.sent"
  resourceType: string      // ex: "Product", "Quote"
  resourceId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}
```

---

## 3. Categorias de Produto

```typescript
type ProductCategory = 
  // Pisos e Revestimentos
  | 'flooring.ceramic'      // piso cerâmico
  | 'flooring.porcelain'    // porcelanato
  | 'flooring.wood'         // madeira / assoalho
  | 'flooring.vinyl'        // vinílico
  | 'flooring.laminate'     // laminado
  | 'flooring.stone'        // pedra natural
  | 'flooring.deck'         // deck de madeira/composite
  | 'flooring.grass'        // grama artificial
  
  // Paredes
  | 'wall.paint'            // tinta
  | 'wall.wallpaper'        // papel de parede
  | 'wall.tile'             // azulejo / revestimento
  | 'wall.panel'            // painel decorativo
  | 'wall.stone-cladding'   // pedra decorativa
  
  // Móveis
  | 'furniture.sofa'
  | 'furniture.table'
  | 'furniture.chair'
  | 'furniture.bed'
  | 'furniture.wardrobe'
  | 'furniture.cabinet'
  | 'furniture.outdoor'     // móveis de área externa
  
  // Área Externa
  | 'outdoor.pool'          // piscina
  | 'outdoor.pergola'       // pergolado
  | 'outdoor.bbq'           // churrasqueira
  | 'outdoor.garden'        // jardim / paisagismo
  | 'outdoor.fence'         // muro / cerca
  
  // Estrutura
  | 'structure.roof'        // telhado
  | 'structure.facade'      // fachada
  | 'structure.door'        // porta
  | 'structure.window'      // janela
  | 'structure.stairs'      // escada
  
  // Iluminação
  | 'lighting.indoor'
  | 'lighting.outdoor'
  | 'lighting.decorative'
  
  // Outros
  | 'kitchen.cabinet'       // armário de cozinha
  | 'bathroom.fixture'      // louça / metais
  | 'other'
```
