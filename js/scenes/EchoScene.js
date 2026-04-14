class EchoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EchoScene', active: true });
    }

    create() {
        this.updateViewports();
        this.scale.on('resize', this.updateViewports, this);

        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Игрок
        this.player = this.add.circle(450, 360, 8, 0x00ffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // === ИСПРАВЛЕННАЯ СТЕНА ===
        this.walls = this.physics.add.staticGroup();
        
        // Видимая стена + физическое тело в одном объекте
        this.testWall = this.add.rectangle(700, 300, 20, 400, 0x444444);
        const wallBody = this.physics.add.staticBody(400, 300, 60, 500);
        this.testWall.body = wallBody;           // привязываем
        this.walls.add(this.testWall);           // добавляем в группу

        // Коллизия игрока со стеной
        this.physics.add.collider(this.player, this.walls);

        // Группа точек памяти
        this.memoryPoints = this.add.group();

        // Подсказки
        this.add.text(30, 30, 'DARK ECHO AREA', {
            fontSize: '20px',
            color: '#00ffcc',
            fontFamily: 'Courier New'
        }).setShadow(0, 0, '#00ffff', 5);

        this.add.text(30, 70, 'WASD — move\nSPACE — Emit Lidar Pulse', {
            fontSize: '16px',
            color: '#00ccaa'
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        // Драг-разделитель
        this.divider = this.add.rectangle(0, 0, 6, this.scale.height, 0x555555)
            .setOrigin(0.5, 0)
            .setInteractive({ cursor: 'col-resize' })
            .setDepth(100);

        this.divider.on('pointerdown', () => this.registry.set('isDraggingDivider', true));
        this.input.on('pointermove', this.handleDividerDrag, this);
        this.input.on('pointerup', () => this.registry.set('isDraggingDivider', false));
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
        const speed = 180;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.keys.A.isDown) this.player.body.setVelocityX(-speed);
        if (this.cursors.right.isDown || this.keys.D.isDown) this.player.body.setVelocityX(speed);
        if (this.cursors.up.isDown || this.keys.W.isDown) this.player.body.setVelocityY(-speed);
        if (this.cursors.down.isDown || this.keys.S.isDown) this.player.body.setVelocityY(speed);

        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.emitLidarPulse();
        }
    }

    // ====================== УЛУЧШЕННЫЙ LIDAR ======================
    emitLidarPulse() {
        const rayCount = 20;           // оптимально для теста
        const maxDistance = 520;
        const startX = this.player.x;
        const startY = this.player.y;

        for (let i = 0; i < rayCount; i++) {
            const angle = Math.random() * Math.PI * 2;

            const result = this.castRay(startX, startY, angle, maxDistance);

            // Создаём линию (сначала очень короткую)
            const line = this.add.graphics();
            line.lineStyle(1.8, 0x00ffff, 0.75);   // тоньше и мягче
            line.moveTo(startX, startY);
            line.lineTo(startX, startY);           // начинаем с нулевой длины
            line.strokePath();

            // Анимация распространения + затухание
            this.tweens.add({
                targets: line,
                props: {
                    scaleX: 1,           // Phaser сам растянет линию
                    alpha: 0
                },
                duration: 180,           // время "выстрела" луча
                ease: 'Sine.easeOut',
                onUpdate: () => {
                    // На каждом шаге перерисовываем линию до текущей длины
                    line.clear();
                    line.lineStyle(1.8, 0x00ffff, 0.75);
                    line.moveTo(startX, startY);
                    const currentLen = result.distance * (line.scaleX || 1);
                    line.lineTo(
                        startX + Math.cos(angle) * currentLen,
                        startY + Math.sin(angle) * currentLen
                    );
                    line.strokePath();
                },
                onComplete: () => line.destroy()
            });

            // Если попали в стену
            if (result.hit) {
                const point = this.add.circle(result.x, result.y, 3.5, 0x00ffcc, 1);
                this.memoryPoints.add(point);

                const spark = this.add.circle(result.x, result.y, 5.5, 0x88ffff, 0.85);
                this.tweens.add({
                    targets: spark,
                    radius: 1,
                    alpha: 0,
                    duration: 320,
                    onComplete: () => spark.destroy()
                });

                let mem = this.registry.get('memory');
                this.registry.set('memory', Math.min(mem + 1, this.registry.get('maxMemory')));
            }
        }
    }

    castRay(x, y, angle, maxDist) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        const wallBounds = this.testWall.getBounds();
        let closestT = maxDist;
        let hitDetected = false;

        const sides = [
            { x1: wallBounds.left, y1: wallBounds.top, x2: wallBounds.left, y2: wallBounds.bottom },
            { x1: wallBounds.right, y1: wallBounds.top, x2: wallBounds.right, y2: wallBounds.bottom },
            { x1: wallBounds.left, y1: wallBounds.top, x2: wallBounds.right, y2: wallBounds.top },
            { x1: wallBounds.left, y1: wallBounds.bottom, x2: wallBounds.right, y2: wallBounds.bottom }
        ];

        for (let side of sides) {
            const t = this.getRaySegmentIntersection(x, y, dx, dy, side.x1, side.y1, side.x2, side.y2);
            if (t !== null && t > 0.001 && t < closestT) {
                closestT = t;
                hitDetected = true;
            }
        }

        const endX = x + dx * closestT;
        const endY = y + dy * closestT;

        return {
            x: endX,
            y: endY,
            hit: hitDetected,
            distance: closestT
        };
    }

    getRaySegmentIntersection(rx, ry, rdx, rdy, x1, y1, x2, y2) {
        const den = (x2 - x1) * rdy - (y2 - y1) * rdx;
        if (Math.abs(den) < 0.0001) return null;

        const t = ((rx - x1) * (y2 - y1) - (ry - y1) * (x2 - x1)) / den;
        const u = -((rx - x1) * rdy - (ry - y1) * rdx) / den;

        if (t > 0.001 && u >= 0 && u <= 1) return t;
        return null;
    }
}