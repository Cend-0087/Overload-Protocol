class EchoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EchoScene', active: true });
    }

    // ====================== НАСТРОЙКИ (всё важное собрано здесь) ======================
    // Меняй значения здесь — они сразу применяются при перезапуске или во время игры
    gameConfig = {
        // === Цвета ===
        bgColor: '#0a0a0a',      // Цвет фона
            // Цвет стен. Реальное значение должно соответствовать цвету фона (для теста - 0x444444)

        // === Игрок ===
        playerSpeed: 180,                    // скорость движения WASD

        // === Lidar (основная механика) ===
        rayCount: 20,                        // сколько лучей испускается за один импульс
        maxRayCount: 1000,                   // максимум при полной прокачке (для будущего)
        maxDistance: 520,                    // максимальная дальность луча в пикселях

        lineThickness: 1.8,                  // толщина линии луча
        lineColor: 0x00ffff,                 // цвет луча (голубой)
        lineAlpha: 0.75,                     // прозрачность линии

        propagationTime: 300,                // сколько миллисекунд луч "вырастает" от игрока
        fadeTime: 1100,                      // сколько миллисекунд луч затухает после полного распространения

        cooldownTime: 0.0,                   // задержка между импульсами (сейчас 0 для тестов)

        memoryPerHit: 1,                     // сколько единиц памяти добавляется за каждое попадание

        // === Визуальные эффекты ===
        hitSparkRadius: 7,                   // размер искры при попадании в стену
        hitSparkColor: 0x88ffff,

        // === Оптимизация точек памяти ===
        memoryPointMergeDistance: 3,         // если новая точка ближе этой дистанции к существующей — не создаём дубликат

        // === Карта: стены ===
        // x, y — центр прямоугольника
        // width, height — размер
        // color — цвет в hex
        wallsData: [
            { x: 700, y: 300, width: 20,  height: 400, color: 0x000000 }, // вертикальная стена
            { x: 400, y: 100, width: 300, height: 20,  color: 0x000000 }, // горизонтальная сверху
            { x: 950, y: 500, width: 20,  height: 300, color: 0x000000 }, // вертикальная справа
            // Добавляй новые стены сюда одной строкой ↓
        ]
    };

    create() {
        // Адаптивные viewport'ы (левая зона + правая панель)
        this.updateViewports();
        this.scale.on('resize', this.updateViewports, this);

        // Фон игровой области
        this.cameras.main.setBackgroundColor('bgColor');

        // ====================== ИГРОК ======================
        this.player = this.add.circle(450, 360, 8, 0x00ffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // ====================== СТЕНЫ ======================
        this.walls = this.physics.add.staticGroup();
        this.createWalls();                    // создаём все стены из gameConfig.wallsData

        // Коллизия игрока со всеми стенами
        this.physics.add.collider(this.player, this.walls);

        // Группа для точек памяти (отметки от лидара)
        this.memoryPoints = this.add.group();

        // ====================== ПОДСКАЗКИ ======================
        this.add.text(30, 30, 'DARK ECHO AREA', {
            fontSize: '20px', color: '#00ffcc', fontFamily: 'Courier New'
        }).setShadow(0, 0, '#00ffff', 5);

        this.add.text(30, 70, 'WASD — move\nSPACE — Emit Lidar Pulse', {
            fontSize: '16px', color: '#00ccaa'
        });

        // ====================== УПРАВЛЕНИЕ ======================
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        // ====================== ДРАГ-РАЗДЕЛИТЕЛЬ ======================
        this.divider = this.add.rectangle(0, 0, 6, this.scale.height, 0x555555)
            .setOrigin(0.5, 0)
            .setInteractive({ cursor: 'col-resize' })
            .setDepth(100);

        this.divider.on('pointerdown', () => this.registry.set('isDraggingDivider', true));
        this.input.on('pointermove', this.handleDividerDrag, this);
        this.input.on('pointerup', () => this.registry.set('isDraggingDivider', false));

        // Время последнего импульса (для cooldown)
        this.lastPulseTime = 0;
    }

    // ====================== СОЗДАНИЕ СТЕН ======================
    // Очень удобный метод: все стены описываются в gameConfig.wallsData
    createWalls() {
        const cfg = this.gameConfig;

        cfg.wallsData.forEach(data => {
            // Создаём видимый серый прямоугольник
            const wall = this.add.rectangle(data.x, data.y, data.width, data.height, data.color);

            // Добавляем ему статическую физику (игрок не сможет пройти сквозь)
            this.physics.add.existing(wall, true);   // true = static body

            // Добавляем в группу стен
            this.walls.add(wall);
        });
    }

    // Обработка перетаскивания разделителя между Echo и UI
    handleDividerDrag(pointer) {
        if (!this.registry.get('isDraggingDivider')) return;

        const newUiWidth = this.scale.width - pointer.x;
        const clamped = Phaser.Math.Clamp(newUiWidth, 320, 520);

        this.registry.set('uiWidth', clamped);
        this.updateViewports();
        this.scene.get('UIScene').updateViewports();
    }

    // Обновление размеров камер при изменении окна
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

        // Движение игрока
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.keys.A.isDown) this.player.body.setVelocityX(-cfg.playerSpeed);
        if (this.cursors.right.isDown || this.keys.D.isDown) this.player.body.setVelocityX(cfg.playerSpeed);
        if (this.cursors.up.isDown || this.keys.W.isDown) this.player.body.setVelocityY(-cfg.playerSpeed);
        if (this.cursors.down.isDown || this.keys.S.isDown) this.player.body.setVelocityY(cfg.playerSpeed);

        // Импульс лидара с учётом cooldown
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            const now = this.time.now / 1000;
            if (now - this.lastPulseTime >= cfg.cooldownTime) {
                this.emitLidarPulse();
                this.lastPulseTime = now;
            }
        }
    }

    // ====================== ОСНОВНАЯ МЕХАНИКА LIDAR ======================
    emitLidarPulse() {
        const cfg = this.gameConfig;
        const startX = this.player.x;
        const startY = this.player.y;

        for (let i = 0; i < cfg.rayCount; i++) {
            const angle = Math.random() * Math.PI * 2;   // случайное направление

            // Вычисляем куда попадёт луч
            const result = this.castRay(startX, startY, angle, cfg.maxDistance);

            // Рисуем луч (сначала нулевой длины)
            const line = this.add.graphics();
            line.lineStyle(cfg.lineThickness, cfg.lineColor, cfg.lineAlpha);
            line.moveTo(startX, startY);
            line.lineTo(startX, startY);
            line.strokePath();

            // Анимация: луч постепенно распространяется, потом затухает
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
                    line.lineTo(
                        startX + Math.cos(angle) * currentDist,
                        startY + Math.sin(angle) * currentDist
                    );
                    line.strokePath();
                },
                onComplete: () => line.destroy()
            });

            // Если луч попал в стену
            if (result.hit) {
                this.createMemoryPoint(result.x, result.y);

                // Искра в месте попадания
                const spark = this.add.circle(result.x, result.y, cfg.hitSparkRadius, cfg.hitSparkColor, 0.85);
                this.tweens.add({
                    targets: spark,
                    radius: 1,
                    alpha: 0,
                    duration: 320,
                    onComplete: () => spark.destroy()
                });

                // Добавляем память
                let currentMem = this.registry.get('memory');
                this.registry.set('memory', Math.min(currentMem + cfg.memoryPerHit, this.registry.get('maxMemory')));
            }
        }
    }

    // Создаёт точку памяти с проверкой на дубликаты
    createMemoryPoint(x, y) {
        const cfg = this.gameConfig;
        let merged = false;

        this.memoryPoints.getChildren().forEach(point => {
            if (Phaser.Math.Distance.Between(x, y, point.x, point.y) <= cfg.memoryPointMergeDistance) {
                merged = true;
            }
        });

        if (!merged) {
            this.memoryPoints.add(this.add.circle(x, y, 3.5, 0x00ffcc, 1));
        }
    }

    // ====================== РЕЙКАСТ (новый чистый вариант) ======================
    // Проверяет пересечение луча со всеми стенами
    castRay(startX, startY, angle, maxDist) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        let closestDist = maxDist;
        let hitDetected = false;

        // Перебираем все стены
        this.walls.getChildren().forEach(wall => {
            const body = wall.body;
            if (!body) return;

            // Границы прямоугольника стены
            const left   = body.x;
            const right  = body.x + body.width;
            const top    = body.y;
            const bottom = body.y + body.height;

            // Классический алгоритм пересечения луча с AABB (axis-aligned bounding box)
            const t1 = (left   - startX) / dx;
            const t2 = (right  - startX) / dx;
            const t3 = (top    - startY) / dy;
            const t4 = (bottom - startY) / dy;

            const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
            const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

            if (tmax < 0 || tmin > tmax) return;   // луч не пересекает эту стену

            const t = (tmin < 0) ? tmax : tmin;    // берём ближайшую точку пересечения

            if (t > 0 && t < closestDist) {
                closestDist = t;
                hitDetected = true;
            }
        });

        // Возвращаем точку попадания и дистанцию
        return {
            x: startX + dx * closestDist,
            y: startY + dy * closestDist,
            hit: hitDetected,
            distance: closestDist
        };
    }
}