class Device {
constructor(scene, x, y, deviceType = 'computer', doorId = null) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.deviceType = deviceType;
    this.doorId = doorId; // Теперь doorId определен
    this.radius = 12;
    this.interactionRadius = 70;
    this.isActive = true;
    this.isHacked = false;
    this.hackAttempts = 0;
    this.isDiscovered = false;
    
    // Визуальное представление - фиолетовый квадрат
    this.graphics = scene.add.rectangle(x, y, 20, 20, 0x9b59b6, 0.9);
    this.graphics.setStrokeStyle(2, 0x8e44ad, 1);
    this.graphics.setDepth(100);
    this.graphics.setVisible(false);
    
    // Добавляем "экран" (маленький белый квадратик внутри)
    this.screen = scene.add.rectangle(x, y, 12, 12, 0xecf0f1, 0.8);
    this.screen.setDepth(101);
    this.screen.setVisible(false);
    
    // Добавляем физическое тело
    scene.physics.add.existing(this.graphics, true);
    this.body = this.graphics.body;
    if (this.body) {
        this.body.setSize(20, 20);
    }
    
    // Хранилище данных
    this.data = {
        id: `device_${Date.now()}_${Math.random()}`,
        type: deviceType,
        unlockedDoors: doorId ? [doorId] : [],
        lore: this.getRandomLore()
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
            terminalScene.commandLine.log(`[ОБНАРУЖЕНО] Устройство: ${this.deviceType}`, '#9b59b6');
        }
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
        if (!this.isActive || !this.isDiscovered) return false;
        
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= 45;
    }
    
    interact() {
        if (!this.isActive || !this.isDiscovered) return { success: false, message: "Устройство не обнаружено" };
        
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
                if (this.data.unlockedDoors.length > 0) {
                    return {
                        success: true,
                        type: 'open_door',
                        message: "Дверь разблокирована!",
                        doorId: this.data.unlockedDoors[0]
                    };
                } else {
                    return {
                        success: false,
                        message: "Нет доступных дверей для открытия"
                    };
                }
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