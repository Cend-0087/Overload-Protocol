class EchoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EchoScene', active: true });

        this.gameConfig = {
            playerSpeed: 180,
            rayCount: 20,
            maxRayCount: 1000,
            maxDistance: 520,
            lineThickness: 1.8,
            lineColor: 0x00ffff,
            lineAlpha: 0.75,
            propagationTime: 300,
            fadeTime: 1100,
            cooldownTime: 0.0,
            memoryPerHit: 1,
            hitSparkRadius: 7,
            hitSparkColor: 0x88ffff,
            memoryPointMergeDistance: 3,
            cameraFollowSpeed: 0.08,
            cameraDeadZone: 120,
            worldWidth: 3840,
            worldHeight: 2160
        };
    }

    create() {
        // Инициализация систем
        this.memorySystem = new MemorySystem(this.registry);
        this.attentionSystem = new AttentionSystem(this.registry);
        this.testMode = null;

        this.memorySystem.init();
        this.attentionSystem.init();

        // Настройка мира
        this.physics.world.setBounds(0, 0, this.gameConfig.worldWidth, this.gameConfig.worldHeight);
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Создание стен ДО создания игрока
        this.wallManager = new WallManager(this, WallManager.getDefaultWalls());
        this.walls = this.wallManager.create();

        // Создание игрока ПОСЛЕ создания стен
        this.player = new Player(this, 450, 360);

        // Коллизия с устройствами добавляется в LevelManager при создании устройств


        // === INPUT MANAGER ===
        this.inputManager = new InputManager(this);
        this.inputManager.init();

        // Создаём подсказку взаимодействия [E]
        this.interactionHint = this.add.text(0, 0, '[E] Взаимодействовать', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#00ffcc',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, stroke: true, fill: true }
        })
            .setOrigin(0.5, 1)
            .setVisible(false)
            .setDepth(10000);

        // Система лидара
        this.lidarSystem = new LidarSystem(this, this.gameConfig);

        // Группа точек памяти
        this.memoryPoints = this.add.group();

        // === ПРЕДМЕТЫ ===
        this.items = [];
        this.nearItem = null;
        this.transitionZones = [];
        this.nearTransitionZone = null;

        this.devices = [];
        this.nearDevice = null;
        this.miniGameManager = new MiniGameManager(this);

        // Создаем менеджер уровней
        this.levelManager = new LevelManager(this);
        this.levelManager.loadLevel(1);

        // Ссылка на текущую зону перехода
        this.currentTransitionZone = null;
        this.pendingTransition = false;

        this.load.audio('calm', '/sounds/спокойная.mp3');
        this.load.once('complete', () => {
            console.log('Музыка загружена');
        });
        this.load.start();

        // Создаем MusicManager
        this.musicManager = new MusicManager(this);

        const openedDoors = this.registry.get('openedDoors') || [];
        if (openedDoors.length > 0 && this.wallManager) {
            openedDoors.forEach(doorId => {
                this.wallManager.openDoor(doorId);
                console.log(`[EchoScene] Дверь ${doorId} уже была открыта, удаляем`);
            });
        }

        // Ждем первое взаимодействие
        this.input.keyboard.on('keydown', () => {
            this.musicManager.startMusic();
        });

        this.input.on('pointerdown', () => {
            this.musicManager.startMusic();
        });

        // Подписка на события
        const uiScene = this.scene.get('UIScene');
        if (uiScene) {
            uiScene.events.on('command-clear', () => {
                this.memoryPoints.clear(true, true);
                this.memorySystem.clear();
            }, this);
        }

        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');



        // Разделитель интерфейса
        this.createDivider();

        // Камера
        this.setupCamera();
    }

    // ====================== ДРАГ-РАЗДЕЛИТЕЛЬ ======================
    createDivider() {
        const initialUiWidth = this.registry.get('uiWidth') || 420;
        const initialX = this.scale.width - initialUiWidth;

        this.divider = this.add.rectangle(initialX, 0, 6, this.scale.height, 0x555555)
            .setOrigin(0.5, 0)
            .setDepth(10000)
            .setScrollFactor(0)
            .setInteractive({
                hitArea: new Phaser.Geom.Rectangle(-8, 0, 22, this.scale.height),
                useHandCursor: true
            });

        this.divider.on('pointerover', () => this.divider.setFillStyle(0x00ffcc));
        this.divider.on('pointerout', () => this.divider.setFillStyle(0x555555));

        let isDragging = false;

        this.divider.on('pointerdown', (pointer) => {
            isDragging = true;
            this.divider.setFillStyle(0xffcc00);
            this.input.setDefaultCursor('col-resize');
            this.registry.set('isDraggingDivider', true);
            if (this.input.keyboard) this.input.keyboard.enabled = false;
        });

        this.input.on('pointermove', (pointer) => {
            if (!isDragging) return;
            const newUiWidth = this.scale.width - pointer.x;
            const clamped = Phaser.Math.Clamp(newUiWidth, 320, 520);
            this.registry.set('uiWidth', clamped);
            this.updateViewports();
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.updateViewports) {
                uiScene.updateViewports();
            }
        });

        this.input.on('pointerup', () => {
            if (!isDragging) return;
            isDragging = false;
            this.divider.setFillStyle(0x555555);
            this.input.setDefaultCursor('default');
            this.registry.set('isDraggingDivider', false);
            if (this.input.keyboard) this.input.keyboard.enabled = true;
        });

        this.scale.on('resize', () => {
            this.updateViewports();
        });
    }

    setupFirstInteraction() {
        let interactionHandled = false;

        const handleFirstInteraction = () => {
            if (interactionHandled) return;
            interactionHandled = true;

            console.log('Первое взаимодействие с игрой - активируем звук');

            // Инициализируем MusicManager
            if (this.musicManager) {
                this.musicManager.init();
            }

            // Удаляем обработчики после первого срабатывания
            this.input.keyboard.off('keydown', handleFirstInteraction);
            this.input.off('pointerdown', handleFirstInteraction);

            // Опционально: показать сообщение о включении звука
            const soundNotification = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                '🔊 Звук активирован',
                {
                    fontSize: '24px',
                    fontFamily: 'Courier New',
                    color: '#00ffcc',
                    backgroundColor: '#000000aa',
                    padding: { x: 20, y: 10 }
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

            this.time.delayedCall(2000, () => {
                soundNotification.destroy();
            });
        };

        // Вешаем обработчики на любые взаимодействия
        this.input.keyboard.on('keydown', handleFirstInteraction);
        this.input.on('pointerdown', handleFirstInteraction);
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true,
            this.gameConfig.cameraFollowSpeed,
            this.gameConfig.cameraFollowSpeed);
        this.cameras.main.setDeadzone(this.gameConfig.cameraDeadZone, this.gameConfig.cameraDeadZone);
        this.cameras.main.setBounds(0, 0, this.gameConfig.worldWidth, this.gameConfig.worldHeight);
    }

    handleDividerDrag(pointer) {
        if (!this.registry.get('isDraggingDivider')) return;
        const newUiWidth = this.scale.width - pointer.x;
        const clamped = Phaser.Math.Clamp(newUiWidth, 300, 600);
        this.registry.set('uiWidth', clamped);
        this.updateViewports();
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateViewports) {
            uiScene.updateViewports();
        }
    }

    updateViewports() {
        const totalWidth = this.scale.width;
        const totalHeight = this.scale.height;
        const uiWidth = this.registry.get('uiWidth');
        const echoWidth = Math.max(totalWidth - uiWidth, 400);
        this.cameras.main.setViewport(0, 0, echoWidth, totalHeight);
        if (this.divider) {
            this.divider.setPosition(echoWidth, 0);
            this.divider.setDisplaySize(6, totalHeight);
        }
    }

    update() {
        if (this.player && this.player.body && this.player.canMove !== false) {
            this.player.update(this.inputManager.keys, this.gameConfig.playerSpeed);
        }

        if (Phaser.Input.Keyboard.JustDown(this.inputManager.keys.SPACE)) {
            const pos = this.player.getPosition();
            this.lidarSystem.emitPulse(pos.x, pos.y, this.walls, this.memoryPoints, this.registry);
        }

        this.inputManager.update(this.player);

        // Проверка обнаружения объектов
        this.checkDiscovery();

        this.checkNearbyItems();
        this.checkTransitionZones();
        this.checkNearbyDevices();

        if (this.inputManager.justPressedE()) {
            this.handleInteraction();
        }
    }

    checkDiscovery() {
        if (!this.player) return;
        const playerPos = this.player.getPosition();

        // Проверяем предметы
        for (let item of this.items) {
            item.checkDiscovery(playerPos.x, playerPos.y);
        }

        // Проверяем устройства
        for (let device of this.devices) {
            device.checkDiscovery(playerPos.x, playerPos.y);
        }

        // Проверяем зоны перехода
        for (let zone of this.transitionZones) {
            zone.checkDiscovery(playerPos.x, playerPos.y);
        }
    }

    checkNearbyItems() {
        if (!this.player) return;
        const playerPos = this.player.getPosition();
        let found = null;
        for (let item of this.items) {
            if (item.canInteract(playerPos.x, playerPos.y)) {
                found = item;
                break;
            }
        }
        this.nearItem = found;
        if (this.nearItem) {
            this.inputManager.showInteractionHint(true, playerPos.x, playerPos.y - 30);
        } else if (!this.nearTransitionZone) {
            this.inputManager.showInteractionHint(false);
        }



    }

    checkNearbyDevices() {
        if (!this.player) return;
        const playerPos = this.player.getPosition();
        let found = null;

        for (let device of this.devices) {
            if (device.canInteract(playerPos.x, playerPos.y)) {
                found = device;
                break;
            }
        }

        this.nearDevice = found;

        // Показываем подсказку для устройства
        if (this.nearDevice && !this.nearItem && !this.nearTransitionZone) {
            this.inputManager.showInteractionHint(true, playerPos.x, playerPos.y - 30);
        }
    }

    checkTransitionZones() {
        if (!this.player || this.pendingTransition) return;
        const playerPos = this.player.getPosition();
        let foundZone = null;
        if (this.transitionZones) {
            for (let zone of this.transitionZones) {
                if (zone.canInteract(playerPos.x, playerPos.y)) {
                    foundZone = zone;
                    break;
                }
            }
        }
        this.nearTransitionZone = foundZone;
        if (this.nearTransitionZone && !this.nearItem) {
            this.inputManager.showInteractionHint(true, playerPos.x, playerPos.y - 30);
        }
    }

    handleInteraction() {
        if (this.nearItem) {
            this.pickupItem(this.nearItem);
        } else if (this.nearTransitionZone) {
            const terminalScene = this.scene.get('TerminalScene');
            if (terminalScene && !terminalScene.pendingTransition) {
                const result = this.nearTransitionZone.interact();
                if (result.success) {
                    terminalScene.requestTransition(this.nearTransitionZone);
                }
            }
        } else if (this.nearDevice) {
            const terminalScene = this.scene.get('TerminalScene');
            if (terminalScene) {
                const result = this.nearDevice.interact();
                if (result.success) {
                    terminalScene.requestDeviceInteraction(this.nearDevice);
                }
            }
        }
else if (this.nearDevice) {
    console.log('[EchoScene] Взаимодействие с устройством:', this.nearDevice.deviceType);
    const terminalScene = this.scene.get('TerminalScene');
    if (terminalScene) {
        const result = this.nearDevice.interact();
        console.log('[EchoScene] Результат взаимодействия:', result);
        if (result.success && !result.isHacked) {
            console.log('[EchoScene] Запуск мини-игры');
            terminalScene.commandLine.log("Запуск взлома...", '#9b59b6');
            this.miniGameManager.startHackingGame(this.nearDevice, (success) => {
                console.log('[EchoScene] Результат мини-игры:', success);
                const hackResult = this.nearDevice.hack(success);
                if (terminalScene && terminalScene.commandLine) {
                    terminalScene.commandLine.log(hackResult.message, success ? '#00ff00' : '#ff5555');
                }
                
                if (success && this.nearDevice.data.unlockedDoors.length > 0 && terminalScene) {
                    terminalScene.commandLine.log("Теперь у вас есть доступ к функциям устройства!", '#00ffcc');
                    terminalScene.waitingForDeviceAction = true;
                    terminalScene.currentDevice = this.nearDevice;
                }
            });
        } else if (result.success && result.isHacked && terminalScene) {
            terminalScene.requestDeviceInteraction(this.nearDevice);
        }
    }
}
    }

    openDoor(doorId) {
        console.log(`[EchoScene] Попытка открыть дверь: ${doorId}`);

        // Используем WallManager для открытия двери
        if (this.wallManager && this.wallManager.openDoor(doorId)) {
            const terminalScene = this.scene.get('TerminalScene');
            if (terminalScene && terminalScene.commandLine) {
                terminalScene.commandLine.success(`Дверь ${doorId} открыта!`);
            }

            // Сохраняем в реестр, что дверь открыта (для сохранения между уровнями)
            const openedDoors = this.registry.get('openedDoors') || [];
            if (!openedDoors.includes(doorId)) {
                openedDoors.push(doorId);
                this.registry.set('openedDoors', openedDoors);
            }
        } else {
            const terminalScene = this.scene.get('TerminalScene');
            if (terminalScene && terminalScene.commandLine) {
                terminalScene.commandLine.error(`Не удалось открыть дверь ${doorId}`);
            }
        }
    }


    upgradePlayer(upgrade) {
        if (upgrade.speed) {
            this.gameConfig.playerSpeed += upgrade.speed;
            console.log(`Скорость увеличена до ${this.gameConfig.playerSpeed}`);
        }
        if (upgrade.memory) {
            const currentMax = this.registry.get('maxMemory') || 45;
            this.registry.set('maxMemory', currentMax + upgrade.memory);
            console.log(`Максимум памяти увеличен до ${this.registry.get('maxMemory')}`);
        }
    }

    pickupItem(item) {
        const result = item.pickup();
        if (result && result.success) {
            const index = this.items.indexOf(item);
            if (index !== -1) this.items.splice(index, 1);

            // Обрабатываем разные типы предметов
            if (result.type === 'lore') {
                // Сохраняем лор в список
                const loreList = this.registry.get('loreList') || [];
                loreList.push({
                    id: Date.now(),
                    title: result.data.title,
                    text: result.data.text
                });
                this.registry.set('loreList', loreList);

                const terminalScene = this.scene.get('TerminalScene');
                if (terminalScene && terminalScene.commandLine) {
                    terminalScene.commandLine.log(`\n📜 ПОЛУЧЕН ЛОР: ${result.data.title}`, '#ffcc00');
                    terminalScene.commandLine.log(`Введите "data list" для просмотра всех лоров`, '#888888');
                }
            }
            else if (result.type === 'upgrade') {
                if (result.data.upgradeType === 'rayCount') {
                    this.gameConfig.rayCount = result.data.value;
                    this.lidarSystem.updateConfig(this.gameConfig);

                    const terminalScene = this.scene.get('TerminalScene');
                    if (terminalScene && terminalScene.commandLine) {
                        terminalScene.commandLine.success(`🔧 УЛУЧШЕНИЕ: ${result.data.title}`);
                        terminalScene.commandLine.log(`rayCount увеличен до ${result.data.value}`, '#00ffcc');
                    }
                }
            }

            console.log('Предмет подобран! Осталось:', this.items.length);
            this.nearItem = null;
            this.inputManager.showInteractionHint(false);
        }
    }

    onResize() {
        this.updateViewports();
    }
}