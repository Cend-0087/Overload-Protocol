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
    // Очищаем физическую группу стен
    if (this.scene.walls) {
        this.scene.walls.clear(true, true);
    }
    
    // Удаляем стены из массива
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
    
    // Удаляем устройства
    if (this.levelObjects.devices) {
        this.levelObjects.devices.forEach(device => {
            if (device && device.deactivate) device.deactivate();
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
    
    // Очищаем массивы в сцене
    if (this.scene.items) this.scene.items = [];
    if (this.scene.devices) this.scene.devices = [];
    if (this.scene.transitionZones) this.scene.transitionZones = [];
    
    // Сбрасываем массивы levelObjects
    this.levelObjects = {
        walls: [],
        items: [],
        devices: [],
        transitionZones: [],
        memoryPoints: []
    };
}

// Уровень 1 (начальный)
loadLevel1() {
    this.scene.devices = [];
    
    // Загружаем стены из WallManager
    const wallManager = new WallManager(this.scene, WallManager.getDefaultWalls());
    const walls = wallManager.create();
    walls.getChildren().forEach(wall => {
        this.levelObjects.walls.push(wall);
    });

    // Добавляем предметы
    const testItem = new PickupItem(this.scene, 600, 500);
    this.levelObjects.items.push(testItem);

    // Добавляем переходную зону
    const transitionZone = new TransitionZone(this.scene, 1370, 350, 300, 300, 2);
    this.levelObjects.transitionZones.push(transitionZone);

    // Сохраняем ссылки в сцене
    this.scene.walls = this.scene.physics.add.staticGroup();
    this.levelObjects.walls.forEach(wall => {
        this.scene.walls.add(wall);
    });
    this.scene.items = this.levelObjects.items;
    this.scene.transitionZones = this.levelObjects.transitionZones;

    // СОЗДАЕМ УСТРОЙСТВО
    const testDevice = new Device(this.scene, 700, 650, 'computer');
    this.levelObjects.devices.push(testDevice);
    this.scene.devices.push(testDevice);
    
    // ДОБАВЛЯЕМ КОЛЛИЗИЮ С УСТРОЙСТВОМ
    if (testDevice.body) {
        this.scene.physics.add.collider(this.scene.player, testDevice.body.gameObject);
    }

    // Настраиваем коллизию со стенами
    this.scene.physics.add.collider(this.scene.player, this.scene.walls);
}

// Уровень 2
loadLevel2() {
    this.scene.devices = [];
    console.log('[LevelManager] Загрузка уровня 2');

    // Создаем стены для уровня 2
    const wallsData = [
        { x: 100, y: 100, width: 20, height: 1000, color: 0x444444 },
        { x: 3700, y: 100, width: 20, height: 1000, color: 0x444444 },
        { x: 100, y: 100, width: 3620, height: 20, color: 0x444444 },
        { x: 100, y: 1080, width: 3620, height: 20, color: 0x444444 },
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

    // ДОБАВЛЯЕМ УСТРОЙСТВО ДЛЯ УРОВНЯ 2
    const testDevice2 = new Device(this.scene, 1800, 550, 'laptop');
    this.levelObjects.devices.push(testDevice2);
    this.scene.devices.push(testDevice2);
    
    // ДОБАВЛЯЕМ КОЛЛИЗИЮ С УСТРОЙСТВОМ
    if (testDevice2.body) {
        this.scene.physics.add.collider(this.scene.player, testDevice2.body.gameObject);
    }

    // Настраиваем коллизию со стенами
    this.scene.physics.add.collider(this.scene.player, this.scene.walls);
}

    getCurrentLevel() {
        return this.currentLevel;
    }
}

// Экспорт
window.LevelManager = LevelManager;