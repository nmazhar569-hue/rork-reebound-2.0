# Liquid Glass / VisionOS Spatial UI System

## Overview
This is **NOT** standard glassmorphism (plastic-looking). This is **Spatial Glass** - physical panes of glass floating above backgrounds with true depth, luminance, and physics.

---

## 🎯 Core Visual Physics

### The Material
The UI appears as **physical glass panes floating in 3D space**, not flat stickers.

#### 1. The Blur
- **Strength**: High-intensity Gaussian blur (25-40px equivalent)
- **Effect**: Background colors bleed through softly, not sharply
- **React Native**: `BlurView` with `intensity={80-95}`

#### 2. The Luminance Layer
Glass catches light - it's not just transparent.

**Light Mode:**
```typescript
backgroundColor: 'rgba(255, 255, 255, 0.18-0.6)'
// Layer 1 (Canvas): 0.18
// Layer 2 (Control): 0.4
// Layer 3 (Elevated): 0.6
```

**Dark Mode:**
```typescript
backgroundColor: 'rgba(30, 30, 30, 0.22-0.5)'
// Darker base, similar layering
```

#### 3. The Specular Edge (CRITICAL)
Real glass has a rim that catches light - creates a **3D ridge effect**.

```typescript
// Top/Left edges: Bright (light catches here)
borderTopColor: 'rgba(255, 255, 255, 0.5)'
borderLeftColor: 'rgba(255, 255, 255, 0.4)'

// Bottom/Right edges: Dark (shadow side)
borderBottomColor: 'rgba(0, 0, 0, 0.05)'
borderRightColor: 'rgba(0, 0, 0, 0.08)'
```

---

## 📐 Depth & Hierarchy (Z-Axis)

### Layer System

**Layer 0: Background**
- Deep, vibrant gradients
- Dark or colorful to make glass "pop"
- Example: `['#E3F2FD', '#F3E5F5', '#FFF3E0']`

**Layer 1: Canvas**
- Main app container (e.g., Homescreen background)
- Large glass sheet
- Opacity: `rgba(255, 255, 255, 0.18)`
- Blur: `95`

**Layer 2: Control**
- Buttons, Cards, Interactive elements
- Float above Layer 1
- **Brighter** than Layer 1
- Opacity: `rgba(255, 255, 255, 0.4)`
- Blur: `80`

**Layer 3: Elevated**
- Modals, Floating elements
- Highest Z-index
- **Brightest** material
- Opacity: `rgba(255, 255, 255, 0.6)`
- Blur: `90`

### Rule
> **"The closer to the user (higher Z-index), the lighter/brighter the material."**

---

## ⚡ Interaction Physics

### Hover/Active State
When touched, elements **don't just change color** - they exhibit **physical behaviors**:

#### Lift
```typescript
transform: [{ scale: 1.02 }]  // 2% scale up
```

#### Brighten
```typescript
backgroundColor: rgba(255, 255, 255, 0.5) // +10% opacity
```

#### Shadow Enhancement
```typescript
shadowOpacity: baseOpacity * 1.5
shadowRadius: baseRadius * 1.2
```

### Animation Timing
```typescript
duration: 200ms
easing: cubic-bezier(0.4, 0.0, 0.2, 1)
```

---

## 🌈 Colored Shadows

**DO NOT use black shadows.** Use **colored shadows** derived from the object itself.

### Mode-Aware Shadows
```typescript
// Workout mode (teal)
shadowColor: '#00D9A3'
shadowOpacity: 0.2
shadowRadius: 25

// Recovery mode (orange)
shadowColor: '#FF8C42'
shadowOpacity: 0.2
shadowRadius: 25
```

### Soft Diffusion
```typescript
shadowOffset: { width: 0, height: 10 }
shadowRadius: 30
shadowOpacity: 0.15
```

---

## 🔧 Implementation Specs

### React Native with Expo

