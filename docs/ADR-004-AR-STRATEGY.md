# ADR-004 — Estratégia de Realidade Aumentada

**Data:** 2026-07-29  
**Status:** Aceito  
**Decisores:** Especialista em WebXR/ARCore/ARKit, CTO

---

## Contexto

O diferencial central do Siviu3D é o posicionamento de objetos 3D em ambientes reais com **escala real e ancoragem estável** — o usuário move a câmera e o objeto permanece na posição correta, como em Pokémon GO.

Existem múltiplas tecnologias de AR disponíveis em 2026, cada uma com trade-offs diferentes.

---

## Análise das Opções

### 1. WebXR (Hit Test + Anchors API)

**O que é:** API do browser para AR e VR sem necessidade de app nativo.

**Prós:**
- Funciona no browser — sem instalação de app
- Suporte crescente: Chrome Android (desde Chrome 81), Safari (desde iOS 13 com flags, Safari 16.4 sem flags)
- `XRHitTestSource` para detecção de superfícies
- `XRAnchor` para ancoragem estável
- `XRLightEstimate` para ajuste de iluminação

**Contras:**
- Requer HTTPS obrigatoriamente
- Suporte inconsistente no iOS Safari (ainda limitado em 2026)
- Qualidade de tracking inferior ao ARCore/ARKit nativos
- Não disponível em todos os browsers Android

**Casos de uso:** Melhor para Android Chrome. Experiência boa para objetos grandes (sofá, piscina).

---

### 2. Google Scene Viewer (Android)

**O que é:** Aplicativo Android nativo do Google para AR, acessado via deep link/intent.

```
intent://arvr.google.com/scene-viewer/1.0
  ?file=https://storage.siviu3d.com/{tenantId}/products/{id}/model.glb
  &mode=ar_preferred
  &title=Sofá Nordic
  &link=https://siviu3d.com/products/{id}
  #Intent;scheme=https;
  package=com.google.android.googlequicksearchbox;
  action=android.intent.action.VIEW;
  S.browser_fallback_url=https://siviu3d.com/viewer/{id};
  end;
```

**Prós:**
- Melhor qualidade de AR disponível no Android (usa ARCore nativo)
- Zero configuração — Google mantém o app
- Detecção de piso robusta com SLAM
- Sombras em tempo real
- Botão "Ver no seu ambiente" nativo

**Contras:**
- Sem customização de UI
- Usuário sai do contexto do app (volta após fechar)
- Sem acesso a eventos (clique no objeto, mudança de material)
- Não funciona em iOS

**Casos de uso:** Visualização simples de um único produto no Android. Excelente para o MVP.

---

### 3. Apple Quick Look (iOS)

**O que é:** Visualizador AR nativo do iOS, ativado por link simples.

```html
<a href="https://storage.siviu3d.com/{tenantId}/products/{id}/model.usdz" 
   rel="ar"
   download="product.usdz">
  <img src="thumbnail.webp" alt="Ver em AR" />
</a>
```

**Prós:**
- Melhor qualidade de AR disponível no iOS (usa ARKit nativo)
- Zero instalação — integrado ao iOS
- Suporte a variantes de produto via Reality Composer (futuro)

**Contras:**
- Requer USDZ (conversão do GLB no servidor)
- Sem customização de UI
- Usuário sai do contexto do app
- Sem eventos de interação

**Casos de uso:** Visualização de produto único no iOS. Excelente para MVP.

---

### 4. App Nativo (React Native + Expo + ViroReact ou Three.js-react-native)

**Prós:** Melhor experiência possível, acesso total ao ARCore/ARKit
**Contras:** 
- 3-6 meses de desenvolvimento adicional
- Manutenção de dois codebases
- App store review cycle

**Decisão para MVP:** **NÃO implementar.** Planejado para Fase 9 (2027+).

---

## Decisão: Estratégia em Camadas

```
Detecção automática de plataforma:

iOS Safari
  → Exibir botão "Ver com AR" → link rel="ar" → Quick Look → USDZ

Android Chrome (com ARCore)
  → Exibir botão "Ver em AR" → Scene Viewer intent → GLB

Qualquer browser (desktop ou mobile sem AR nativo)
  → Exibir botão "Ver em 3D" → Viewer interno com OrbitControls

Android Chrome (com WebXR disponível)
  → Exibir botão "Ver com AR no navegador" → WebXR in-browser AR
  → Prioridade MENOR que Scene Viewer para MVP (Scene Viewer é mais estável)
```

