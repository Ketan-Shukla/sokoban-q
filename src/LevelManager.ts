import type { LevelData } from './LevelData';
import { LEVELS } from './LevelData';

export class LevelManager {
    private currentLevelIndex: number = 0;
    private completedLevels: Set<number> = new Set();

    constructor() {
        // Load progress from localStorage if available
        this.loadProgress();
    }

    getCurrentLevel(): LevelData {
        return LEVELS[this.currentLevelIndex];
    }

    getCurrentLevelIndex(): number {
        return this.currentLevelIndex;
    }

    getTotalLevels(): number {
        return LEVELS.length;
    }

    isLevelCompleted(levelIndex: number): boolean {
        return this.completedLevels.has(levelIndex);
    }

    completeCurrentLevel(): void {
        this.completedLevels.add(this.currentLevelIndex);
        this.saveProgress();
    }

    canAdvanceToNextLevel(): boolean {
        return this.currentLevelIndex < LEVELS.length - 1;
    }

    advanceToNextLevel(): boolean {
        if (this.canAdvanceToNextLevel()) {
            this.currentLevelIndex++;
            this.saveProgress();
            return true;
        }
        return false;
    }

    canGoToPreviousLevel(): boolean {
        return this.currentLevelIndex > 0;
    }

    goToPreviousLevel(): boolean {
        if (this.canGoToPreviousLevel()) {
            this.currentLevelIndex--;
            this.saveProgress();
            return true;
        }
        return false;
    }

    goToLevel(levelIndex: number): boolean {
        if (levelIndex >= 0 && levelIndex < LEVELS.length) {
            this.currentLevelIndex = levelIndex;
            this.saveProgress();
            return true;
        }
        return false;
    }

    resetProgress(): void {
        this.currentLevelIndex = 0;
        this.completedLevels.clear();
        this.saveProgress();
    }

    getProgressPercentage(): number {
        return Math.round((this.completedLevels.size / LEVELS.length) * 100);
    }

    getAllLevels(): LevelData[] {
        return [...LEVELS];
    }

    private saveProgress(): void {
        try {
            const progress = {
                currentLevelIndex: this.currentLevelIndex,
                completedLevels: Array.from(this.completedLevels)
            };
            localStorage.setItem('sokoban-progress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Could not save progress to localStorage:', error);
        }
    }

    private loadProgress(): void {
        try {
            const saved = localStorage.getItem('sokoban-progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.currentLevelIndex = progress.currentLevelIndex || 0;
                this.completedLevels = new Set(progress.completedLevels || []);
                
                // Validate loaded data
                if (this.currentLevelIndex >= LEVELS.length) {
                    this.currentLevelIndex = 0;
                }
            }
        } catch (error) {
            console.warn('Could not load progress from localStorage:', error);
            this.currentLevelIndex = 0;
            this.completedLevels.clear();
        }
    }
}
