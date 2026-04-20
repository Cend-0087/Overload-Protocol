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
    
    // Загрузка уровня
    loadLevel(levelNumber) {
        console.log(`[LevelManager] Загрузка уровня ${levelNumber}`);
        
        // Очищаем текущий уровень
        this.clearCurrentLevel();
        
        // Загружаем новый уровень
        if (levelNumber === 1) {
            this.loadLevel1();
        } else if (levelNumber === 2) {
            this.loadLevel2();
        }
        
        this.currentLevel = levelNumber;
    }
    
    // Очистка текущего уровня
    clearCurrentLevel() {
        // Удаляем стены
        if (this.levelObjects.walls) {
            this.levelObjects.walls.forEach(wall => {
                if (wall && wall.destroy) wall.destroy();
            });
        }
        
        // Удаляем предметы
        if (this.levelObjects.items) {
            this.levelObjects.items.forEach(item => {
                if (item && item.graphics) item.graphics.destroy();
            });
        }
        
        // Удаляем переходные зоны
        if (this.levelObjects.transitionZones) {
            this.levelObjects.transitionZones.forEach(zone => {
                if (zone && zone.deactivate) zone.deactivate();
            });
        }
        
        // Очищаем память
        if (this.scene.memoryPoints) {
            this.scene.memoryPoints.clear(true, true);
        }
        if (this.scene.memorySystem) {
            this.scene.memorySystem.clear();
        }
        
        // Сбрасываем массивы
        this.levelObjects = {
            walls: [],
            items: [],
            transitionZones: [],
            memoryPoints: []
        };
    }
    
    // Уровень 1 (начальный)
    loadLevel1() {
        // Загружаем стены из WallManager
        const wallManager = new WallManager(this.scene, WallManager.getDefaultWalls());
        const walls = wallManager.create();
        walls.getChildren().forEach(wall => {
            this.levelObjects.walls.push(wall);
        });
        
        // Добавляем предметы
        const testItem = new PickupItem(this.scene, 600, 500);
        this.levelObjects.items.push(testItem);
        
        // Добавляем переходную зону (в правом нижнем углу)
        const transitionZone = new TransitionZone(this.scene, 1370, 350, 300, 300, 2);
        this.levelObjects.transitionZones.push(transitionZone);
        
        // Сохраняем ссылки в сцене
        this.scene.walls = this.scene.physics.add.staticGroup();
        this.levelObjects.walls.forEach(wall => {
            this.scene.walls.add(wall);
        });
        this.scene.items = this.levelObjects.items;
        this.scene.transitionZones = this.levelObjects.transitionZones;
        
        // Настраиваем коллизию
        this.scene.physics.add.collider(this.scene.player, this.scene.walls);
    }
    
    // Уровень 2
    loadLevel2() {
        console.log('[LevelManager] Загрузка уровня 2');
        
        // Создаем стены для уровня 2 (пример)
        const wallsData = [
            // Внешние границы
            { x: 100, y: 100, width: 20, height: 1000, color: 0x444444 },
            { x: 3700, y: 100, width: 20, height: 1000, color: 0x444444 },
            { x: 100, y: 100, width: 3620, height: 20, color: 0x444444 },
            { x: 100, y: 1080, width: 3620, height: 20, color: 0x444444 },
            
            // Лабиринт для уровня 2
            { x: 800, y: 300, width: 20, height: 400, color: 0x444444 },
            { x: 1500, y: 500, width: 400, height: 20, color: 0x444444 },
            { x: 2200, y: 300, width: 20, height: 400, color: 0x444444 },
            { x: 2800, y: 600, width: 400, height: 20, color: 0x444444 },
        ];
        
        const wallManager = new WallManager(this.scene, wallsData);
        const walls = wallManager.create();
        walls.getChildren().forEach(wall => {
            this.levelObjects.walls.push(wall);
        });
        
        // Добавляем предметы для уровня 2
        const item1 = new PickupItem(this.scene, 1200, 500);
        const item2 = new PickupItem(this.scene, 2500, 400);
        this.levelObjects.items.push(item1, item2);
        
        // Добавляем переходную зону обратно на уровень 1
        const transitionZone = new TransitionZone(this.scene, 1370, 350, 300, 300, 1);
        this.levelObjects.transitionZones.push(transitionZone);
        
        // Сохраняем ссылки в сцене
        this.scene.walls = this.scene.physics.add.staticGroup();
        this.levelObjects.walls.forEach(wall => {
            this.scene.walls.add(wall);
        });
        this.scene.items = this.levelObjects.items;
        this.scene.transitionZones = this.levelObjects.transitionZones;
        
        // Настраиваем коллизию
        this.scene.physics.add.collider(this.scene.player, this.scene.walls);
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
}

// Экспорт
window.LevelManager = LevelManager;