#### Using BlurView
```tsx
<BlurView
  intensity={80}           // 25-40px blur equivalent
  tint="light"             // or "dark"
  style={StyleSheet.absoluteFill}
/>
```

#### Luminance Layer
```tsx
<Animated.View
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
  }}
/>
```

#### Specular Edges
```tsx
{/* Top edge - bright */}
<View style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
}} />

{/* Bottom edge - dark */}
<View style={{
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
}} />
```

---

## 📦 Component Usage

### Basic Glass Card
```tsx
import { SpatialGlassCard } from '@/components/SpatialGlassCard';

<SpatialGlassCard layer="control">
  <Text>Your content here</Text>
</SpatialGlassCard>
```

### Interactive Glass Card
```tsx
<SpatialGlassCard 
  layer="control" 
  interactive 
  onPress={() => console.log('Lifted and brightened!')}
>
  <Text>Tap me</Text>
</SpatialGlassCard>
```

### Mode-Aware Glass Card
```tsx
<SpatialGlassCard 
  layer="control" 
  mode="recovery"  // Orange glow shadow
  interactive
>
  <Text>Recovery card</Text>
</SpatialGlassCard>
```

---

## 🎨 Design System Access

### Importing
```typescript
import spatialGlass from '@/constants/spatialGlass';
```

### Using Layers
```typescript
const cardStyle = spatialGlass.layers.control.light;
```

### Creating Custom Cards
```typescript
import { createGlassCard } from '@/constants/spatialGlass';

const myCard = createGlassCard('control', 'light', 'workout');
```

### Colored Shadows
```typescript
import { coloredShadows } from '@/constants/spatialGlass';

const shadow = coloredShadows('recovery', 'light');
```

---

## ✅ Checklist for Spatial Glass UI

- [ ] Background is **deep & vibrant** (not flat white)
- [ ] Blur strength is **high** (80-95 intensity)
- [ ] Luminance layers are present (semi-transparent white/dark)
- [ ] **Specular edges** create 3D ridge (bright top/left, dark bottom/right)
- [ ] Z-axis hierarchy: **Canvas < Control < Elevated**
- [ ] Higher layers are **brighter** than lower layers
- [ ] Interactions **lift** (scale 1.02) and **brighten** (+10% opacity)
- [ ] Shadows are **colored** (not black), soft & wide
- [ ] Border radius is **generous** (18-24px)
- [ ] Typography is **high contrast** for readability

---

## 🚀 Examples in App

### Home Screen
- **Background**: Vibrant gradient
- **Daily Check-In**: Layer 2 (Control)
- **Confidence Buttons**: Layer 3 (Elevated) - lift on press
- **Today's Focus**: Layer 2 with gradient overlay
- **Activity Cards**: Nested Layer 3 inside Layer 2

### Floating AI Button
- **Button**: Layer 3 (Elevated)
- **AI Menu**: Layer 3 (Elevated) with colored shadows
- **Nav Menu**: Layer 3 (Elevated) centered modal

---

## 💡 Key Differences from Standard Glassmorphism

| Standard Glassmorphism | Spatial Glass (VisionOS) |
|------------------------|--------------------------|
| Flat, plastic-looking | Physical depth, 3D |
| Simple transparency | Luminance layers |
| No edge highlight | Specular edge (rim light) |
| Black shadows | Colored, mode-aware shadows |
| No hierarchy | Clear Z-axis layers |
| Static on press | Lifts & brightens on interaction |

---

## 🔮 Future Enhancements

- [ ] Dark mode glass materials
- [ ] Theme-aware luminance
- [ ] Gradient glass overlays
- [ ] Advanced specular animations
- [ ] Per-component shadow tuning
- [ ] Context-aware blur strength

---

**Remember**: This is about creating the **illusion of physical glass floating in 3D space**. Every detail matters - the blur, the luminance, the edges, the shadows, and the physics of interaction.