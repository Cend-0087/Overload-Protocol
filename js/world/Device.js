class Device {
    constructor(scene, x, y, deviceType = 'computer', doorId = null) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.deviceType = deviceType;
        this.doorId = doorId;
        this.radius = 12;
        this.interactionRadius = 70;
        this.isActive = true;
        this.isHacked = false;
        this.hackAttempts = 0;
        this.isDiscovered = false;
        this.objectId = `device_${Date.now()}_${Math.random()}`;
        
        // Generate lore package for device (available after hack)
        this.lorePackage = LoreDB.generateAndStoreLore(this.objectId, 'device');
        
        // Visual - purple square
        this.graphics = scene.add.rectangle(x, y, 20, 20, 0x9b59b6, 0.9);
        this.graphics.setStrokeStyle(2, 0x8e44ad, 1);
        this.graphics.setDepth(100);
        this.graphics.setVisible(false);
        
        // Screen
        this.screen = scene.add.rectangle(x, y, 12, 12, 0xecf0f1, 0.8);
        this.screen.setDepth(101);
        this.screen.setVisible(false);
        
        // Physics body
        scene.physics.add.existing(this.graphics, true);
        this.body = this.graphics.body;
        if (this.body) {
            this.body.setSize(20, 20);
        }
        
        // Data storage
        this.data = {
            id: this.objectId,
            type: deviceType,
            unlockedDoors: doorId ? [doorId] : []
        };
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
        this.screen.setVisible(true);
        
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene && terminalScene.commandLine) {
            terminalScene.commandLine.log(`[DETECTED] Device: ${this.deviceType}`, '#9b59b6');
        }
    }
    
    canInteract(playerX, playerY) {
        if (!this.isActive || !this.isDiscovered) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= 45;
    }
    
    interact() {
        if (!this.isActive || !this.isDiscovered) return { success: false, message: "Device not detected" };
        
        if (!this.isHacked) {
            return {
                success: true,
                isHacked: false,
                message: "Connection established.\nEnter 'hack' to attempt breach.",
                device: this
            };
        } else {
            return {
                success: true,
                isHacked: true,
                message: "Choose action:\n1) Download data\n2) Open locked door\n3) Update system",
                device: this
            };
        }
    }
    
    hack(success) {
        if (success) {
            this.isHacked = true;
            return {
                success: true,
                message: "Breach successful! Administrative access granted."
            };
        } else {
            this.hackAttempts++;
            return {
                success: false,
                message: `Breach failed. Attempts: ${this.hackAttempts}/3`,
                attentionIncrease: 100
            };
        }
    }
    
    executeAction(actionNumber) {
        switch(actionNumber) {
            case 1: // Download data
                if (this.lorePackage && this.lorePackage.entries && this.lorePackage.entries.length > 0) {
                    return {
                        success: true,
                        type: 'download_data',
                        message: `Data downloaded: ${this.lorePackage.entries.length} fragment(s) retrieved.`,
                        lorePackage: this.lorePackage
                    };
                } else {
                    return {
                        success: true,
                        type: 'download_data',
                        message: "Data downloaded: No readable fragments found. Storage appears empty.",
                        lorePackage: null
                    };
                }
                
            case 2: // Open door
                if (this.data.unlockedDoors.length > 0) {
                    return {
                        success: true,
                        type: 'open_door',
                        message: "Door unlocked!",
                        doorId: this.data.unlockedDoors[0]
                    };
                } else {
                    return {
                        success: false,
                        message: "No accessible doors found"
                    };
                }
                
            case 3: // Upgrade player
                return {
                    success: true,
                    type: 'upgrade_player',
                    message: "System update complete! Parameters improved.",
                    upgrade: { speed: 20, memory: 10 }
                };
                
            default:
                return {
                    success: false,
                    message: "Invalid choice"
                };
        }
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    deactivate() {
        this.isActive = false;
        if (this.graphics) this.graphics.destroy();
        if (this.screen) this.screen.destroy();
        if (this.body) this.body.destroy();
    }
}

window.Device = Device;