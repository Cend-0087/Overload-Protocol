const config = {
    type: Phaser.AUTO,
    width: 1280,          // базовый размер (для расчётов)
    height: 720,
    parent: 'game',
    backgroundColor: '#000000',
    
    // Адаптивность — холст заполняет всё окно без полос
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [EchoScene, UIScene]
};

const game = new Phaser.Game(config);

// Глобальные данные
game.registry.set('memory', 0);
game.registry.set('maxMemory', 45);
game.registry.set('attention', 0);
game.registry.set('pulseCount', 0);
game.registry.set('uiWidth', 420);        // ← ширина правой панели (можно будет менять)