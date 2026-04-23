class TestMode {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.normalSpeed = 180; // Сохраняем нормальную скорость
        this.testSpeed = 500;   // Скорость в тестовом режиме
    }
    
    enable() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Увеличиваем скорость игрока
        if (this.scene.gameConfig) {
            this.scene.gameConfig.playerSpeed = this.testSpeed;
            console.log(`[TestMode] Скорость игрока увеличена до ${this.testSpeed}`);
        }
        
        // Делаем видимыми все объекты
        this.revealAllObjects();
        
        // Меняем цвет стен
        this.changeWallsColor(0x444444);
        
        // Логируем в терминал
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene && terminalScene.commandLine) {
            terminalScene.commandLine.success("Тестовый режим ВКЛЮЧЕН");
            terminalScene.commandLine.log("Скорость увеличена, все объекты видны", '#888888');
        }
        
        console.log('[TestMode] Режим включен');
    }
    
    disable() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Возвращаем нормальную скорость игроку
        if (this.scene.gameConfig) {
            this.scene.gameConfig.playerSpeed = this.normalSpeed;
            console.log(`[TestMode] Скорость игрока возвращена до ${this.normalSpeed}`);
        }
        
        // Скрываем все объекты и сбрасываем флаги
        this.hideAllObjects();
        
        // Возвращаем цвет стен обратно
        this.changeWallsColor(0x0a0a0a);
        
        // Логируем в терминал
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene && terminalScene.commandLine) {
            terminalScene.commandLine.success("Тестовый режим ВЫКЛЮЧЕН");
            terminalScene.commandLine.log("Скорость восстановлена, объекты скрыты", '#888888');
        }
        
        console.log('[TestMode] Режим выключен');
    }
    
    revealAllObjects() {
        // Делаем видимыми все предметы
        if (this.scene.items) {
            this.scene.items.forEach(item => {
                if (!item.isDiscovered) {
                    item.isDiscovered = true;
                    if (item.graphics) {
                        item.graphics.setVisible(true);
                    }
                }
            });
        }
        
        // Делаем видимыми все устройства
        if (this.scene.devices) {
            this.scene.devices.forEach(device => {
                if (!device.isDiscovered) {
                    device.isDiscovered = true;
                    if (device.graphics) {
                        device.graphics.setVisible(true);
                    }
                    if (device.screen) {
                        device.screen.setVisible(true);
                    }
                }
            });
        }
        
        // Делаем видимыми все зоны перехода
        if (this.scene.transitionZones) {
            this.scene.transitionZones.forEach(zone => {
                if (!zone.isDiscovered) {
                    zone.isDiscovered = true;
                    if (zone.graphics) {
                        zone.graphics.setVisible(true);
                    }
                }
            });
        }
    }
    
    hideAllObjects() {
        // Скрываем все предметы и сбрасываем флаги
        if (this.scene.items) {
            this.scene.items.forEach(item => {
                item.isDiscovered = false;
                if (item.graphics) {
                    item.graphics.setVisible(false);
                }
            });
        }
        
        // Скрываем все устройства и сбрасываем флаги
        if (this.scene.devices) {
            this.scene.devices.forEach(device => {
                device.isDiscovered = false;
                if (device.graphics) {
                    device.graphics.setVisible(false);
                }
                if (device.screen) {
                    device.screen.setVisible(false);
                }
            });
        }
        
        // Скрываем все зоны перехода и сбрасываем флаги
        if (this.scene.transitionZones) {
            this.scene.transitionZones.forEach(zone => {
                zone.isDiscovered = false;
                if (zone.graphics) {
                    zone.graphics.setVisible(false);
                }
            });
        }
    }
    
    changeWallsColor(color) {
        if (this.scene.walls) {
            this.scene.walls.getChildren().forEach(wall => {
                if (wall && wall.setFillStyle) {
                    wall.setFillStyle(color);
                }
            });
        }
    }
}

window.TestMode = TestMode;