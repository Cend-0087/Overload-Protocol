class MiniGameManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentGame = null;
        this.callback = null;
    }
    
    startHackingGame(device, callback) {
        // Запускаем TypingGame
        this.currentGame = new TypingGame(this.scene, device, (success) => {
            this.isActive = false;
            if (callback) callback(success);
        });
        this.isActive = true;
    }
    
    // Для будущих игр
    startTypingGame(device, callback) {
        this.startHackingGame(device, callback);
    }
}

window.MiniGameManager = MiniGameManager;