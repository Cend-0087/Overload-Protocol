// js/core/InputManager.js

class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};
        this.onInteract = null;        // callback, который будем вызывать при нажатии E
        this.isInteractionHintVisible = false;
    }

    init() {
        const keyboard = this.scene.input.keyboard;

        this.keys = keyboard.addKeys({
            'W': Phaser.Input.Keyboard.KeyCodes.W,
            'A': Phaser.Input.Keyboard.KeyCodes.A,
            'S': Phaser.Input.Keyboard.KeyCodes.S,
            'D': Phaser.Input.Keyboard.KeyCodes.D,
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
            'E': Phaser.Input.Keyboard.KeyCodes.E
        });

        // Можно добавить обработку нажатия E сразу здесь
        this.keys.E.on('down', () => {
            if (this.onInteract) {
                this.onInteract();
            }
        });
    }

    // Метод, который будет вызываться из EchoScene.update()
    update(player) {
        // Здесь можно будет добавить дополнительные проверки (например, зажатые клавиши и т.д.)
        // Пока оставляем пустым — основная логика движения остаётся в Player
    }

    // Публичный метод для показа/скрытия подсказки взаимодействия
    showInteractionHint(show, x = 0, y = 0) {
        const hint = this.scene.interactionHint; // будем создавать в EchoScene
        if (!hint) return;

        if (show) {
            hint.setPosition(x, y);
            hint.setVisible(true);
        } else {
            hint.setVisible(false);
        }

        this.isInteractionHintVisible = show;
    }

    // Полезные геттеры
    isMoving() {
        return this.keys.W.isDown || this.keys.A.isDown || 
               this.keys.S.isDown || this.keys.D.isDown;
    }

    justPressedE() {
        return Phaser.Input.Keyboard.JustDown(this.keys.E);
    }
}

// Экспорт для браузера
window.InputManager = InputManager;