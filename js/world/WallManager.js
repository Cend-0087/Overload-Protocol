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
            { x: 700, y: 300, width: 20,  height: 400, color: 0x444444 },
            { x: 400, y: 100, width: 300, height: 20,  color: 0x444444 },
            { x: 950, y: 500, width: 20,  height: 300, color: 0x444444 },
            { x: 1500, y: 800, width: 400, height: 40, color: 0x444444 },
            { x: 2000, y: 200, width: 50, height: 600, color: 0x444444 }
        ];
    }
}