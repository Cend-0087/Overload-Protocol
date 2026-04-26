// Импорт всех классов (в браузере они уже загружены через script-теги)
// Регистрация пайплайна происходит в конфиге

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
        arcade: { debug: false }
    },
    pipeline: { 'Glitch': GlitchPipeline },
    scene: [EchoScene, UIScene, TerminalScene, TypingGameScene, PasswordGameScene, AttentionGameScene]
};

const game = new Phaser.Game(config);

// Реестр данных
game.registry.set('memory', 0);
game.registry.set('maxMemory', 128);
game.registry.set('attention', 0);
game.registry.set('uiWidth', 420);  // Начальная ширина UI
game.registry.set('isDraggingDivider', false);
game.registry.set('isOverloaded', false);