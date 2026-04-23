class PickupItem {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.interactionRadius = 50;
        this.isActive = true;
        this.isDiscovered = false;
        
        // Визуальное представление - красный круг
        this.graphics = scene.add.circle(x, y, 8, 0xff0000);
        this.graphics.setVisible(false);
    }
    
    checkDiscovery(playerX, playerY) {
        if (!this.isActive || this.isDiscovered) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.interactionRadius) {
            this.reveal();
            return true;
        }
        return false;
    }
    
    reveal() {
        if (this.isDiscovered) return;
        
        this.isDiscovered = true;
        this.graphics.setVisible(true);
        
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene && terminalScene.commandLine) {
            terminalScene.commandLine.log(`[ОБНАРУЖЕНО] Предмет`, '#ff0000');
        }
    }
    
    canInteract(playerX, playerY) {
        if (!this.isActive || !this.isDiscovered) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= 40;
    }
    
    pickup() {
        if (!this.isActive || !this.isDiscovered) return false;
        
        this.isActive = false;
        this.graphics.destroy();
        return true;
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

window.PickupItem = PickupItem;