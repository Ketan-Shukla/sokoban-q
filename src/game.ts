import Phaser from 'phaser';
import { GameScene } from './GameScene';

// Function to get optimal game dimensions based on screen size
function getGameDimensions() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Mobile: Use maximum available screen space
    const maxWidth = Math.min(window.innerWidth - 20, 500);
    const maxHeight = Math.min(window.innerHeight - 20, 900); // Use most of screen height
    return {
      width: maxWidth,
      height: maxHeight
    };
  } else {
    // Desktop: Use original portrait dimensions
    return {
      width: 640,
      height: 960
    };
  }
}

const dimensions = getGameDimensions();

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: dimensions.width,
    height: dimensions.height,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    input: {
        keyboard: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: dimensions.width,
        height: dimensions.height
    }
};

const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
    const newDimensions = getGameDimensions();
    game.scale.resize(newDimensions.width, newDimensions.height);
});

export { game };
