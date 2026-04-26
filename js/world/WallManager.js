class WallManager {
    constructor(scene, wallsData) {
        this.scene = scene;
        this.wallsData = wallsData;
        this.walls = null;
        this.doors = [];
    }
    
    create() {
        this.walls = this.scene.physics.add.staticGroup();
        
        this.wallsData.forEach(data => {
            const wall = this.scene.add.rectangle(data.x, data.y, data.width, data.height, data.color);
            this.scene.physics.add.existing(wall, true);
            this.walls.add(wall);
            
            if (data.isDoor) {
                console.log(`[WallManager] Door registered: ${data.doorId} at (${data.x}, ${data.y})`);
                this.doors.push({
                    id: data.doorId,
                    wall: wall,
                    x: data.x,
                    y: data.y,
                    width: data.width,
                    height: data.height
                });
            }
        });
        
        console.log(`[WallManager] Total doors registered: ${this.doors.length}`);
        return this.walls;
    }
    
    openDoor(doorId) {
        console.log(`[WallManager] Looking for door: ${doorId}`);
        console.log(`[WallManager] Available doors:`, this.doors.map(d => d.id));
        
        const door = this.doors.find(d => d.id === doorId);
        if (door && door.wall && door.wall.active) {
            door.wall.destroy();
            console.log(`[WallManager] Door "${doorId}" opened successfully`);
            return true;
        }
        console.log(`[WallManager] Door "${doorId}" not found or already destroyed`);
        return false;
    }
    
    getWalls() {
        return this.walls;
    }
    
    static getDefaultWalls() {
        const WALL_COLOR = 0x0a0a0a;
        
        return [ 
            // Locked Doors for level 1
            { 
                x: 1370, y: 450, width: 340, height: 20, 
                color: WALL_COLOR, 
                isDoor: true, 
                doorId: "door_main_1" 
            },
            { 
                x: 2570, y: 530, width: 340, height: 20, 
                color: WALL_COLOR, 
                isDoor: true, 
                doorId: "door_main_2" 
            },
            
            // Top part
            { x: 2000, y: 160, width: 1600, height: 20,  color: WALL_COLOR },
            { x: 2700, y: 600, width: 20,  height: 1000, color: WALL_COLOR },
            { x: 1550, y: 330, width: 20,  height: 420, color: WALL_COLOR },
            { x: 2400, y: 330, width: 20,  height: 420, color: WALL_COLOR },
            { x: 2470, y: 530, width: 150, height: 20,  color: WALL_COLOR },
            { x: 400, y: 100, width: 700, height: 20,  color: WALL_COLOR },
            { x: 400, y: 450, width: 600, height: 20,  color: WALL_COLOR },
            { x: 40, y: 600, width: 20,  height: 1000, color: WALL_COLOR },
            { x: 600, y: 690, width: 800, height: 20, color: WALL_COLOR },
            { x: 700, y: 1000+5, width: 20,  height: 640, color: WALL_COLOR },
            { x: 1350, y: 1000+5, width: 20,  height: 640, color: WALL_COLOR },
            { x: 1400, y: 1100, width: 2800, height: 20, color: WALL_COLOR },
            { x: 1300, y: 690, width: 300, height: 20, color: WALL_COLOR },
            { x: 2100, y: 690, width: 850, height: 20, color: WALL_COLOR },
            { x: 825, y: 160, width: 230, height: 20,  color: WALL_COLOR },
            { x: 950, y: 330, width: 20,  height: 420, color: WALL_COLOR },
            { x: 870, y: 450, width: 150, height: 20,  color: WALL_COLOR },
            { x: 700, y: 300, width: 20,  height: 480, color: WALL_COLOR },
            { x: 825+250, y: 160, width: 230, height: 20,  color: WALL_COLOR },
            { x: 950+250, y: 330, width: 20,  height: 420, color: WALL_COLOR },
            { x: 870+250, y: 450, width: 150, height: 20,  color: WALL_COLOR },
            { x: 700+250, y: 300, width: 20,  height: 480, color: WALL_COLOR },
        ];
    }
}

window.WallManager = WallManager;