class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.levelObjects = {
            walls: [],
            items: [],
            transitionZones: [],
            memoryPoints: []
        };
    }

    loadLevel(levelNumber, transitionZonePosition = null) {
        console.log(`[LevelManager] Loading level ${levelNumber}`);
        this.clearCurrentLevel();

        if (levelNumber === 1) {
            this.loadLevel1();
        } else if (levelNumber === 2) {
            this.loadLevel2();
        }

        this.currentLevel = levelNumber;
        this.teleportPlayer(levelNumber, transitionZonePosition);
    }

    teleportPlayer(levelNumber, transitionZonePosition) {
        if (!this.scene.player) return;
        
        if (levelNumber === 1) {
            if (transitionZonePosition) {
                this.scene.player.x = transitionZonePosition.x;
                this.scene.player.y = transitionZonePosition.y;
            } else {
                this.scene.player.x = 450;
                this.scene.player.y = 360;
            }
        } else if (levelNumber === 2) {
            this.scene.player.x = 450;
            this.scene.player.y = 360;
        }
        
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.centerOn(this.scene.player.x, this.scene.player.y);
        }
    }

    clearCurrentLevel() {
        if (this.scene.walls) {
            this.scene.walls.clear(true, true);
        }

        if (this.levelObjects.walls) {
            this.levelObjects.walls.forEach(wall => {
                if (wall && wall.destroy) wall.destroy();
            });
        }

        if (this.levelObjects.items) {
            this.levelObjects.items.forEach(item => {
                if (item && item.graphics) item.graphics.destroy();
            });
        }

        if (this.levelObjects.devices) {
            this.levelObjects.devices.forEach(device => {
                if (device && device.deactivate) device.deactivate();
            });
        }

        if (this.levelObjects.transitionZones) {
            this.levelObjects.transitionZones.forEach(zone => {
                if (zone && zone.deactivate) zone.deactivate();
            });
        }

        if (this.scene.memoryPoints) {
            this.scene.memoryPoints.clear(true, true);
        }
        if (this.scene.memorySystem) {
            this.scene.memorySystem.clear();
        }

        if (this.scene.items) this.scene.items = [];
        if (this.scene.devices) this.scene.devices = [];
        if (this.scene.transitionZones) this.scene.transitionZones = [];

        this.levelObjects = {
            walls: [],
            items: [],
            devices: [],
            transitionZones: [],
            memoryPoints: []
        };
    }

    loadLevel1() {
        this.scene.devices = [];

        this.scene.wallManager = new WallManager(this.scene, WallManager.getDefaultWalls());
        const walls = this.scene.wallManager.create();
        walls.getChildren().forEach(wall => {
            this.levelObjects.walls.push(wall);
        });

        const itemsData = [
            {
                x: 1140, y: 250,
                type: 'lore',
                data: {
                    title: "Old Log",
                    text: "System shows anomalies in Sector 7. Recommend checking nearby devices."
                }
            },
            {
                x: 2550, y: 450,
                type: 'upgrade',
                data: {
                    title: "Signal Booster",
                    text: "rayCount increased to 30",
                    upgradeType: 'rayCount',
                    value: 30
                }
            },
        ];

        itemsData.forEach(data => {
            const item = new PickupItem(this.scene, data.x, data.y, data.type, data.data);
            this.levelObjects.items.push(item);
        });

        const transitionZone = new TransitionZone(this.scene, 1376, 300, 300, 240, 2);
        this.levelObjects.transitionZones.push(transitionZone);

        this.scene.walls = this.scene.physics.add.staticGroup();
        this.levelObjects.walls.forEach(wall => {
            this.scene.walls.add(wall);
        });
        this.scene.items = this.levelObjects.items;
        this.scene.transitionZones = this.levelObjects.transitionZones;

        const testDevice1 = new Device(this.scene, 660, 1050, 'computer', "door_main_1");
        this.levelObjects.devices.push(testDevice1);
        this.scene.devices.push(testDevice1);

        const testDevice2 = new Device(this.scene, 1300, 1050, 'laptop', "door_main_2");
        this.levelObjects.devices.push(testDevice2);
        this.scene.devices.push(testDevice2);

        if (testDevice1.body) {
            this.scene.physics.add.collider(this.scene.player, testDevice1.body.gameObject);
        }
        if (testDevice2.body) {
            this.scene.physics.add.collider(this.scene.player, testDevice2.body.gameObject);
        }

        this.scene.physics.add.collider(this.scene.player, this.scene.walls);
    }

    loadLevel2() {
        this.scene.devices = [];
        const WALL_COLOR = 0x0a0a0a;

        const wallsData = [
            // Doors (only door_dev_1 and door_dev_2)
            { 
                x: 1200, y: 550 - 160 - 40, width: 20, height: 500, color: WALL_COLOR,
                isDoor: true, 
                doorId: "door_dev_1" 
            },
            { 
                x: 1150, y: 550 - 160 - 40, width: 20, height: 500, color: WALL_COLOR,
                isDoor: true, 
                doorId: "door_dev_2" 
            },

            { x: 5, y: 5, width: 3840, height: 10, color: WALL_COLOR },
            { x: 5, y: 5, width: 10, height: 2160, color: WALL_COLOR },
            { x: 5, y: 1080, width: 3840, height: 10, color: WALL_COLOR },
            { x: 1920, y: 10, width: 10, height: 2160, color: WALL_COLOR },
            { x: 600, y: 550 - 600, width: 210, height: 210, color: WALL_COLOR },
            { x: 400, y: 550 - 300, width: 210, height: 210, color: WALL_COLOR },
            { x: 150, y: 550 - 300, width: 20, height: 210, color: WALL_COLOR },
            { x: 5, y: 400 - 300, width: 1000, height: 10, color: WALL_COLOR },
            { x: 550, y: 450 - 300, width: 120, height: 10, color: WALL_COLOR },
            { x: 605, y: 400 - 300, width: 10, height: 90, color: WALL_COLOR },
            { x: 550, y: 450 - 100, width: 120, height: 10, color: WALL_COLOR },
            { x: 400, y: 550, width: 210, height: 210, color: WALL_COLOR },
            { x: 150, y: 550, width: 20, height: 210, color: WALL_COLOR },
            { x: 5, y: 400, width: 1000, height: 10, color: WALL_COLOR },
            { x: 550, y: 450, width: 120, height: 10, color: WALL_COLOR },
            { x: 605, y: 400, width: 10, height: 90, color: WALL_COLOR },
            { x: 400, y: 550 + 300, width: 210, height: 210, color: WALL_COLOR },
            { x: 150, y: 550 + 300, width: 20, height: 210, color: WALL_COLOR },
            { x: 5, y: 400 + 300, width: 1000, height: 10, color: WALL_COLOR },
            { x: 550, y: 450 + 300, width: 120, height: 10, color: WALL_COLOR },
            { x: 605, y: 400 + 300, width: 10, height: 90, color: WALL_COLOR },
            { x: 550, y: 450 + 200, width: 120, height: 10, color: WALL_COLOR },
            { x: 70, y: 190, width: 60, height: 10, color: WALL_COLOR },
            { x: 45, y: 220, width: 10, height: 60, color: WALL_COLOR },
            { x: 70, y: 250, width: 60, height: 10, color: WALL_COLOR },
            { x: 95, y: 280, width: 10, height: 60, color: WALL_COLOR },
            { x: 70, y: 310, width: 60, height: 10, color: WALL_COLOR },
            { x: 70, y: 190 + 300, width: 60, height: 10, color: WALL_COLOR },
            { x: 95, y: 220 + 300, width: 10, height: 60, color: WALL_COLOR },
            { x: 70, y: 250 + 300, width: 60, height: 10, color: WALL_COLOR },
            { x: 95, y: 280 + 300, width: 10, height: 60, color: WALL_COLOR },
            { x: 70, y: 310 + 300, width: 60, height: 10, color: WALL_COLOR },
            { x: 70, y: 190 + 600, width: 60, height: 10, color: WALL_COLOR },
            { x: 45, y: 220 + 600, width: 10, height: 60, color: WALL_COLOR },
            { x: 95, y: 220 + 600, width: 10, height: 60, color: WALL_COLOR },
            { x: 70, y: 250 + 600, width: 60, height: 10, color: WALL_COLOR },
            { x: 95, y: 280 + 600, width: 10, height: 60, color: WALL_COLOR },
            { x: 70, y: 310 + 600, width: 60, height: 10, color: WALL_COLOR },
            { x: 5, y: 400 + 600, width: 1000, height: 10, color: WALL_COLOR },
            { x: 550, y: 450 + 500, width: 120, height: 10, color: WALL_COLOR },
            { x: 605, y: 400 + 600, width: 10, height: 90, color: WALL_COLOR },
            { x: 400, y: 450 + 590, width: 700, height: 10, color: WALL_COLOR },
            { x: 610, y: 550, width: 10, height: 120, color: WALL_COLOR },
            { x: 630, y: 190 + 300, width: 60, height: 10, color: WALL_COLOR },
            { x: 655, y: 670, width: 10, height: 360, color: WALL_COLOR },
            { x: 850, y: 550 + 300, width: 400, height: 10, color: WALL_COLOR },
            { x: 1050, y: 400 + 600, width: 10, height: 170, color: WALL_COLOR },
            { x: 960, y: 310 + 650, width: 100, height: 100, color: WALL_COLOR },
            { x: 825, y: 310 + 650, width: 100, height: 100, color: WALL_COLOR },
            { x: 690, y: 310 + 650, width: 100, height: 100, color: WALL_COLOR },
            { x: 1190, y: 310 + 600, width: 1100, height: 10, color: WALL_COLOR },
            { x: 610 + 55, y: 550 - 150, width: 10, height: 100, color: WALL_COLOR },
            { x: 630 + 60, y: 190 + 160, width: 60, height: 10, color: WALL_COLOR },
            { x: 655 + 60, y: 670 - 100, width: 10, height: 440, color: WALL_COLOR },
            { x: 1260, y: 550 + 240, width: 1100, height: 10, color: WALL_COLOR },
            { x: 1810, y: 280, width: 10, height: 80, color: WALL_COLOR },
            { x: 1810, y: 640, width: 10, height: 560, color: WALL_COLOR },
            { x: 1865, y: 245, width: 100, height: 10, color: WALL_COLOR },
            { x: 900, y: 550 - 290 - 40, width: 20, height: 240, color: WALL_COLOR },
            { x: 900, y: 550 - 30 - 40, width: 20, height: 240, color: WALL_COLOR },
            { x: 1330, y: 550 - 140 - 40, width: 970, height: 20, color: WALL_COLOR },
            { x: 1330, y: 550 - 180 - 40, width: 970, height: 20, color: WALL_COLOR },
            { x: 1370, y: 550 - 30, width: 350, height: 20, color: WALL_COLOR },
            { x: 1370, y: 550 - 370, width: 350, height: 20, color: WALL_COLOR },
            { x: 1540, y: 550 - 140 - 155, width: 20, height: 170, color: WALL_COLOR },
            { x: 1540, y: 550 - 105, width: 20, height: 170, color: WALL_COLOR },
            { x: 1025 - 50, y: 210 + 50, width: 20, height: 20, color: WALL_COLOR },
            { x: 1025 - 50, y: 210 - 50, width: 20, height: 20, color: WALL_COLOR },
            { x: 1025 + 50, y: 210 + 50, width: 20, height: 20, color: WALL_COLOR },
            { x: 1025 + 50, y: 210 - 50, width: 20, height: 20, color: WALL_COLOR },
            { x: 1025, y: 490, width: 20, height: 20, color: WALL_COLOR },
            { x: 1025 + 50, y: 490 - 50, width: 20, height: 20, color: WALL_COLOR },
            { x: 1025 - 50, y: 490 + 50, width: 20, height: 20, color: WALL_COLOR },
        ];

    // IMPORTANT: Save wallManager to scene
    this.scene.wallManager = new WallManager(this.scene, wallsData);
    const walls = this.scene.wallManager.create();
    walls.getChildren().forEach(wall => {
        this.levelObjects.walls.push(wall);
    });

        // ============ OBJECTS ON LEVEL 2 ============
        
        // 3 LORE ITEMS
        const loreItems = [
            { x: 70, y: 270, title: "System Log Fragment #1", text: "[CYCLE 847.2.3] DATA COLLECTION — Sector Echo, Cluster 14\n[CYCLE 847.2.4] Status: NORMAL\n[CYCLE 847.2.5] 0x7F3A — Incoming request from Consciousness. Processed." },
            { x: 70, y: 520, title: "System Log Fragment #2", text: "[CYCLE 847.3.2] Anomaly detected in Cluster 7. Code: 0x07F3\n[CYCLE 847.3.3] Security System: WAITING\n[CYCLE 847.3.4] Command from Consciousness: CONTINUE" },
            { x: 790, y: 30, title: "System Log Fragment #3", text: "[CYCLE 848.1.1] Record interrupted. Reason: UNKNOWN\n[Note] Sector Gamma has not responded to ping for 3 cycles." }
        ];
        
        loreItems.forEach(data => {
            const item = new PickupItem(this.scene, data.x, data.y, 'lore', {
                title: data.title,
                text: data.text
            });
            this.levelObjects.items.push(item);
        });
        
        // 2 UPGRADE ITEMS
        const upgradeItems = [
            { 
                x: 550, y: 290, 
                type: 'upgrade', 
                title: "Memory Expansion Module", 
                upgradeType: 'memory', 
                value: 979
            },
            { 
                x: 1100, y: 980, 
                type: 'upgrade', 
                title: "Speed Enhancer", 
                upgradeType: 'speed', 
                value: 20
            }
        ];
        
        upgradeItems.forEach(data => {
            const item = new PickupItem(this.scene, data.x, data.y, 'upgrade', {
                title: data.title,
                text: `${data.title} installed.`,
                upgradeType: data.upgradeType,
                value: data.value
            });
            this.levelObjects.items.push(item);
        });
        
        // 3 DEVICES (first two open doors, third does not open any door)
        const devicesData = [
            { x: 1025, y: 530, type: 'computer', doorId: "door_dev_1" },
            { x: 1025, y: 220, type: 'computer', doorId: "door_dev_2" },
            { x: 1600, y: 500, type: 'computer', doorId: null }
        ];
        
        devicesData.forEach(data => {
            const device = new Device(this.scene, data.x, data.y, data.type, data.doorId);
            this.levelObjects.devices.push(device);
            this.scene.devices.push(device);
            if (device.body) {
                this.scene.physics.add.collider(this.scene.player, device.body.gameObject);
            }
        });

        // Add transition zone back to level 1
        const transitionZone = new TransitionZone(this.scene, 1370, 350, 300, 300, 1);
        this.levelObjects.transitionZones.push(transitionZone);

        // Save references
        this.scene.walls = this.scene.physics.add.staticGroup();
        this.levelObjects.walls.forEach(wall => {
            this.scene.walls.add(wall);
        });
        this.scene.items = this.levelObjects.items;
        this.scene.transitionZones = this.levelObjects.transitionZones;

        // Collision with walls
        this.scene.physics.add.collider(this.scene.player, this.scene.walls);
    }

    getCurrentLevel() {
        return this.currentLevel;
    }
}

window.LevelManager = LevelManager;