# Asset Organization Guide - Sokoban Game

## 📁 Public Folder Structure

The game now uses a well-organized asset structure in the `public/sprites/` folder:

```
public/
└── sprites/
    ├── players/          # Player character sprites
    │   ├── player_01.png     # Default player (Level 1)
    │   ├── player_05.png     # Alternative player (Level 2)
    │   └── playerFace.png    # Face-only player (Level 3)
    │
    ├── crates/           # Crate/box sprites
    │   ├── crate_01.png      # Basic wooden crate (Level 1)
    │   ├── crate_03.png      # Wood crate variant (Level 2)
    │   ├── crate_06.png      # Metal crate (Level 3)
    │   └── crate_26.png      # Special crate (unused, available)
    │
    ├── targets/          # Target/goal sprites
    │   ├── environment_03.png # Basic target (Levels 1,3)
    │   └── environment_07.png # Alternative target (Level 2)
    │
    ├── walls/            # Wall/obstacle sprites
    │   ├── block_01.png      # Basic wall block (Levels 1,3)
    │   └── block_06.png      # Alternative wall (Level 2)
    │
    └── ground/           # Ground/floor tiles
        ├── ground_01.png     # Basic ground tile
        └── ground_04.png     # Alternative ground tile
```

## 🎨 Level Themes

Each level has its own visual theme defined in `LevelData.ts`:

### Level 1: "Getting Started"
- **Player**: `player_01.png` - Classic blue character
- **Crate**: `crate_01.png` - Basic wooden crate
- **Target**: `environment_03.png` - Standard target
- **Wall**: `block_01.png` - Basic stone block
- **Theme**: Classic, beginner-friendly

### Level 2: "The Corner Challenge"  
- **Player**: `player_05.png` - Alternative character design
- **Crate**: `crate_03.png` - Wood crate variant
- **Target**: `environment_07.png` - Alternative target design
- **Wall**: `block_06.png` - Different wall texture
- **Theme**: Varied textures, intermediate difficulty

### Level 3: "The Maze Master"
- **Player**: `playerFace.png` - Face-only character
- **Crate**: `crate_06.png` - Metal/industrial crate
- **Target**: `environment_03.png` - Back to classic target
- **Wall**: `block_01.png` - Classic wall blocks
- **Theme**: Industrial/advanced

## 🔧 How Assets Are Loaded

### In `GameScene.ts` preload() method:
```typescript
preload() {
    // Load player sprites
    this.load.image('player', 'sprites/players/player_01.png');
    this.load.image('player_alt', 'sprites/players/player_05.png');
    this.load.image('player_face', 'sprites/players/playerFace.png');
    
    // Load crate sprites
    this.load.image('crate', 'sprites/crates/crate_01.png');
    this.load.image('crate_wood', 'sprites/crates/crate_03.png');
    this.load.image('crate_metal', 'sprites/crates/crate_06.png');
    
    // ... etc
}
```

### Theme-Based Sprite Selection:
Each level's theme determines which sprites to use:
```typescript
theme: {
    player: 'player',      // References loaded sprite key
    crate: 'crate',        // References loaded sprite key
    target: 'target',      // References loaded sprite key
    wall: 'wall'           // References loaded sprite key
}
```

## 🎯 Visual Enhancements

### Ground Tiles
- Uses alternating ground textures for visual variety
- Creates a checkerboard pattern: `(x + y) % 2 === 0`
- Semi-transparent (alpha: 0.8) to not interfere with gameplay

### Wall Variety
- Alternates between wall textures based on index
- Creates visual interest in long wall sections

### Target Variety
- Different target designs per level
- Maintains clear visibility for gameplay

## 📱 Portrait Mode Optimization

### Sprite Sizing
- **Ground tiles**: Full grid size (32x32)
- **Walls**: Full grid size (32x32) 
- **Targets**: 90% of grid size (28.8x28.8)
- **Crates**: 95% of grid size (30.4x30.4)
- **Player**: 90% of grid size (28.8x28.8)

### Visual Hierarchy
- Ground tiles provide base layer
- Walls create clear boundaries
- Targets are slightly smaller for visual clarity
- Crates are prominent but not overwhelming
- Player stands out clearly

## 🔄 Adding New Assets

### To add a new sprite category:

1. **Create folder**: `public/sprites/new_category/`
2. **Add images**: Copy PNG files to the folder
3. **Update preload()**: Add loading code in GameScene.ts
4. **Update LevelData**: Add theme property for new sprite type
5. **Update creation methods**: Use theme-based sprite selection

### Example - Adding Decorations:
```typescript
// 1. In preload()
this.load.image('decoration_1', 'sprites/decorations/decoration_01.png');

// 2. In LevelData theme
theme: {
    player: 'player',
    crate: 'crate',
    target: 'target',
    wall: 'wall',
    decoration: 'decoration_1'  // New property
}

// 3. In level creation
private createDecorations() {
    // Use this.currentLevel.theme.decoration
}
```

## 🎨 Asset Sources

All sprites are from the **Kenney.nl Sokoban Pack**:
- High-quality pixel art
- Consistent art style
- Multiple variations of each element
- Perfect for game development
- License: CC0 (Public Domain)

## 🔍 Asset Guidelines

### File Naming Convention
- Use descriptive names: `player_01.png`, `crate_wood.png`
- Keep original Kenney naming where possible
- Use lowercase with underscores

### Image Requirements
- **Format**: PNG with transparency
- **Size**: Original size (varies, typically 64x64)
- **Quality**: Maintain original pixel art quality
- **Transparency**: Preserve alpha channels

### Performance Considerations
- Assets are loaded once at game start
- Sprites are reused across multiple instances
- Ground tiles use alternating textures efficiently
- No runtime sprite generation needed

## 🚀 Benefits of Asset-Based System

✅ **Professional Appearance**: High-quality artwork  
✅ **Visual Variety**: Different themes per level  
✅ **Scalability**: Easy to add new assets  
✅ **Performance**: Optimized loading and rendering  
✅ **Consistency**: Cohesive art style throughout  
✅ **Flexibility**: Theme-based sprite selection  
✅ **Mobile Optimized**: Perfect for portrait mode  

This asset system transforms the game from simple geometric shapes to a visually appealing, professional-looking Sokoban experience!
