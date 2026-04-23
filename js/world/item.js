class PickupItem {
    constructor(scene, x, y, type = 'lore', data = null) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type; // 'lore', 'upgrade', 'stat'
        this.data = data; // Дополнительные данные для предмета
        this.radius = 8;
        this.interactionRadius = 50;
        this.isActive = true;
        this.isDiscovered = false;
        
        // Цвет в зависимости от типа
        let color = 0xff0000; // красный для lore
        if (type === 'upgrade') color = 0x00ff00; // зеленый для улучшений
        if (type === 'stat') color = 0x00ccff; // голубой для статов
        
        // Визуальное представление
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
            let typeText = 'Предмет';
            if (this.type === 'lore') typeText = 'Лор-предмет';
            if (this.type === 'upgrade') typeText = 'Улучшение';
            if (this.type === 'stat') typeText = 'Стат-предмет';
            terminalScene.commandLine.log(`[ОБНАРУЖЕНО] ${typeText}`, '#ff0000');
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
        
        // Возвращаем информацию о том, что дал предмет
        return {
            success: true,
            type: this.type,
            data: this.data
        };
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

window.PickupItem = PickupItem;