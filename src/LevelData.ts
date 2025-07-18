interface LevelData {
    id: number;
    name: string;
    width: number;
    height: number;
    playerStart: { x: number, y: number };
    crates: { x: number, y: number }[];
    targets: { x: number, y: number }[];
    walls: { x: number, y: number }[];
}

const LEVELS: LevelData[] = [
    {
        id: 1,
        name: "First Steps",
        width: 8,
        height: 6,
        playerStart: { x: 1, y: 1 },
        crates: [
            { x: 2, y: 2 },
            { x: 3, y: 2 }
        ],
        targets: [
            { x: 5, y: 2 },
            { x: 6, y: 2 }
        ],
        walls: [
            // Outer walls
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
            { x: 0, y: 1 }, { x: 7, y: 1 },
            { x: 0, y: 2 }, { x: 7, y: 2 },
            { x: 0, y: 3 }, { x: 7, y: 3 },
            { x: 0, y: 4 }, { x: 7, y: 4 },
            { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }
        ]
    },
    {
        id: 2,
        name: "Around the Corner",
        width: 9,
        height: 7,
        playerStart: { x: 1, y: 1 },
        crates: [
            { x: 3, y: 2 },
            { x: 4, y: 3 },
            { x: 5, y: 2 }
        ],
        targets: [
            { x: 6, y: 1 },
            { x: 7, y: 1 },
            { x: 7, y: 2 }
        ],
        walls: [
            // Outer walls
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 0, y: 1 }, { x: 8, y: 1 },
            { x: 0, y: 2 }, { x: 8, y: 2 },
            { x: 0, y: 3 }, { x: 8, y: 3 },
            { x: 0, y: 4 }, { x: 8, y: 4 },
            { x: 0, y: 5 }, { x: 8, y: 5 },
            { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
            // Inner obstacle
            { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }
        ]
    },
    {
        id: 3,
        name: "Tight Squeeze",
        width: 10,
        height: 8,
        playerStart: { x: 1, y: 6 },
        crates: [
            { x: 2, y: 5 },
            { x: 3, y: 4 },
            { x: 4, y: 3 },
            { x: 5, y: 2 }
        ],
        targets: [
            { x: 7, y: 1 },
            { x: 8, y: 1 },
            { x: 8, y: 2 },
            { x: 8, y: 3 }
        ],
        walls: [
            // Outer walls
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 },
            { x: 0, y: 1 }, { x: 9, y: 1 },
            { x: 0, y: 2 }, { x: 9, y: 2 },
            { x: 0, y: 3 }, { x: 9, y: 3 },
            { x: 0, y: 4 }, { x: 9, y: 4 },
            { x: 0, y: 5 }, { x: 9, y: 5 },
            { x: 0, y: 6 }, { x: 9, y: 6 },
            { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 },
            // L-shaped inner walls
            { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
            { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
        ]
    }
];

export type { LevelData };
export { LEVELS };