---

## Algoritmo de Detecção

```typescript
// packages/ar-adapters/src/detector.ts

export async function detectARCapability(): Promise<ARCapability> {
  // iOS com Safari
  if (isIOS() && isSafari()) {
    return { type: 'quick-look', format: 'usdz' }
  }
  
  // Android com Scene Viewer disponível
  if (isAndroid() && hasSceneViewerSupport()) {
    return { type: 'scene-viewer', format: 'glb' }
  }
  
  // WebXR como fallback em qualquer browser que suporte
  if (typeof navigator.xr !== 'undefined') {
    const supported = await navigator.xr.isSessionSupported('immersive-ar')
    if (supported) {
      return { type: 'webxr', format: 'glb' }
    }
  }
  
  // Fallback: viewer 3D sem AR
  return { type: '3d-only', format: 'glb' }
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

async function hasSceneViewerSupport(): Promise<boolean> {
  // Scene Viewer disponível em Android com Google Play Services
  // Verificado via tentativa de deep link com fallback
  return isAndroid() // simplificado para MVP
}
```

---

## Fluxo de Experiência AR para Objeto

```
1. Usuário abre produto no Siviu3D
2. Visualiza em 3D com OrbitControls (sempre disponível)
3. Toca no botão "Ver no meu ambiente"
4. Sistema detecta plataforma automaticamente
5. Android:
   a. Redirect para Scene Viewer com GLB URL
   b. Usuário vê o objeto em AR no ambiente real
   c. Scene Viewer fecha → usuário volta ao Siviu3D
6. iOS:
   a. Botão tem rel="ar" e href para USDZ
   b. iOS abre Quick Look automaticamente
   c. Quick Look fecha → usuário volta ao Siviu3D
7. Desktop/sem suporte:
   a. Exibe mensagem "AR disponível apenas em mobile"
   b. Sugere compartilhar o link para abrir no celular
```

---

## Fluxo WebXR In-Browser (Fase 3)

Para a experiência in-browser com WebXR:

```
1. Usuário toca "Ver com AR" em Chrome Android
2. Browser solicita permissão de câmera
3. Canvas passa para modo XR (tela cheia)
4. Hit test detecta superfícies em tempo real
5. Reticule aparece no piso detectado
6. Usuário toca → objeto é ancorado no piso
7. Usuário pode mover câmera → objeto permanece ancorado
8. Botões flutuantes: mudar cor, rotacionar, salvar
9. Usuário sai do modo AR → retorna ao viewer normal
```

---

## Preparação para App Nativo (Futuro)

O código dos AR Adapters já usa interfaces abstratas que permitirão criar uma implementação nativa:

```typescript
interface ARAdapter {
  launch(product: SpatialProduct, options: AROptions): Promise<ARSession>
  isSupported(): Promise<boolean>
}

// Implementações:
class QuickLookAdapter implements ARAdapter { ... }
class SceneViewerAdapter implements ARAdapter { ... }
class WebXRAdapter implements ARAdapter { ... }
class ExpoARAdapter implements ARAdapter { ... } // Fase nativa
```

---

## Limitações e Avisos ao Usuário

O sistema DEVE exibir avisos antes de qualquer sessão AR:

> "A visualização em realidade aumentada usa a câmera do seu dispositivo para posicionar o produto no ambiente. A escala é aproximada — para projetos de instalação, confirme as medidas com um profissional."

Para produtos estruturais (piscina, pergolado, telhado):

> "Interferências subterrâneas, afastamentos de divisa e legislação local não podem ser verificados pelo aplicativo. Consulte um engenheiro ou arquiteto antes de iniciar a obra."

---

## Consequências

- **Positivas:** Máxima compatibilidade com mínimo de desenvolvimento no MVP
- **Negativas:** Experiência varia entre plataformas (Scene Viewer no Android é melhor que WebXR)
- **Mitigação:** Comunicar claramente a diferença. Priorizar Android Chrome para demos iniciais.
