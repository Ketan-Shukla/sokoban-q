import Phaser from 'phaser';
import { LevelManager } from './LevelManager';
import type { LevelData } from './LevelData';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private crates: Phaser.GameObjects.Sprite[] = [];
    private targets: Phaser.GameObjects.Sprite[] = [];
    private walls: Phaser.GameObjects.Sprite[] = [];
    
    // UI Elements
    private resetButton!: Phaser.GameObjects.Text;
    private winText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private progressText!: Phaser.GameObjects.Text;
    private nextLevelButton!: Phaser.GameObjects.Text;
    private prevLevelButton!: Phaser.GameObjects.Text;
    private levelSelectButton!: Phaser.GameObjects.Text;
    
    // Grid configuration
    private readonly GRID_SIZE = 32;
    private OFFSET_X = 50; // Will be calculated for centering
    private OFFSET_Y = 150; // Will be calculated for centering
    
    // Touch controls
    private touchButtons: { [key: string]: Phaser.GameObjects.Graphics } = {};
    private isMobile = false;
    
    // Game state
    private gameWon = false;
    private levelManager: LevelManager;
    private currentLevel!: LevelData;
    private isLevelLoaded = false;

    constructor() {
        super({ key: 'GameScene' });
        this.levelManager = new LevelManager();
    }

    preload() {
        // Load single consistent sprites for all levels
        this.load.image('player', 'sprites/players/player_01.png');
        this.load.image('crate', 'sprites/crates/crate_01.png');
        this.load.image('target', 'sprites/targets/environment_07.png');
        this.load.image('wall', 'sprites/walls/block_01.png');
        this.load.image('ground', 'sprites/ground/ground_01.png');
        
        // Handle loading errors gracefully
        this.load.on('loaderror', (file: any) => {
            console.warn('Could not load asset:', file.src);
        });
    
        
        // Handle loading errors gracefully
        this.load.on('loaderror', (file: any) => {
            console.warn('Could not load asset:', file.src);
        });
    }

    create() {
        // Detect if mobile device
        this.isMobile = this.scale.width <= 500;
        
        // Load current level
        this.loadCurrentLevel();
        
        // Create UI first (before loading level)
        this.createUI();
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Setup touch controls for mobile
        if (this.isMobile) {
            this.setupTouchControls();
        }
    }

    private loadCurrentLevel() {
        this.currentLevel = this.levelManager.getCurrentLevel();
        this.gameWon = false;
        
        // Calculate centered positioning
        this.calculateCenteredOffsets();
        
        // Clear existing game objects
        this.clearLevel();
        
        // Create the game grid background
        this.createGrid();
        
        // Create walls
        this.createWalls();
        
        // Create targets
        this.createTargets();
        
        // Create crates
        this.createCrates();
        
        // Create player
        this.createPlayer();
        
        // Recreate touch controls for mobile after level change
        if (this.isMobile) {
            this.clearTouchButtons();
            this.createTouchButtons();
        }
        
        // Update UI (only if UI elements exist)
        if (this.levelText) {
            this.updateUI();
        }
    }

    private clearTouchButtons() {
        Object.values(this.touchButtons).forEach(button => {
            if (button && button.destroy) {
                button.destroy();
            }
        });
        this.touchButtons = {};
    }

    private calculateCenteredOffsets() {
        // Get current game dimensions
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        
        // Calculate the total size of the level
        const levelWidth = this.currentLevel.width * this.GRID_SIZE;
        const levelHeight = this.currentLevel.height * this.GRID_SIZE;
        
        // Center horizontally
        this.OFFSET_X = (gameWidth - levelWidth) / 2;
        
        // Position vertically with space for UI at top and bottom
        const uiSpaceTop = gameHeight < 600 ? 100 : 150; // Less space on smaller screens
        const uiSpaceBottom = gameHeight < 600 ? 50 : 100;
        const availableHeight = gameHeight - uiSpaceTop - uiSpaceBottom;
        this.OFFSET_Y = uiSpaceTop + Math.max(0, (availableHeight - levelHeight) / 2);
    }
     

    private clearLevel() {
        // Clear existing sprites
        this.crates.forEach(crate => crate.destroy());
        this.targets.forEach(target => target.destroy());
        this.walls.forEach(wall => wall.destroy());
        if (this.player) this.player.destroy();
        
        // Clear arrays
        this.crates = [];
        this.targets = [];
        this.walls = [];
        
        // Clear win text
        if (this.winText) this.winText.setText('');
        
        // Clear touch buttons if they exist
        if (this.isMobile) {
            this.clearTouchButtons();
        }
    }

    private createGrid() {
        // Create a consistent ground background
        for (let x = 0; x < this.currentLevel.width; x++) {
            for (let y = 0; y < this.currentLevel.height; y++) {
                const groundTile = this.add.sprite(
                    this.OFFSET_X + x * this.GRID_SIZE + this.GRID_SIZE / 2,
                    this.OFFSET_Y + y * this.GRID_SIZE + this.GRID_SIZE / 2,
                    'ground'
                );
                groundTile.setDisplaySize(this.GRID_SIZE, this.GRID_SIZE);
                groundTile.setAlpha(0.8); // Slightly transparent for better visibility
            }
        }
    }

    private createWalls() {
        this.currentLevel.walls.forEach((wallPos) => {
            const wall = this.add.sprite(
                this.OFFSET_X + wallPos.x * this.GRID_SIZE + this.GRID_SIZE / 2,
                this.OFFSET_Y + wallPos.y * this.GRID_SIZE + this.GRID_SIZE / 2,
                'wall'
            );
            wall.setDisplaySize(this.GRID_SIZE, this.GRID_SIZE);
            wall.setData('gridX', wallPos.x);
            wall.setData('gridY', wallPos.y);
            this.walls.push(wall);
        });
    }

    private createTargets() {
        this.currentLevel.targets.forEach((targetPos, index) => {
            const targetTexture = index % 2 === 0 ? 'target' : 'target'; // Currently using the same texture, can be changed later
            
            const target = this.add.sprite(
                this.OFFSET_X + targetPos.x * this.GRID_SIZE + this.GRID_SIZE / 2,
                this.OFFSET_Y + targetPos.y * this.GRID_SIZE + this.GRID_SIZE / 2,
                targetTexture
            );
            target.setDisplaySize(this.GRID_SIZE * 0.9, this.GRID_SIZE * 0.9);
            target.setData('gridX', targetPos.x);
            target.setData('gridY', targetPos.y);
            this.targets.push(target);
        });
    }

    private createCrates() {
        this.currentLevel.crates.forEach((cratePos) => {
            const crate = this.add.sprite(
                this.OFFSET_X + cratePos.x * this.GRID_SIZE + this.GRID_SIZE / 2,
                this.OFFSET_Y + cratePos.y * this.GRID_SIZE + this.GRID_SIZE / 2,
                'crate'
            );
            crate.setDisplaySize(this.GRID_SIZE * 0.95, this.GRID_SIZE * 0.95);
            crate.setData('gridX', cratePos.x);
            crate.setData('gridY', cratePos.y);
            this.crates.push(crate);
        });
    }

    private createPlayer() {
        this.player = this.add.sprite(
            this.OFFSET_X + this.currentLevel.playerStart.x * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.OFFSET_Y + this.currentLevel.playerStart.y * this.GRID_SIZE + this.GRID_SIZE / 2,
            'player'
        );
        this.player.setDisplaySize(this.GRID_SIZE * 0.9, this.GRID_SIZE * 0.9);
        this.player.setData('gridX', this.currentLevel.playerStart.x);
        this.player.setData('gridY', this.currentLevel.playerStart.y);
    }

    private createUI() {
        // Get current game dimensions for responsive positioning
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const isMobile = gameWidth < 500;
        
        // Level info - centered at top
        this.levelText = this.add.text(centerX, 30, '', {
            fontSize: isMobile ? '20px' : '24px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.progressText = this.add.text(centerX, isMobile ? 55 : 60, '', {
            fontSize: isMobile ? '14px' : '16px',
            color: '#CCCCCC'
        }).setOrigin(0.5);
        
        // Control buttons - arranged in two rows for portrait layout
        const buttonY1 = isMobile ? 80 : 90;
        const buttonY2 = isMobile ? 105 : 125;
        const buttonSpacing = isMobile ? 140 : 160;
        const fontSize = isMobile ? '12px' : '14px';
        const padding = isMobile ? { x: 6, y: 3 } : { x: 8, y: 4 };
        
        // Top row buttons
        this.resetButton = this.add.text(centerX - buttonSpacing/2, buttonY1, 'Reset Level (R)', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: padding
        }).setOrigin(0.5);
        this.resetButton.setInteractive();
        this.resetButton.on('pointerdown', () => this.resetLevel());
        
        this.levelSelectButton = this.add.text(centerX + buttonSpacing/2, buttonY1, 'Level Select', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#CC00CC',
            padding: padding
        }).setOrigin(0.5);
        this.levelSelectButton.setInteractive();
        this.levelSelectButton.on('pointerdown', () => this.showLevelSelect());
        
        // Bottom row buttons
        this.prevLevelButton = this.add.text(centerX - buttonSpacing/2, buttonY2, '← Previous Level', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#FFCC00',
            padding: padding
        }).setOrigin(0.5);
        this.prevLevelButton.setInteractive();
        this.prevLevelButton.on('pointerdown', () => this.goToPreviousLevel());
        
        this.nextLevelButton = this.add.text(centerX + buttonSpacing/2, buttonY2, 'Next Level →', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#00CC00',
            padding: padding
        }).setOrigin(0.5);
        this.nextLevelButton.setInteractive();
        this.nextLevelButton.on('pointerdown', () => this.goToNextLevel());
        
        // Win text - centered in the middle of the screen
        this.winText = this.add.text(centerX, gameHeight / 2, '', {
            fontSize: isMobile ? '20px' : '24px',
            color: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add instructions at the bottom (responsive positioning)
        const instructionY = gameHeight - (isMobile ? 120 : 110); // More space for touch buttons
        const instructionFontSize = isMobile ? '12px' : '16px';
        const instructionSpacing = isMobile ? 15 : 25;
        
        if (isMobile) {
            this.add.text(centerX, instructionY, 'Swipe or Use Touch Buttons to Move', {
                fontSize: instructionFontSize,
                color: '#CCCCCC'
            }).setOrigin(0.5);
            
            this.add.text(centerX, instructionY + instructionSpacing, 'Push crates onto targets to win!', {
                fontSize: '10px',
                color: '#AAAAAA'
            }).setOrigin(0.5);
        } else {
            this.add.text(centerX, instructionY, 'Use Arrow Keys to Move', {
                fontSize: instructionFontSize,
                color: '#CCCCCC'
            }).setOrigin(0.5);
            
            this.add.text(centerX, instructionY + instructionSpacing, 'Push crates onto targets to win!', {
                fontSize: '14px',
                color: '#AAAAAA'
            }).setOrigin(0.5);
            
            this.add.text(centerX, instructionY + instructionSpacing * 2, 'R: Reset | N: Next | P: Previous', {
                fontSize: '12px',
                color: '#888888'
            }).setOrigin(0.5);
        }
        
        // Update UI now that all elements are created
        this.updateUI();
    }
    
    private updateUI() {
        if(this.isLevelLoaded === false) return;

        const currentIndex = this.levelManager.getCurrentLevelIndex();
        const totalLevels = this.levelManager.getTotalLevels();
        const progress = this.levelManager.getProgressPercentage();
        
        this.levelText.setText(`Level ${currentIndex + 1}: ${this.currentLevel.name}`);
        this.progressText.setText(`Progress: ${progress}% (${this.levelManager['completedLevels'].size}/${totalLevels} levels completed)`);
        
        // Update button states
        this.prevLevelButton.setAlpha(this.levelManager.canGoToPreviousLevel() ? 1 : 0.5);
        this.nextLevelButton.setAlpha(this.levelManager.canAdvanceToNextLevel() ? 1 : 0.5);
    }

    private setupInputHandlers() {
        this.input.keyboard!.on('keydown-UP', () => this.movePlayer(0, -1));
        this.input.keyboard!.on('keydown-DOWN', () => this.movePlayer(0, 1));
        this.input.keyboard!.on('keydown-LEFT', () => this.movePlayer(-1, 0));
        this.input.keyboard!.on('keydown-RIGHT', () => this.movePlayer(1, 0));
        this.input.keyboard!.on('keydown-R', () => this.resetLevel());
        this.input.keyboard!.on('keydown-N', () => this.goToNextLevel());
        this.input.keyboard!.on('keydown-P', () => this.goToPreviousLevel());
    }

    private setupTouchControls() {
        // Setup swipe gestures
        this.setupSwipeGestures();
        
        // Setup on-screen directional buttons
        this.createTouchButtons();
    }

    private setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        const minSwipeDistance = 50;

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            startX = pointer.x;
            startY = pointer.y;
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const deltaX = pointer.x - startX;
            const deltaY = pointer.y - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < minSwipeDistance) return;

            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.movePlayer(1, 0); // Right
                } else {
                    this.movePlayer(-1, 0); // Left
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.movePlayer(0, 1); // Down
                } else {
                    this.movePlayer(0, -1); // Up
                }
            }
        });
    }

    private createTouchButtons() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const buttonSize = 60;
        const buttonAlpha = 0.7;
        const buttonColor = 0x646cff;
        const buttonPadding = 20;

        // Position buttons in bottom corners
        const leftX = buttonPadding + buttonSize / 2;
        const rightX = gameWidth - buttonPadding - buttonSize / 2;
        const bottomY = gameHeight - buttonPadding - buttonSize / 2;
        const topY = gameHeight - buttonPadding - buttonSize * 2.5;

        // Create directional buttons
        this.createTouchButton('left', leftX, bottomY, buttonSize, buttonColor, buttonAlpha, '←', () => this.movePlayer(-1, 0));
        this.createTouchButton('right', rightX, bottomY, buttonSize, buttonColor, buttonAlpha, '→', () => this.movePlayer(1, 0));
        this.createTouchButton('up', rightX, topY, buttonSize, buttonColor, buttonAlpha, '↑', () => this.movePlayer(0, -1));
        this.createTouchButton('down', leftX, topY, buttonSize, buttonColor, buttonAlpha, '↓', () => this.movePlayer(0, 1));

        // Create reset button in center bottom
        const centerX = gameWidth / 2;
        this.createTouchButton('reset', centerX, bottomY, buttonSize * 1.2, 0xff6b6b, buttonAlpha, 'R', () => this.resetLevel());
    }

    private createTouchButton(
        key: string, 
        x: number, 
        y: number, 
        size: number, 
        color: number, 
        alpha: number, 
        text: string, 
        callback: () => void
    ) {
        // Create button background
        const button = this.add.graphics();
        button.fillStyle(color, alpha);
        button.fillCircle(0, 0, size / 2);
        button.setPosition(x, y);
        button.setInteractive(new Phaser.Geom.Circle(0, 0, size / 2), Phaser.Geom.Circle.Contains);

        // Add button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: `${size / 2}px`,
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Button interactions
        button.on('pointerdown', () => {
            button.setScale(0.9);
            callback();
        });

        button.on('pointerup', () => {
            button.setScale(1);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });

        // Store references
        this.touchButtons[key] = button;
        this.touchButtons[key + '_text'] = buttonText as any;
    }

    private movePlayer(deltaX: number, deltaY: number) {
        if (this.gameWon) return;
        
        const currentX = this.player.getData('gridX');
        const currentY = this.player.getData('gridY');
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        
        // Check if new position is valid (not a wall and within bounds)
        if (!this.isValidPosition(newX, newY)) {
            return;
        }
        
        // Check for crate at new position
        const crateAtNewPos = this.getCrateAt(newX, newY);
        
        if (crateAtNewPos) {
            // Try to push the crate
            const crateNewX = newX + deltaX;
            const crateNewY = newY + deltaY;
            
            // Check if crate can be pushed
            if (this.canMoveTo(crateNewX, crateNewY)) {
                // Move the crate
                this.moveCrate(crateAtNewPos, crateNewX, crateNewY);
                // Move the player
                this.movePlayerTo(newX, newY);
                // Check win condition
                this.checkWinCondition();
            }
        } else if (this.canMoveTo(newX, newY)) {
            // Move the player
            this.movePlayerTo(newX, newY);
        }
    }
    
    private isValidPosition(x: number, y: number): boolean {
        // Check bounds
        if (x < 0 || x >= this.currentLevel.width || y < 0 || y >= this.currentLevel.height) {
            return false;
        }
        
        // Check for walls
        return !this.walls.some(wall => 
            wall.getData('gridX') === x && wall.getData('gridY') === y
        );
    }

    private getCrateAt(x: number, y: number): Phaser.GameObjects.Sprite | null {
        return this.crates.find(crate => 
            crate.getData('gridX') === x && crate.getData('gridY') === y
        ) || null;
    }

    private canMoveTo(x: number, y: number): boolean {
        // Check if position is valid (not a wall and within bounds)
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        // Check for crates
        return !this.getCrateAt(x, y);
    }

    private moveCrate(crate: Phaser.GameObjects.Sprite, x: number, y: number) {
        crate.setData('gridX', x);
        crate.setData('gridY', y);
        crate.setPosition(
            this.OFFSET_X + x * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.OFFSET_Y + y * this.GRID_SIZE + this.GRID_SIZE / 2
        );
    }

    private checkWinCondition() {
        const allCratesOnTargets = this.crates.every(crate => {
            const crateX = crate.getData('gridX');
            const crateY = crate.getData('gridY');
            return this.targets.some(target => 
                target.getData('gridX') === crateX && target.getData('gridY') === crateY
            );
        });
        
        if (allCratesOnTargets && !this.gameWon) {
            this.gameWon = true;
            this.levelManager.completeCurrentLevel();
            
            const isLastLevel = !this.levelManager.canAdvanceToNextLevel();
            
            if (isLastLevel) {
                this.winText.setText('🎉 Congratulations! You completed all levels! 🎉');
            } else {
                this.winText.setText('🎉 Level Complete! Press N for next level 🎉');
            }
            
            this.winText.setPosition(
                this.cameras.main.centerX - this.winText.width / 2,
                this.cameras.main.centerY
            );
            
            this.updateUI();
        }
    }

    private resetLevel() {
        this.gameWon = false;
        this.winText.setText('');
        
        // Reset player position
        this.movePlayerTo(this.currentLevel.playerStart.x, this.currentLevel.playerStart.y);
        
        // Reset crate positions
        this.crates.forEach((crate, index) => {
            const pos = this.currentLevel.crates[index];
            this.moveCrate(crate, pos.x, pos.y);
        });
    }
    
    private goToNextLevel() {
        if (this.levelManager.canAdvanceToNextLevel()) {
            this.levelManager.advanceToNextLevel();
            this.loadCurrentLevel();
        }
    }
    
    private goToPreviousLevel() {
        if (this.levelManager.canGoToPreviousLevel()) {
            this.levelManager.goToPreviousLevel();
            this.loadCurrentLevel();
        }
    }
    
    private showLevelSelect() {
        // Get current game dimensions
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        const isMobile = gameWidth < 500;
        
        // Create a level selection overlay - responsive sizing
        const overlayWidth = Math.min(gameWidth * 0.9, isMobile ? 350 : 580);
        const overlayHeight = Math.min(gameHeight * 0.8, isMobile ? 400 : 700);
        
        const overlay = this.add.rectangle(centerX, centerY, overlayWidth, overlayHeight, 0x000000, 0.8);
        const title = this.add.text(centerX, centerY - overlayHeight/2 + 40, 'Select Level', {
            fontSize: isMobile ? '24px' : '28px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const levels = this.levelManager.getAllLevels();
        const buttonsPerRow = isMobile ? 1 : 2; // Single column on mobile
        const buttonWidth = isMobile ? 180 : 220;
        const buttonHeight = isMobile ? 60 : 80;
        const buttonSpacingX = isMobile ? 0 : 40;
        const buttonSpacingY = isMobile ? 20 : 30;
        const startY = centerY - overlayHeight/2 + 100;
        
        const levelButtons: Phaser.GameObjects.Text[] = [];
        
        levels.forEach((level, index) => {
            const row = Math.floor(index / buttonsPerRow);
            const col = index % buttonsPerRow;
            const x = centerX + (col - (buttonsPerRow - 1) / 2) * (buttonWidth + buttonSpacingX);
            const y = startY + row * (buttonHeight + buttonSpacingY);
            
            const isCompleted = this.levelManager.isLevelCompleted(index);
            const isCurrent = index === this.levelManager.getCurrentLevelIndex();
            
            let backgroundColor = '#666666';
            let textColor = '#FFFFFF';
            
            if (isCurrent) {
                backgroundColor = '#00AA00';
            } else if (isCompleted) {
                backgroundColor = '#0066CC';
            }
            
            const button = this.add.text(x, y, `Level ${index + 1}\n${level.name}`, {
                fontSize: isMobile ? '14px' : '16px',
                color: textColor,
                backgroundColor: backgroundColor,
                padding: { x: isMobile ? 15 : 20, y: isMobile ? 10 : 15 },
                align: 'center',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5);
            
            button.setInteractive();
            button.on('pointerdown', () => {
                this.levelManager.goToLevel(index);
                this.loadCurrentLevel();
                this.closeLevelSelect(overlay, title, levelButtons, closeButton);
            });
            
            levelButtons.push(button);
        });
        
        const closeButton = this.add.text(centerX, centerY + overlayHeight/2 - 40, 'Close', {
            fontSize: isMobile ? '18px' : '20px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: isMobile ? 20 : 30, y: isMobile ? 10 : 15 }
        }).setOrigin(0.5);
        
        closeButton.setInteractive();
        closeButton.on('pointerdown', () => {
            this.closeLevelSelect(overlay, title, levelButtons, closeButton);
        });
    }
    
    private closeLevelSelect(overlay: Phaser.GameObjects.Rectangle, title: Phaser.GameObjects.Text, 
                           buttons: Phaser.GameObjects.Text[], closeButton: Phaser.GameObjects.Text) {
        overlay.destroy();
        title.destroy();
        buttons.forEach(button => button.destroy());
        closeButton.destroy();
    }

    private movePlayerTo(x: number, y: number) {
        this.player.setData('gridX', x);
        this.player.setData('gridY', y);
        this.player.setPosition(
            this.OFFSET_X + x * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.OFFSET_Y + y * this.GRID_SIZE + this.GRID_SIZE / 2
        );
    }
}
