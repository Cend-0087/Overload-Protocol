class WallManager {
    constructor(scene, wallsData) {
        this.scene = scene;
        this.wallsData = wallsData;
        this.walls = null;
    }
    
    create() {
        this.walls = this.scene.physics.add.staticGroup();
        
        this.wallsData.forEach(data => {
            const wall = this.scene.add.rectangle(data.x, data.y, data.width, data.height, data.color);
            this.scene.physics.add.existing(wall, true);
            this.walls.add(wall);
        });
        
        return this.walls;
    }
    
    getWalls() {
        return this.walls;
    }
    
    static getDefaultWalls() {
        return [ 
            // Последовательность структур по часовой стрелке начиная сверху.
            
            // Стены не входящие в структуры:

            // Верхняя часть
            { x: 2000, y: 160, width: 1600, height: 20,  color: 0x0a0a0a }, // сделать невидимым: 0x0a0a0a
            { x: 2700, y: 600, width: 20,  height: 1000, color: 0x0a0a0a },
            { x: 1550, y: 330, width: 20,  height: 420, color: 0x0a0a0a },
            { x: 2400, y: 330, width: 20,  height: 420, color: 0x0a0a0a },
            { x: 2470, y: 530, width: 150, height: 20,  color: 0x0a0a0a },

            { x: 400, y: 100, width: 700, height: 20,  color: 0x0a0a0a },
            { x: 400, y: 450, width: 600, height: 20,  color: 0x0a0a0a },
            { x: 40, y: 600, width: 20,  height: 1000, color: 0x0a0a0a },
            { x: 600, y: 690, width: 800, height: 20, color: 0x0a0a0a },

            // Нижняя часть
            { x: 700, y: 1000+5, width: 20,  height: 640, color: 0x0a0a0a },
            { x: 1350, y: 1000+5, width: 20,  height: 640, color: 0x0a0a0a },
            { x: 1400, y: 1100, width: 2800, height: 20, color: 0x0a0a0a }, // Нижняя длинная стена
            { x: 1300, y: 690, width: 300, height: 20, color: 0x0a0a0a },
            { x: 2100, y: 690, width: 850, height: 20, color: 0x0a0a0a },


            // СТРУКТУРЫ
            // малая комната:
            { x: 825, y: 160, width: 230, height: 20,  color: 0x0a0a0a },
            { x: 950, y: 330, width: 20,  height: 420, color: 0x0a0a0a },
            { x: 870, y: 450, width: 150, height: 20,  color: 0x0a0a0a },
            { x: 700, y: 300, width: 20,  height: 480, color: 0x0a0a0a },


            // малая комната 2:
            { x: 825+250, y: 160, width: 230, height: 20,  color: 0x0a0a0a },
            { x: 950+250, y: 330, width: 20,  height: 420, color: 0x0a0a0a },
            { x: 870+250, y: 450, width: 150, height: 20,  color: 0x0a0a0a },
            { x: 700+250, y: 300, width: 20,  height: 480, color: 0x0a0a0a },
        ];
    }
}