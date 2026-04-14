class EchoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EchoScene', active: true });
    }

    create() {
        this.updateViewports();

        // Слушаем изменение размера окна
        this.scale.on('resize', this.updateViewports, this);

        // Фон камеры
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Игрок
        this.player = this.add.circle(450, 360, 8, 0x00ffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Тестовые стены
        this.walls = this.physics.add.staticGroup();
        this.walls.create(200, 200, null).setSize(300, 20).setVisible(false);
        this.walls.create(600, 500, null).setSize(400, 20).setVisible(false);
        this.walls.create(100, 400, null).setSize(20, 300).setVisible(false);

        // Подсказки
        this.add.text(30, 30, 'DARK ECHO AREA', {
            fontSize: '20px',
            color: '#00ffcc',
            fontFamily: 'Courier New'
        }).setShadow(0, 0, '#00ffff', 5);

        this.add.text(30, 70, 'WASD — move\nSPACE — Emit Pulse', {
            fontSize: '16px',
            color: '#00ccaa'
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        // Тонкая разделительная линия (будет обновляться при ресайзе)
        this.divider = this.add.rectangle(0, 0, 4, this.scale.height, 0x333333).setOrigin(0, 0);
    }

    updateViewports() {
        const totalWidth = this.scale.width;
        const uiWidth = this.registry.get('uiWidth');
        const echoWidth = Math.max(totalWidth - uiWidth, 600); // минимум 600px для Echo

        // Обновляем viewport левой зоны
        this.cameras.main.setViewport(0, 0, echoWidth, this.scale.height);

        // Разделительная линия всегда по краю Echo-зоны
        if (this.divider) {
            this.divider.setPosition(echoWidth - 2, 0);
            this.divider.setDisplaySize(4, this.scale.height);
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
            this.emitPulse();
        }
    }

    emitPulse() {
        const pulse = this.add.circle(this.player.x, this.player.y, 12, 0x00ffff, 0.9);
        this.tweens.add({
            targets: pulse,
            radius: 280,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.easeOut',
            onComplete: () => pulse.destroy()
        });

        let mem = this.registry.get('memory');
        this.registry.set('memory', Math.min(mem + 4, this.registry.get('maxMemory')));
    }
}