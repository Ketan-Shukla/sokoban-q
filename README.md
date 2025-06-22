# Sokoban Game

A classic Sokoban puzzle game built with Phaser 3 and TypeScript.

## Features

- 10x10 grid-based gameplay
- Player character controlled by arrow keys
- Pushable crates (can be pushed but not pulled)
- Target locations for crates
- Win condition when all crates are placed on targets
- Level reset functionality
- Responsive design

## Controls

- **Arrow Keys**: Move the player
- **R Key**: Reset the level
- **Reset Button**: Click to reset the level

## How to Play

1. Use the arrow keys to move the blue player square
2. Push the brown crates onto the green target circles
3. You can only push crates, not pull them
4. Get all crates onto targets to win the level
5. Press 'R' or click the reset button to restart

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Game

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Customization

### Adding Custom Sprites

To use custom sprites instead of the programmatically generated ones:

1. Add your sprite files to the `public/assets/` directory:
   - `boxy_16x16.png` - Player sprite (16x16 pixels)
   - `storage.png` - Target/storage location sprite (16x16 pixels)

2. The game will automatically detect and use these files if they exist

### Modifying the Level

Edit the `GameScene.ts` file to modify:

- Grid size (change `GRID_WIDTH` and `GRID_HEIGHT`)
- Initial player position (`initialState.playerPos`)
- Crate positions (`initialState.cratePositions`)
- Target positions (in `createTargets()` method)

## Game Structure

- `src/GameScene.ts` - Main game logic and scene
- `src/game.ts` - Phaser game configuration
- `src/main.ts` - Application entry point
- `src/style.css` - Styling for the game interface

## Technologies Used

- [Phaser 3](https://phaser.io/) - Game framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Vite](https://vitejs.dev/) - Build tool and dev server
