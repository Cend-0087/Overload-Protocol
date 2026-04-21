class Device {
    constructor(scene, x, y, deviceType = 'computer') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.deviceType = deviceType;
        this.radius = 12;
        this.interactionRadius = 45;
        this.isActive = true;
        this.isHacked = false;
        this.hackAttempts = 0;
        
        // Визуальное представление - фиолетовый квадрат
        this.graphics = scene.add.rectangle(x, y, 20, 20, 0x9b59b6, 0.9);
        this.graphics.setStrokeStyle(2, 0x8e44ad, 1);
        this.graphics.setDepth(100);
        
        // Добавляем "экран" (маленький белый квадратик внутри)
        this.screen = scene.add.rectangle(x, y, 12, 12, 0xecf0f1, 0.8);
        this.screen.setDepth(101);
        
        // ДОБАВЛЯЕМ ФИЗИЧЕСКОЕ ТЕЛО
        scene.physics.add.existing(this.graphics, true); // true = статическое тело
        this.body = this.graphics.body;
        if (this.body) {
        this.body.setSize(20, 20);
        }

        
        
        // Пульсация для привлечения внимания
        this.createPulseAnimation();
        
        // Хранилище данных (лор)
        this.data = {
            id: `device_${Date.now()}_${Math.random()}`,
            type: deviceType,
            unlockedDoors: [],
            lore: this.getRandomLore()
        };
    }
    
    // Остальные методы без изменений...
    createPulseAnimation() {
        this.scene.tweens.add({
            targets: [this.graphics, this.screen],
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    getRandomLore() {
        const loreMessages = [
            "Лог 447: Система показывает аномалии в секторе 7...",
            "Личное сообщение: 'Они знают, что мы здесь'",
            "Данные экспериментов: Эхо-волны усиливаются при контакте",
            "Дневник: Сегодня снова видел тени на периферии",
            "Системный журнал: Несанкционированный доступ к памяти"
        ];
        return loreMessages[Math.floor(Math.random() * loreMessages.length)];
    }
    
    canInteract(playerX, playerY) {
        if (!this.isActive) return false;
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.interactionRadius;
    }
    
    interact() {
        if (!this.isActive) return { success: false, message: "Устройство неактивно" };
        
        if (!this.isHacked) {
            return {
                success: true,
                isHacked: false,
                message: "Подключение установлено.\nВведите - hack, чтобы взломать.",
                device: this
            };
        } else {
            return {
                success: true,
                isHacked: true,
                message: "Выберите действие:\n1) Загрузить данные на свой диск.\n2) Открыть запертую дверь.\n3) Обновить свое ПО.",
                device: this
            };
        }
    }
    
    hack(success) {
        if (success) {
            this.isHacked = true;
            return {
                success: true,
                message: "Взлом успешен! Вы получили права администратора на устройстве."
            };
        } else {
            this.hackAttempts++;
            return {
                success: false,
                message: `Взлом не удался. Попыток: ${this.hackAttempts}/3`,
                attentionIncrease: 10
            };
        }
    }
    
    executeAction(actionNumber) {
        switch(actionNumber) {
            case 1:
                return {
                    success: true,
                    type: 'download_data',
                    message: `Данные загружены: ${this.data.lore}`,
                    lore: this.data.lore
                };
            case 2:
                return {
                    success: true,
                    type: 'open_door',
                    message: "Дверь разблокирована!",
                    doorId: this.data.unlockedDoors[0]
                };
            case 3:
                return {
                    success: true,
                    type: 'upgrade_player',
                    message: "ПО обновлено! Характеристики улучшены.",
                    upgrade: { speed: 20, memory: 10 }
                };
            default:
                return {
                    success: false,
                    message: "Неверный выбор"
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