const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    backgroundColor: '#000000',
    
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
game.registry.set('maxMemory', 128);
game.registry.set('attention', 0);
game.registry.set('pulseCount', 0);

// ←←← НОВОЕ: ширина правой панели (начальное значение)
game.registry.set('uiWidth', 420);
game.registry.set('isDraggingDivider', false);   // флаг перетаскивания