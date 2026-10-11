# ADR-003 — Engine 3D e Renderização

**Data:** 2026-07-29  
**Status:** Aceito  
**Decisores:** Engenheiro de Computação Gráfica, Especialista em Three.js

---

## Contexto

O Siviu3D exige renderização 3D de alta qualidade com:
- Carregamento eficiente de modelos GLB/GLTF
- Materiais PBR (Physically Based Rendering)
- Iluminação dinâmica com estimativa do ambiente real
- Performance em dispositivos móveis de baixo a médio custo
- Integração com WebXR para AR
- Suporte a LOD, instancing e outros mecanismos de otimização

---

## Decisão: Three.js 0.174.0 + React Three Fiber 9.0.4

**Rationale:**
1. Three.js é o padrão da indústria para 3D web — ecossistema maduro
2. React Three Fiber elimina boilerplate de lifecycle do Three.js no contexto React
3. Drei oferece primitivas de alto nível (controles, ambiente, sombras) prontas
4. Versões fixadas já validadas no projeto predecessor (sem surpresas de breaking changes)

---

## Formatos 3D

### Principal: GLB (GLTF binário)

**Por quê:**
- Único arquivo, sem dependências externas
- Suporte a Draco e Meshopt para compressão
- PBR materials nativos
- Animações, morphs, extras
- Suportado por Scene Viewer (Android) e convertível para USDZ (iOS)

### Para iOS AR: USDZ

**Por quê:**
- Único formato suportado pelo Quick Look do iOS
- Convertido do GLB no servidor via `asset-processor/`
- Não aceitar USDZ diretamente de fornecedores — converter para GLB primeiro e gerar USDZ derivado

### Descartados:
- OBJ: sem materiais PBR, sem compressão, arquivos separados
- FBX: proprietário, parsing pesado, sem suporte nativo no browser
- DAE (Collada): verboso, raramente otimizado para web
- STL: sem materiais, apenas geometria

---

## Estratégia de Compressão

### Geometria
```
Pipeline de upload de GLB:
1. Receber GLB do fornecedor
2. Otimizar com gltf-transform:
   - meshopt-compress: melhor compressão geral
   - draco-compress: fallback, mais compatível
3. Gerar LODs: níveis 0 (original), 1 (50% triângulos), 2 (25%)
4. Armazenar no bucket: model-lod0.glb, model-lod1.glb, model-lod2.glb
```

### Texturas
```
1. Receber PNG/JPG
2. Converter para KTX2 com Basis Universal
3. Browser escolhe automaticamente o formato suportado (ASTC, ETC1, BC7, etc.)
```

**Orçamentos:**
| Asset | Máximo recomendado | Máximo absoluto |
|---|---|---|
| Modelo principal (LOD0) | 2 MB | 5 MB |
| Modelo médio (LOD1) | 800 KB | 2 MB |
| Modelo distante (LOD2) | 200 KB | 500 KB |
| Textura por material | 512 KB | 2 MB |

---

## Sistema de LOD

```typescript
// Pseudocódigo de seleção de LOD
function selectLOD(
  distanceFromCamera: number,
  devicePerformanceTier: 'low' | 'medium' | 'high'
): 0 | 1 | 2 {
  const thresholds = {
    low:    [0, 3, 999],  // LOD2 já a partir de 3m
    medium: [0, 5, 15],
    high:   [0, 8, 25],
  }
  const [t0, t1] = thresholds[devicePerformanceTier]
  if (distanceFromCamera < t0) return 0
  if (distanceFromCamera < t1) return 1
  return 2
}
```

---

## Iluminação

### Estratégia para 3D estático (Viewer)
- `Environment` do Drei com preset `city` ou `apartment`
- `AmbientLight` + 1-2 `DirectionalLight`
- `ContactShadows` no chão (não projetadas em tempo real)
- Máximo de 2 shadow maps simultâneos

### Estratégia para AR
- `XRLightEstimate` do WebXR para ajuste de iluminação ao ambiente real
- `PMREMGenerator` para atualizar o environment map dinamicamente
- Fallback: iluminação estática média se estimativa não disponível

---

## Sombras

**Decisão:** Usar `ContactShadows` (fake shadows) por padrão, não shadow maps em tempo real.

**Por quê:**
- Shadow maps em tempo real são caros em GPU mobile
- `ContactShadows` são calculadas offline e parecem convincentes
- Ativar shadow maps reais apenas para renders estáticos (exportação de imagem)

---

## Arquitetura de Renderização no R3F

```typescript
// apps/web/src/components/viewer/SpatialViewer.tsx
export function SpatialViewer({ experienceType }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}              // limita pixel ratio em mobile
      performance={{ min: 0.5 }} // reduz resolução se FPS cair
      shadows="soft"             // apenas quando necessário
      camera={getCameraConfig(experienceType)}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent />
        <Environment preset="apartment" environmentIntensity={0.8} />
        <PerformanceMonitor />
      </Suspense>
    </Canvas>
  )
}
```

---

## Descarte de Memória

**Problema crítico em mobile:** Three.js não faz garbage collection automático de geometrias, materiais e texturas. Vazamentos de memória causam crash em iOS/Android.

**Regra obrigatória:**
```typescript
// Todo componente que cria recursos Three.js DEVE fazer dispose
useEffect(() => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial()
  
  return () => {
    geometry.dispose()
    material.dispose()
    // textures também!
    material.map?.dispose()
  }
}, [])
```

**Automação:** Usar `useGLTF.clear(url)` ao desmontar objetos do catálogo para liberar cache de modelos não mais visíveis.

---

## Performance em Mobile

### Orçamento de GPU
- Máximo de 100.000 triângulos visíveis simultaneamente
- Máximo de 10 draw calls por frame (usar instancing)
- Máximo de 4 texturas distintas por material
- FPS target: 30 FPS mínimo em iPhone 12 / Snapdragon 865

### Medição
- `r3f-perf` em desenvolvimento para monitorar FPS, GPU time, memory
- Relatório automático via Analytics em produção se FPS < 20 por mais de 3s

---

## Consequências

- **Positivas:** Stack validada, documentação abundante, grandes chances de atingir metas de FPS
- **Negativas:** Three.js tem API de baixo nível que exige atenção manual ao lifecycle de recursos
- **Mitigação:** Utilities compartilhadas no `scene-engine` para encapsular dispose, LOD, instancing
