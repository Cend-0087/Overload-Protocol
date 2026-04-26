class TransitionZone {
    constructor(scene, x, y, width = 300, height = 300, targetLevel = 2) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.targetLevel = targetLevel;
        this.isActive = true;
        this.isDiscovered = false;
        
        this.graphics = scene.add.rectangle(x, y, width, height, 0xffaa00, 0.4);
        this.graphics.setStrokeStyle(2, 0xffdd44, 1);
        this.graphics.setVisible(false);
    }
    
    checkDiscovery(playerX, playerY) {
        if (!this.isActive || this.isDiscovered) return false;
        
        const left = this.x - this.width / 2;
        const right = this.x + this.width / 2;
        const top = this.y - this.height / 2;
        const bottom = this.y + this.height / 2;
        
        const isInside = playerX >= left && playerX <= right && playerY >= top && playerY <= bottom;
        
        if (isInside) {
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
            terminalScene.commandLine.log(`[DETECTED] Transition zone (Level ${this.targetLevel})`, '#ffaa00');
        }
    }
    
    canInteract(playerX, playerY) {
        if (!this.isActive || !this.isDiscovered) return false;
        
        const left = this.x - this.width / 2;
        const right = this.x + this.width / 2;
        const top = this.y - this.height / 2;
        const bottom = this.y + this.height / 2;
        
        const isInside = playerX >= left && playerX <= right && playerY >= top && playerY <= bottom;
        
        return isInside;
    }
    
    interact() {
        if (!this.isActive || !this.isDiscovered) return { success: false };
        
        return {
            success: true,
            targetLevel: this.targetLevel,
            zone: this
        };
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    deactivate() {
        this.isActive = false;
        if (this.graphics) this.graphics.destroy();
    }
}

window.TransitionZone = TransitionZone;