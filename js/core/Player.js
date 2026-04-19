class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        // Создаем визуальный объект
        this.circle = scene.add.circle(0, 0, 8, 0x00ffff);
        this.add(this.circle);

        scene.add.existing(this);

        // Добавляем физику после добавления в сцену
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