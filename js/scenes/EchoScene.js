class EchoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EchoScene', active: true });
    }

    create() {
        // Фон
        this.add.rectangle(0, 0, 900, 720, 0x111111).setOrigin(0);

        // Игрок (пока просто точка — потом заменишь на символ или круг)
        this.player = this.add.circle(450, 360, 8, 0x00ffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Простые стены (для теста отражений)
        this.walls = this.physics.add.staticGroup();
        this.walls.create(200, 200, null).setSize(300, 20).setVisible(false);
        this.walls.create(600, 500, null).setSize(400, 20).setVisible(false);
        this.walls.create(100, 400, null).setSize(20, 300).setVisible(false);

        // Текст подсказки
        this.add.text(20, 20, 'Dark Echo Area\nWASD - move\nSPACE - Emit Pulse', {
            fontSize: '18px',
            color: '#00ffcc'
        }).setShadow(0, 0, '#00ffff', 4);

        // Клавиши
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        // Счётчик импульсов
        this.pulseCount = 0;
    }

    update() {
        const speed = 180;

        // Движение
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.keys.A.isDown) this.player.body.setVelocityX(-speed);
        if (this.cursors.right.isDown || this.keys.D.isDown) this.player.body.setVelocityX(speed);
        if (this.cursors.up.isDown || this.keys.W.isDown) this.player.body.setVelocityY(-speed);
        if (this.cursors.down.isDown || this.keys.S.isDown) this.player.body.setVelocityY(speed);

        // Импульс
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.emitPulse();
        }
    }

    emitPulse() {
        this.pulseCount++;
        
        // Простой визуальный импульс (круг, который расширяется)
        const pulse = this.add.circle(this.player.x, this.player.y, 10, 0x00ffff, 0.8);
        
        this.tweens.add({
            targets: pulse,
            radius: 300,
            alpha: 0,
            duration: 1200,
            ease: 'Sine.easeOut',
            onComplete: () => pulse.destroy()
        });

        // Пока просто увеличиваем память (потом добавим raycasting)
        let currentMemory = this.registry.get('memory');
        this.registry.set('memory', Math.min(currentMemory + 3, this.registry.get('maxMemory')));
        
        console.log(`Pulse emitted! Memory: ${this.registry.get('memory')}`);
    }
}