import Phaser from 'phaser';
import { GameScene } from './GameScene';

// Function to get optimal game dimensions based on screen size
function getGameDimensions() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Mobile: Use maximum available screen space with no gaps
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    return {
      width: maxWidth,
      height: maxHeight
    };
  } else {
    // Desktop: Use specified portrait dimensions
    return {
      width: 430,
      height: 932
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
