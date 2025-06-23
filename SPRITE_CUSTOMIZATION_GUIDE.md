# Sprite Customization Guide - Portrait Mode (640x960)

## How to Change Game Sprites

The sprites are created programmatically in the `createSprites()` method in `GameScene.ts`. The game is now optimized for portrait mode with a 640x960 resolution.

## Portrait Mode Layout

The game now features:
- **Top Section**: Level info and control buttons
- **Middle Section**: Game area (levels are designed to fit well in portrait)
- **Bottom Section**: Instructions and keyboard shortcuts

## 1. Player Sprite (Blue Square)

**Current Code:**
```typescript
this.add.graphics()
    .fillStyle(0x4A90E2)           // Blue fill color
    .fillRect(0, 0, 16, 16)       // Rectangle shape
    .lineStyle(1, 0x2E5BBA)       // Border style
    .strokeRect(0, 0, 16, 16)     // Border
    .generateTexture('player', 16, 16);
```

**Portrait-Optimized Example - Character with Face:**
```typescript
this.add.graphics()
    .fillStyle(0x4A90E2)          // Blue body
    .fillRect(0, 0, 16, 16)
    .lineStyle(1, 0x2E5BBA)       // Border
    .strokeRect(0, 0, 16, 16)
    .fillStyle(0xFFFFFF)          // White eyes
    .fillCircle(5, 5, 1)
    .fillCircle(11, 5, 1)
    .fillStyle(0x000000)          // Black pupils
    .fillCircle(5, 5, 0.5)
    .fillCircle(11, 5, 0.5)
    .lineStyle(1, 0x000000)       // Smile
    .lineBetween(4, 10, 12, 10)
    .generateTexture('player', 16, 16);
```

## 2. Crate Sprite (Brown Box)

**Portrait-Optimized Example - Detailed Crate:**
```typescript
this.add.graphics()
    .fillStyle(0x8B4513)          // Brown base
    .fillRect(0, 0, 16, 16)
    .lineStyle(2, 0x654321)       // Thick border
    .strokeRect(0, 0, 16, 16)
    .fillStyle(0xA0522D)          // Lighter brown highlights
    .fillRect(1, 1, 14, 2)        // Top highlight
    .fillRect(1, 1, 2, 14)        // Left highlight
    .lineStyle(1, 0x654321)       // Wood grain
    .lineBetween(0, 5, 16, 5)
    .lineBetween(0, 10, 16, 10)
    .lineBetween(5, 0, 5, 16)
    .lineBetween(10, 0, 10, 16)
    .generateTexture('crate', 16, 16);
```

## 3. Target Sprite (Green Circle)

**Portrait-Optimized Example - Bullseye Target:**
```typescript
this.add.graphics()
    .fillStyle(0x32CD32)          // Green outer ring
    .fillCircle(8, 8, 7)
    .fillStyle(0xFFFFFF)          // White middle ring
    .fillCircle(8, 8, 5)
    .fillStyle(0xFF0000)          // Red center
    .fillCircle(8, 8, 3)
    .fillStyle(0xFFFFFF)          // White center dot
    .fillCircle(8, 8, 1)
    .lineStyle(1, 0x228B22)       // Green border
    .strokeCircle(8, 8, 7)
    .generateTexture('target', 16, 16);
```

## 4. Wall Sprite (Gray Brick)

**Portrait-Optimized Example - Stone Wall:**
```typescript
this.add.graphics()
    .fillStyle(0x696969)          // Dark gray base
    .fillRect(0, 0, 16, 16)
    .fillStyle(0x808080)          // Lighter gray highlights
    .fillRect(0, 0, 16, 1)        // Top edge
    .fillRect(0, 0, 1, 16)        // Left edge
    .fillStyle(0x555555)          // Darker shadows
    .fillRect(15, 0, 1, 16)       // Right edge
    .fillRect(0, 15, 16, 1)       // Bottom edge
    .lineStyle(1, 0x444444)       // Mortar lines
    .lineBetween(0, 8, 16, 8)     // Horizontal mortar
    .lineBetween(8, 0, 8, 8)      // Vertical mortar top
    .lineBetween(4, 8, 4, 16)     // Vertical mortar bottom left
    .lineBetween(12, 8, 12, 16)   // Vertical mortar bottom right
    .generateTexture('wall', 16, 16);
```

## Portrait Mode Specific Considerations

### Screen Space Optimization
- Sprites remain 16x16 pixels but are scaled appropriately
- UI elements are arranged vertically to maximize game area
- Level select uses 2 columns instead of 3 for better touch interaction

### Mobile-Friendly Features
- Larger touch targets for buttons
- Clear visual hierarchy with centered elements
- Instructions placed at the bottom for easy reference

### Color Schemes for Portrait Mode

**High Contrast Theme:**
```typescript
// Player - Bright Blue
.fillStyle(0x0080FF)

// Crate - Orange
.fillStyle(0xFF8C00)

// Target - Lime Green
.fillStyle(0x32FF32)

// Wall - Dark Purple
.fillStyle(0x4B0082)
```

**Pastel Theme:**
```typescript
// Player - Soft Pink
.fillStyle(0xFFB6C1)

// Crate - Peach
.fillStyle(0xFFDAB9)

// Target - Mint Green
.fillStyle(0x98FB98)

// Wall - Lavender
.fillStyle(0xE6E6FA)
```

## Portrait Layout Dimensions

- **Game Canvas**: 640x960 pixels
- **UI Header**: ~150 pixels from top
- **Game Area**: Centered with 50px margins
- **Footer Instructions**: ~100 pixels from bottom
- **Button Layout**: 2x2 grid, centered horizontally

## Making Changes for Portrait Mode

1. **Open** `src/GameScene.ts`
2. **Find** the `createSprites()` method (around line 104)
3. **Replace** sprite code with portrait-optimized versions
4. **Test** on both desktop and mobile devices
5. **Adjust** colors for better visibility on smaller screens

## Mobile Testing Tips

- Test on actual mobile devices when possible
- Ensure sprites are clearly distinguishable at small sizes
- Use high contrast colors for better visibility
- Consider accessibility for colorblind users

## Portrait Mode Benefits

- ✅ Better mobile experience
- ✅ Natural phone/tablet orientation
- ✅ More vertical space for UI elements
- ✅ Touch-friendly button layout
- ✅ Optimized for one-handed play
