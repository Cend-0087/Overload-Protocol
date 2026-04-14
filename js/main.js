const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [EchoScene, UIScene]   // Запускаем обе сцены
};

// Создаём игру
const game = new Phaser.Game(config);

// Глобальный реестр данных (чтобы сцены могли общаться)
game.registry.set('memory', 0);           // текущая память
game.registry.set('maxMemory', 45);       // лимит памяти
game.registry.set('attention', 0);        // внимание безопасности