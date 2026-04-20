class TransitionZone {
    constructor(scene, x, y, width = 300, height = 300, targetLevel = 2) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.targetLevel = targetLevel; // на какой уровень переходим
        this.isActive = true;
        this.interactionRadius = Math.max(width, height) / 2 + 20; // зона взаимодействия
        
        // Визуальное представление - желтый квадрат
        this.graphics = scene.add.rectangle(x, y, width, height, 0xffaa00, 0.5);
        this.graphics.setStrokeStyle(2, 0xffdd44, 1);
        
        // Добавляем пульсирующую анимацию
        this.createPulseAnimation();
    }
    
    createPulseAnimation() {
        // Пульсация прозрачности
        this.scene.tweens.add({
            targets: this.graphics,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Пульсация обводки
        this.scene.tweens.add({
            targets: this.graphics,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
    
    // Проверка, рядом ли игрок
    canInteract(playerX, playerY) {
        if (!this.isActive) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.interactionRadius;
    }
    
    // Взаимодействие с зоной перехода
    interact() {
        if (!this.isActive) return false;
        
        // Возвращаем информацию о переходе
        return {
            success: true,
            targetLevel: this.targetLevel,
            zone: this
        };
    }
    
    // Получить позицию
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    // Деактивировать зону
    deactivate() {
        this.isActive = false;
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}

// Экспорт
window.TransitionZone = TransitionZone;