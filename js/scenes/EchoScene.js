class EchoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EchoScene', active: true });
    }

    // ====================== НАСТРОЙКИ ======================
    gameConfig = {
        playerSpeed: 180,

        rayCount: 20,
        maxRayCount: 1000,
        maxDistance: 520,

        lineThickness: 1.8,
        lineColor: 0x00ffff,
        lineAlpha: 0.75,

        propagationTime: 300,
        fadeTime: 1100,

        cooldownTime: 0.0,                   // 0 для комфортного тестирования

        memoryPerHit: 1,

        hitSparkRadius: 7,
        hitSparkColor: 0x88ffff,

        memoryPointMergeDistance: 3,

        // === Камера ===
        cameraFollowSpeed: 0.08,             // плавность следования камеры (меньше = плавнее)
        cameraDeadZone: 120,                 // "мёртвая зона" — камера не двигается, пока игрок внутри этого расстояния от центра

        worldWidth: 3840,  // 1280 * 3
        worldHeight: 2160, // 720 * 3
        
        // Обновим данные стен, чтобы они не кучковались в одном углу
        wallsData: [
            { x: 700, y: 300, width: 20,  height: 400, color: 0x444444 },
            { x: 400, y: 100, width: 300, height: 20,  color: 0x444444 },
            { x: 950, y: 500, width: 20,  height: 300, color: 0x444444 },
            { x: 1500, y: 800, width: 400, height: 40, color: 0x444444 }, // Новая стена дальше
            { x: 2000, y: 200, width: 50, height: 600, color: 0x444444 }   // Еще одна
        ],
    };

    create() {
        this.updateViewports();
        this.scale.on('resize', this.updateViewports, this);

        this.physics.world.setBounds(0, 0, this.gameConfig.worldWidth, this.gameConfig.worldHeight); // ГРАНИЦЫ МИРА

        this.cameras.main.setBackgroundColor('#0a0a0a');

        // ====================== ИГРОК ======================
        this.player = this.add.circle(450, 360, 8, 0x00ffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.player.body.setCollideWorldBounds(true); // столкновение с новыми границами мира

        // ====================== СТЕНЫ ======================
        this.walls = this.physics.add.staticGroup();
        this.createWalls();

        this.physics.add.collider(this.player, this.walls);

        this.memoryPoints = this.add.group();


        // ====================== КОМАНДНАЯ СТРОКА ======================
        this.scene.get('UIScene').events.on('command-clear', () => {
            this.memoryPoints.clear(true, true); // Удаляет все объекты из группы и с экрана
        }, this);

        // ====================== ПОДСКАЗКИ (Нужно переделать) ======================
        // this.add.text(30, 30, 'DARK ECHO AREA', {
        //     fontSize: '20px', color: '#00ffcc', fontFamily: 'Courier New'
        // }).setShadow(0, 0, '#00ffff', 5);

        // this.add.text(30, 70, 'WASD — move\nSPACE — Emit Lidar Pulse', {
        //     fontSize: '16px', color: '#00ccaa'
        // });

        // ====================== УПРАВЛЕНИЕ ======================
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        // ====================== ДРАГ-РАЗДЕЛИТЕЛЬ ======================
        this.divider = this.add.rectangle(0, 0, 6, this.scale.height, 0x555555)
            .setOrigin(0.5, 0)
            .setInteractive({ cursor: 'col-resize' })
            .setDepth(100)
            .setScrollFactor(0); // Чтобы разделитель всегда был на месте экрана

        this.divider.on('pointerdown', () => this.registry.set('isDraggingDivider', true));
        this.input.on('pointermove', this.handleDividerDrag, this);
        this.input.on('pointerup', () => this.registry.set('isDraggingDivider', false));

        this.lastPulseTime = 0;

        // ====================== КАМЕРА ======================
        this.cameras.main.startFollow(this.player, true, 
            this.gameConfig.cameraFollowSpeed, 
            this.gameConfig.cameraFollowSpeed);
        
        this.cameras.main.setDeadzone(this.gameConfig.cameraDeadZone, this.gameConfig.cameraDeadZone);

        // 2. ОГРАНИЧИВАЕМ КАМЕРУ ГРАНИЦАМИ МИРА
        this.cameras.main.setBounds(0, 0, this.gameConfig.worldWidth, this.gameConfig.worldHeight);
    }

    createWalls() {
        const cfg = this.gameConfig;
        cfg.wallsData.forEach(data => {
            const wall = this.add.rectangle(data.x, data.y, data.width, data.height, data.color);
            this.physics.add.existing(wall, true);
            this.walls.add(wall);
        });
    }

    handleDividerDrag(pointer) {
        if (!this.registry.get('isDraggingDivider')) return;
        const newUiWidth = this.scale.width - pointer.x;
        const clamped = Phaser.Math.Clamp(newUiWidth, 320, 520);
        this.registry.set('uiWidth', clamped);
        this.updateViewports();
        this.scene.get('UIScene').updateViewports();
    }

    updateViewports() {
        const totalWidth = this.scale.width;
        const uiWidth = this.registry.get('uiWidth');
        const echoWidth = Math.max(totalWidth - uiWidth, 600);

        this.cameras.main.setViewport(0, 0, echoWidth, this.scale.height);

        if (this.divider) {
            this.divider.setPosition(echoWidth, 0);
            this.divider.setDisplaySize(6, this.scale.height);
        }
    }

    update() {
        const cfg = this.gameConfig;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.keys.A.isDown) this.player.body.setVelocityX(-cfg.playerSpeed);
        if (this.cursors.right.isDown || this.keys.D.isDown) this.player.body.setVelocityX(cfg.playerSpeed);
        if (this.cursors.up.isDown || this.keys.W.isDown) this.player.body.setVelocityY(-cfg.playerSpeed);
        if (this.cursors.down.isDown || this.keys.S.isDown) this.player.body.setVelocityY(cfg.playerSpeed);

        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            const now = this.time.now / 1000;
            if (now - this.lastPulseTime >= cfg.cooldownTime) {
                this.emitLidarPulse();
                this.lastPulseTime = now;
            }
        }

        if (this.registry.get('isOverloaded')) {
            this.cameras.main.setLerp(0.5, 0.5); // Камера начинает "плавать"
            
            if (Phaser.Math.Between(0, 100) > 90) {
                // Создаем кратковременный "фантомный" кадр
                const flash = this.add.image(this.player.x, this.player.y, null); 
                // Или просто рисуем случайный примитив на весь экран
                const rect = this.add.rectangle(
                    this.cameras.main.worldView.x + Math.random() * 1280,
                    this.cameras.main.worldView.y + Math.random() * 720,
                    Math.random() * 400,
                    1,
                    0x00ffff,
                    0.5
                );
                this.time.delayedCall(30, () => rect.destroy());
            }
        }

    }

    // ====================== LIDAR ======================
    emitLidarPulse() {
        const cfg = this.gameConfig;
        const startX = this.player.x;
        const startY = this.player.y;

        // Получаем текущие значения из реестра один раз перед циклом
        let currentMem = this.registry.get('memory');
        const maxMem = this.registry.get('maxMemory');

        for (let i = 0; i < cfg.rayCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const result = this.castRay(startX, startY, angle, cfg.maxDistance);

            // ... код отрисовки линий (line) остается прежним ...
            const line = this.add.graphics();
            line.lineStyle(cfg.lineThickness, cfg.lineColor, cfg.lineAlpha);
            line.moveTo(startX, startY);
            line.lineTo(startX, startY);
            line.strokePath();

            this.tweens.add({
                targets: line,
                props: { scaleX: 1, alpha: 0 },
                duration: cfg.propagationTime,
                ease: 'Sine.easeOut',
                onUpdate: () => {
                    line.clear();
                    line.lineStyle(cfg.lineThickness, cfg.lineColor, cfg.lineAlpha);
                    line.moveTo(startX, startY);
                    const currentDist = result.distance * (line.scaleX || 1);
                    line.lineTo(startX + Math.cos(angle) * currentDist, startY + Math.sin(angle) * currentDist);
                    line.strokePath();
                },
                onComplete: () => line.destroy()
            });

            // ПРОВЕРКА ЛИМИТА ПАМЯТИ
            if (result.hit && currentMem < maxMem) {
                // Создаем точку визуально
                this.createMemoryPoint(result.x, result.y);

                // Эффект вспышки при попадании
                const spark = this.add.circle(result.x, result.y, cfg.hitSparkRadius, cfg.hitSparkColor, 0.85);
                this.tweens.add({ targets: spark, radius: 1, alpha: 0, duration: 320, onComplete: () => spark.destroy() });

                // Увеличиваем счетчик и обновляем реестр
                currentMem += cfg.memoryPerHit;
                // На всякий случай ограничиваем, чтобы не вылезти за maxMem
                const finalMem = Math.min(currentMem, maxMem);
                this.registry.set('memory', finalMem);

                // Если мы достигли лимита прямо в этом цикле, можно сразу остановить создание точек для остальных лучей
                if (finalMem >= maxMem) {
                    // Опционально: можно прервать цикл, если не хочешь, чтобы рисовались остальные лучи
                    // Но лучше оставить отрисовку лучей для красоты, просто не создавать точки.
                }
            }
        }
    }

    createMemoryPoint(x, y) {
        const cfg = this.gameConfig;
        let merged = false;
        this.memoryPoints.getChildren().forEach(p => {
            if (Phaser.Math.Distance.Between(x, y, p.x, p.y) <= cfg.memoryPointMergeDistance) merged = true;
        });
        if (!merged) this.memoryPoints.add(this.add.circle(x, y, 3.5, 0x00ffcc, 1));
    }

    castRay(startX, startY, angle, maxDist) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        let closestDist = maxDist;
        let hitDetected = false;

        this.walls.getChildren().forEach(wall => {
            const body = wall.body;
            if (!body) return;

            const left   = body.x;
            const right  = body.x + body.width;
            const top    = body.y;
            const bottom = body.y + body.height;

            const t1 = (left   - startX) / dx;
            const t2 = (right  - startX) / dx;
            const t3 = (top    - startY) / dy;
            const t4 = (bottom - startY) / dy;

            const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
            const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

            if (tmax < 0 || tmin > tmax) return;

            const t = (tmin < 0) ? tmax : tmin;

            if (t > 0 && t < closestDist) {
                closestDist = t;
                hitDetected = true;
            }
        });

        return {
            x: startX + dx * closestDist,
            y: startY + dy * closestDist,
            hit: hitDetected,
            distance: closestDist
        };
    }
}