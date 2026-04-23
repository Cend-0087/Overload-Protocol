class MiniGameManager {
    constructor(scene) {
        this.scene = scene;
    }
    
    startHackingGame(device, callback) {
        console.log('[MiniGameManager] startHackingGame', device.deviceType);
        
        if (device.deviceType === 'computer') {
            console.log('[MiniGameManager] Запуск TypingGameScene');
            this.scene.scene.launch('TypingGameScene', { device: device, callback: callback });
        } else if (device.deviceType === 'laptop') {
            console.log('[MiniGameManager] Запуск PasswordGameScene');
            this.scene.scene.launch('PasswordGameScene', { device: device, callback: callback });
        }
    }
}

window.MiniGameManager = MiniGameManager;