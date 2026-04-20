class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // Создаем спрайт с круглой текстурой
        super(scene, x, y, null);
        
        // Создаем круглую графику как текстуру
        const graphics = scene.add.graphics();
        graphics.fillStyle(0x00ffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('playerCircle', 16, 16);
        graphics.destroy();
        
        // Устанавливаем текстуру
        this.setTexture('playerCircle');
        this.setOrigin(0.5, 0.5); // Центрируем спрайт
        
        scene.add.existing(this);
        
        // Добавляем физику
        scene.physics.world.enable(this);
        
        // Настройка физического тела
        this.body.setCircle(8);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0);
        
        // Сохраняем ссылку на сцену
        this.scene = scene;
    }

    update(keys, speed) {
        if (!this.body) return;

        this.body.setVelocity(0);

        if (keys.left?.isDown || keys.A.isDown) this.body.setVelocityX(-speed);
        if (keys.right?.isDown || keys.D.isDown) this.body.setVelocityX(speed);
        if (keys.up?.isDown || keys.W.isDown) this.body.setVelocityY(-speed);
        if (keys.down?.isDown || keys.S.isDown) this.body.setVelocityY(speed);
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}