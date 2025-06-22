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
    private isMobile = false;
    
    // Player direction state
    private playerDirection: 'down' | 'up' | 'left' | 'right' = 'down';
    
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
        // Load core game sprites
        this.load.image('player', 'sprites/players/player_01.png');
        this.load.image('crate', 'sprites/crates/crate_01.png');
        this.load.image('target', 'sprites/targets/environment_03.png'); // Fix target loading
        this.load.image('wall', 'sprites/walls/block_01.png');
        this.load.image('ground', 'sprites/ground/ground_01.png');
        
        // Load directional player sprites for proper facing
        this.load.image('player_down', 'sprites/players/player_01.png');    // Front facing (down)
        this.load.image('player_down1', 'sprites/players/player_06.png');    // Front facing (down)
        this.load.image('player_down2', 'sprites/players/player_07.png');    // Front facing (down)
        this.load.image('player_down3', 'sprites/players/player_23.png');    // Front facing (down)
        this.load.image('player_down4', 'sprites/players/player_24.png');    // Front facing (down)
        this.load.image('player_up', 'sprites/players/player_02.png');      // Back facing (up)  
        this.load.image('player_up2', 'sprites/players/player_03.png');      // Back facing (up)  
        this.load.image('player_up3', 'sprites/players/player_04.png');      // Back facing (up)  
        this.load.image('player_left', 'sprites/players/player_14.png');    // Left facing
        this.load.image('player_left1', 'sprites/players/player_15.png');    // Left facing
        this.load.image('player_left2', 'sprites/players/player_16.png');    // Left facing
        this.load.image('player_right', 'sprites/players/player_11.png');  // Right facing
        this.load.image('player_right1', 'sprites/players/player_12.png');  // Right facing
        this.load.image('player_right2', 'sprites/players/player_13.png');  // Right facing
        
        // Handle loading errors gracefully
        this.load.on('loaderror', (file: any) => {
            console.warn('Could not load asset:', file.src);
        });
    }

    create() {
        // Detect if mobile device
        this.isMobile = this.scale.width <= 500;
        
        // Set camera zoom for desktop to make levels appear larger
        if (!this.isMobile) {
            this.cameras.main.setZoom(1.4); // Zoom in on desktop for larger appearance
        }
        
        // Create player animations
        this.createPlayerAnimations();
        
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

    private createPlayerAnimations() {
        // Create idle animations for each direction (player keeps facing last direction)
        this.anims.create({
            key: 'player-idle-down',
            frames: [{ key: 'player_down' }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'player-idle-up',
            frames: [{ key: 'player_up' }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'player-idle-left',
            frames: [{ key: 'player_left' }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'player-idle-right',
            frames: [{ key: 'player_right' }],
            frameRate: 1,
            repeat: 0
        });

        // Create walking animations for each direction
        this.anims.create({
            key: 'player-walk-down',
            frames: [
                { key: 'player_down' },
                { key: 'player_down1' },
                { key: 'player_down2' },
                { key: 'player_down3' },
                { key: 'player_down4' },
                { key: 'player_down1' },
                { key: 'player_down2' },
            ],
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'player-walk-up',
            frames: [
                { key: 'player_up' },
                { key: 'player_up2' },
                { key: 'player_up3' },
                { key: 'player_up' }
            ],
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'player-walk-left',
            frames: [
                { key: 'player_left' },
                { key: 'player_left1' },
                { key: 'player_left2' },
                { key: 'player_left' }
            ],
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'player-walk-right',
            frames: [
                { key: 'player_right' },
                { key: 'player_right1' },
                { key: 'player_right2' },
                { key: 'player_right' }
            ],
            frameRate: 8,
            repeat: 0
        });
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
        
        // Touch controls are gesture-based only, no buttons to recreate
        
        // Update UI (only if UI elements exist)
        if (this.levelText) {
            this.updateUI();
        }
    }

    private calculateCenteredOffsets() {
        // Get current game dimensions
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        
        // Calculate the total size of the level
        const levelWidth = this.currentLevel.width * this.GRID_SIZE;
        const levelHeight = this.currentLevel.height * this.GRID_SIZE;
        
        if (this.isMobile) {
            // Mobile: Center normally
            this.OFFSET_X = (gameWidth - levelWidth) / 2;
            
            // Position vertically with space for UI at top and bottom
            const uiSpaceTop = 100;
            const uiSpaceBottom = 80;
            const availableHeight = gameHeight - uiSpaceTop - uiSpaceBottom;
            this.OFFSET_Y = uiSpaceTop + Math.max(0, (availableHeight - levelHeight) / 2);
        } else {
            // Desktop: Account for camera zoom when centering
            const zoom = this.cameras.main.zoom;
            const effectiveGameWidth = gameWidth / zoom;
            const effectiveGameHeight = gameHeight / zoom;
            
            // Center horizontally
            this.OFFSET_X = (effectiveGameWidth - levelWidth) / 2;
            
            // Position vertically with space for UI
            const uiSpaceTop = 120 / zoom; // Adjust UI space for zoom
            const uiSpaceBottom = 100 / zoom;
            const availableHeight = effectiveGameHeight - uiSpaceTop - uiSpaceBottom;
            this.OFFSET_Y = uiSpaceTop + Math.max(0, (availableHeight - levelHeight) / 2);
        }
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
        
        // No touch buttons to clear - using gestures only
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
        this.currentLevel.targets.forEach((targetPos) => {
            const target = this.add.sprite(
                this.OFFSET_X + targetPos.x * this.GRID_SIZE + this.GRID_SIZE / 2,
                this.OFFSET_Y + targetPos.y * this.GRID_SIZE + this.GRID_SIZE / 2,
                'target'
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
            'player_down' // Start facing down
        );
        this.player.setDisplaySize(this.GRID_SIZE * 0.9, this.GRID_SIZE * 0.9);
        this.player.setData('gridX', this.currentLevel.playerStart.x);
        this.player.setData('gridY', this.currentLevel.playerStart.y);
        
        // Set initial direction and play idle animation
        this.playerDirection = 'down';
        this.player.play('player-idle-down');
    }

    private createUI() {
        // Get current game dimensions for responsive positioning
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const isMobile = gameWidth < 500;
        
        // Account for camera zoom on desktop
        const zoom = this.cameras.main.zoom;
        const effectiveCenterX = isMobile ? centerX : centerX / zoom;
        const effectiveGameHeight = isMobile ? gameHeight : gameHeight / zoom;
        
        // Level info - centered at top
        this.levelText = this.add.text(effectiveCenterX, isMobile ? 30 : 25, '', {
            fontSize: isMobile ? '20px' : '18px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.progressText = this.add.text(effectiveCenterX, isMobile ? 55 : 50, '', {
            fontSize: isMobile ? '14px' : '14px',
            color: '#CCCCCC'
        }).setOrigin(0.5);
        
        // Control buttons - arranged in two rows for portrait layout
        const buttonY1 = isMobile ? 80 : 75;
        const buttonY2 = isMobile ? 105 : 100;
        const buttonSpacing = isMobile ? 140 : 120;
        const fontSize = isMobile ? '12px' : '11px';
        const padding = isMobile ? { x: 6, y: 3 } : { x: 6, y: 3 };
        
        // Top row buttons
        this.resetButton = this.add.text(effectiveCenterX - buttonSpacing/2, buttonY1, 'Reset Level (R)', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: padding
        }).setOrigin(0.5);
        this.resetButton.setInteractive();
        this.resetButton.on('pointerdown', () => this.resetLevel());
        
        this.levelSelectButton = this.add.text(effectiveCenterX + buttonSpacing/2, buttonY1, 'Level Select', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#CC00CC',
            padding: padding
        }).setOrigin(0.5);
        this.levelSelectButton.setInteractive();
        this.levelSelectButton.on('pointerdown', () => this.showLevelSelect());
        
        // Bottom row buttons
        this.prevLevelButton = this.add.text(effectiveCenterX - buttonSpacing/2, buttonY2, '← Previous Level', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#FFCC00',
            padding: padding
        }).setOrigin(0.5);
        this.prevLevelButton.setInteractive();
        this.prevLevelButton.on('pointerdown', () => this.goToPreviousLevel());
        
        this.nextLevelButton = this.add.text(effectiveCenterX + buttonSpacing/2, buttonY2, 'Next Level →', {
            fontSize: fontSize,
            color: '#000000',
            backgroundColor: '#00CC00',
            padding: padding
        }).setOrigin(0.5);
        this.nextLevelButton.setInteractive();
        this.nextLevelButton.on('pointerdown', () => this.goToNextLevel());
        
        // Win text - centered in the middle of the screen
        this.winText = this.add.text(effectiveCenterX, effectiveGameHeight / 2, '', {
            fontSize: isMobile ? '16px' : '18px',
            color: '#00FF00',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: (isMobile ? gameWidth : gameWidth / zoom) - 40, useAdvancedWrap: true }
        }).setOrigin(0.5);
        
        // Add instructions at the bottom (responsive positioning)
        const instructionY = effectiveGameHeight - (isMobile ? 80 : 70);
        const instructionFontSize = isMobile ? '14px' : '12px';
        const instructionSpacing = isMobile ? 18 : 15;
        
        if (isMobile) {
            this.add.text(effectiveCenterX, instructionY, 'Swipe to Move', {
                fontSize: instructionFontSize,
                color: '#CCCCCC',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            this.add.text(effectiveCenterX, instructionY + instructionSpacing, 'Push crates onto targets to win!', {
                fontSize: '12px',
                color: '#AAAAAA'
            }).setOrigin(0.5);
            
            this.add.text(effectiveCenterX, instructionY + instructionSpacing * 2, '↑ ↓ ← → Swipe in any direction', {
                fontSize: '10px',
                color: '#888888'
            }).setOrigin(0.5);
        } else {
            this.add.text(effectiveCenterX, instructionY, 'Use Arrow Keys to Move', {
                fontSize: instructionFontSize,
                color: '#CCCCCC'
            }).setOrigin(0.5);
            
            this.add.text(effectiveCenterX, instructionY + instructionSpacing, 'Push crates onto targets to win!', {
                fontSize: '11px',
                color: '#AAAAAA'
            }).setOrigin(0.5);
            
            this.add.text(effectiveCenterX, instructionY + instructionSpacing * 2, 'R: Reset | N: Next | P: Previous', {
                fontSize: '10px',
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
        // Setup swipe gestures only - no on-screen buttons
        this.setupSwipeGestures();
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

    private movePlayer(deltaX: number, deltaY: number) {
        if (this.gameWon) return;
        
        const currentX = this.player.getData('gridX');
        const currentY = this.player.getData('gridY');
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        
        // Update player direction based on movement
        if (deltaX > 0) this.playerDirection = 'right';
        else if (deltaX < 0) this.playerDirection = 'left';
        else if (deltaY > 0) this.playerDirection = 'down';
        else if (deltaY < 0) this.playerDirection = 'up';
        
        // Check if new position is valid (not a wall and within bounds)
        if (!this.isValidPosition(newX, newY)) {
            // Even if can't move, update facing direction
            this.player.play(`player-idle-${this.playerDirection}`);
            return;
        }
        
        // Play appropriate walking animation based on direction
        this.player.play(`player-walk-${this.playerDirection}`);
        
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
            } else {
                // Can't push crate, but still face that direction
                this.player.play(`player-idle-${this.playerDirection}`);
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
        
        // Animate crate movement
        this.tweens.add({
            targets: crate,
            x: this.OFFSET_X + x * this.GRID_SIZE + this.GRID_SIZE / 2,
            y: this.OFFSET_Y + y * this.GRID_SIZE + this.GRID_SIZE / 2,
            duration: 200,
            ease: 'Power2'
        });
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
            const isMobile = this.scale.width <= 500;
            
            if (isLastLevel) {
                if (isMobile) {
                    this.winText.setText('🎉 All Levels Complete! 🎉\nCongratulations!');
                } else {
                    this.winText.setText('🎉 Congratulations!\nYou completed all levels! 🎉');
                }
            } else {
                if (isMobile) {
                    this.winText.setText('🎉 Level Complete! 🎉\nSwipe or press N for next');
                } else {
                    this.winText.setText('🎉 Level Complete!\nPress N for next level 🎉');
                }
            }
            
            // Text is already centered with setOrigin(0.5) - no manual positioning needed
            // The text will automatically center itself at the position set in createUI()
            
            this.updateUI();
        }
    }

    private resetLevel() {
        this.gameWon = false;
        this.winText.setText('');
        
        // Reset player direction to default
        this.playerDirection = 'down';
        
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
        const isMobile = gameWidth < 500;
        
        // Account for camera zoom on desktop
        const zoom = this.cameras.main.zoom;
        const effectiveGameWidth = isMobile ? gameWidth : gameWidth / zoom;
        const effectiveGameHeight = isMobile ? gameHeight : gameHeight / zoom;
        const centerX = effectiveGameWidth / 2;
        const centerY = effectiveGameHeight / 2;
        
        // Create a level selection overlay - responsive sizing
        const overlayWidth = Math.min(effectiveGameWidth * 0.9, isMobile ? 350 : 320);
        const overlayHeight = Math.min(effectiveGameHeight * 0.8, isMobile ? 400 : 500);
        
        const overlay = this.add.rectangle(centerX, centerY, overlayWidth, overlayHeight, 0x000000, 0.8);
        const title = this.add.text(centerX, centerY - overlayHeight/2 + 40, 'Select Level', {
            fontSize: isMobile ? '24px' : '20px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const levels = this.levelManager.getAllLevels();
        const buttonsPerRow = isMobile ? 1 : 2; // Single column on mobile, two on desktop
        const buttonWidth = isMobile ? 180 : 140;
        const buttonHeight = isMobile ? 60 : 60;
        const buttonSpacingX = isMobile ? 0 : 30;
        const buttonSpacingY = isMobile ? 20 : 25;
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
                fontSize: isMobile ? '14px' : '12px',
                color: textColor,
                backgroundColor: backgroundColor,
                padding: { x: isMobile ? 15 : 12, y: isMobile ? 10 : 8 },
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
            fontSize: isMobile ? '18px' : '16px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: isMobile ? 20 : 20, y: isMobile ? 10 : 8 }
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
        
        // Animate player movement
        this.tweens.add({
            targets: this.player,
            x: this.OFFSET_X + x * this.GRID_SIZE + this.GRID_SIZE / 2,
            y: this.OFFSET_Y + y * this.GRID_SIZE + this.GRID_SIZE / 2,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Return to idle animation but keep facing the same direction
                this.player.play(`player-idle-${this.playerDirection}`);
            }
        });
    }
}
