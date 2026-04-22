class MiniGameManager {
    constructor(scene) {
        this.scene = scene;
        this.currentGame = null;
    }
    
    startHackingGame(device, callback) {
        this.currentGame = new TypingGame(this.scene, device, callback);
    }
}

window.MiniGameManager = MiniGameManager;