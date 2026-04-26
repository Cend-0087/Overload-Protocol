class PickupItem {
    constructor(scene, x, y, type = 'lore', customData = null) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type;
        this.customData = customData;
        this.radius = 8;
        this.interactionRadius = 50;
        this.isActive = true;
        this.isDiscovered = false;
        this.objectId = `item_${Date.now()}_${Math.random()}`;
        
        // Generate lore package on creation
        if (type === 'lore') {
            this.lorePackage = LoreDB.generateAndStoreLore(this.objectId, 'item');
        } else {
            this.lorePackage = null;
        }
        
        // Color based on type
        let color = 0xff0000; // red for lore
        if (type === 'upgrade') color = 0x00ff00;
        if (type === 'stat') color = 0x00ccff;
        
        this.graphics = scene.add.circle(x, y, 8, color);
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
            let typeText = 'Data Fragment';
            if (this.type === 'lore') typeText = 'Data Fragment';
            if (this.type === 'upgrade') typeText = 'Upgrade';
            if (this.type === 'stat') typeText = 'System Component';
            terminalScene.commandLine.log(`[DETECTED] ${typeText}`, '#ff0000');
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
    
    // Return lore data if available (no memory increase!)
    if (this.type === 'lore' && this.lorePackage && this.lorePackage.entries) {
        return {
            success: true,
            type: this.type,
            lorePackage: this.lorePackage
        };
    }
    
    // If lore package was requested but no lore available, return empty
    if (this.type === 'lore' && (!this.lorePackage || !this.lorePackage.entries)) {
        return {
            success: true,
            type: this.type,
            lorePackage: null,
            isEmpty: true
        };
    }
    
    return {
        success: true,
        type: this.type,
        data: this.customData
    };
}
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

window.PickupItem = PickupItem;