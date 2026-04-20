class PickupItem {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = 8; // размер для коллизии
        this.interactionRadius = 40; // зона взаимодействия
        this.isActive = true;
        
        // Просто красный квадрат/круг для визуального представления
        this.graphics = scene.add.circle(x, y, 8, 0xff0000);
    }
    
    // Проверка, рядом ли игрок
    canInteract(playerX, playerY) {
        if (!this.isActive) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.interactionRadius;
    }
    
    // Подобрать предмет
    pickup() {
        if (!this.isActive) return false;
        
        this.isActive = false;
        this.graphics.destroy(); // удаляем визуал
        return true;
    }
    
    // Получить позицию
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

// Экспорт
window.PickupItem = PickupItem;