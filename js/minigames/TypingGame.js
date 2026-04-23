class TypingGame {
    constructor(scene, device, callback) {
        this.scene = scene;
        this.device = device;
        this.callback = callback;
        this.isActive = true;
        
        // Параметры
        this.targetSequence = "";
        this.userInput = "";
        this.timeLeft = 9;
        
        // Создаем UI (привязанный к камере)
        this.createUI();
        this.startGame();
    }
    
    createUI() {
        // Получаем координаты центра камеры
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        // Затемнение (привязано к камере)
        this.overlay = this.scene.add.rectangle(centerX, centerY, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.8);
        this.overlay.setDepth(20000);
        this.overlay.setScrollFactor(0); // Привязываем к камере
        this.overlay.setOrigin(0.5, 0.5);
        
        // Окно игры (по центру камеры)
        const windowWidth = 500;
        const windowHeight = 300;
        
        // Фон окна
        this.windowBg = this.scene.add.rectangle(centerX, centerY, windowWidth, windowHeight, 0x1a1a1a);
        this.windowBg.setStrokeStyle(2, 0x9b59b6);
        this.windowBg.setDepth(20001);
        this.windowBg.setScrollFactor(0); // Привязываем к камере
        
        // Текст с последовательностью
        this.sequenceText = this.scene.add.text(centerX, centerY - 60, "", {
            fontSize: "40px",
            color: "#00ffcc",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.sequenceText.setDepth(20002);
        this.sequenceText.setScrollFactor(0); // Привязываем к камере
        
        // Поле ввода
        this.inputText = this.scene.add.text(centerX, centerY, "", {
            fontSize: "30px",
            color: "#ffffff",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.inputText.setDepth(20002);
        this.inputText.setScrollFactor(0); // Привязываем к камере
        
        // Таймер
        this.timerText = this.scene.add.text(centerX, centerY + 80, "", {
            fontSize: "20px",
            color: "#ff6600",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.timerText.setDepth(20002);
        this.timerText.setScrollFactor(0); // Привязываем к камере
        
        // Сообщение
        this.messageText = this.scene.add.text(centerX, centerY + 130, "", {
            fontSize: "16px",
            color: "#ffff00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.messageText.setDepth(20002);
        this.messageText.setScrollFactor(0); // Привязываем к камере
        
        // Настройка ввода и блокировка управления
        this.setupInput();
        this.lockPlayerControl(true);
    }
    
    lockPlayerControl(lock) {
        // Блокируем движение игрока
        const echoScene = this.scene.scene.get('EchoScene');
        if (echoScene && echoScene.player) {
            echoScene.player.canMove = !lock;
        }
        
        // Блокируем ввод в терминале
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene) {
            if (lock) {
                terminalScene.input.keyboard.enabled = false;
                if (terminalScene.commandLine) {
                    terminalScene.commandLine.deactivate();
                }
            } else {
                terminalScene.input.keyboard.enabled = true;
            }
        }
        
        // Блокируем общий ввод в сцене
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = !lock;
        }
    }
    
    setupInput() {
        // Обработчик клавиш
        this.keyHandler = (event) => {
            if (!this.isActive) return;
            
            if (event.key === 'Enter') {
                this.checkInput();
                event.preventDefault();
            } else if (event.key === 'Backspace') {
                this.userInput = this.userInput.slice(0, -1);
                this.inputText.setText(this.userInput);
                event.preventDefault();
            } else if (event.key.length === 1 && event.key !== ' ') {
                this.userInput += event.key.toUpperCase();
                this.inputText.setText(this.userInput);
                event.preventDefault();
                
                // Автоотправка при полном вводе
                if (this.userInput.length === this.targetSequence.length) {
                    this.checkInput();
                }
            } else if (event.key === 'Escape') {
                this.finish(false);
                event.preventDefault();
            }
        };
        
        window.addEventListener('keydown', this.keyHandler);
    }
    
    startGame() {
        // Генерируем последовательность
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        this.targetSequence = "";
        for (let i = 0; i < 2; i++) {
            this.targetSequence += chars[Math.floor(Math.random() * chars.length)];
        }
        
        this.sequenceText.setText(this.targetSequence);
        this.userInput = "";
        this.inputText.setText("");
        this.timeLeft = 10;
        this.timerText.setText(`Время: ${this.timeLeft}с`);
        this.messageText.setText("");
        
        // Таймер
        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(`Время: ${this.timeLeft}с`);
                
                if (this.timeLeft <= 0) {
                    this.finish(false);
                }
            },
            repeat: 4
        });
    }
    
    checkInput() {
        if (this.timerEvent) this.timerEvent.remove();
        
        if (this.userInput === this.targetSequence) {
            this.messageText.setText("✅ ВЗЛОМ УСПЕШЕН!");
            this.messageText.setColor('#00ff00');
            this.finish(true);
        } else {
            this.messageText.setText("❌ НЕВЕРНЫЙ КОД!");
            this.messageText.setColor('#ff5555');
            this.finish(false);
        }
    }
    
    finish(success) {
        this.isActive = false;
        
        // Убираем обработчик
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
        
        // Разблокируем управление
        this.lockPlayerControl(false);
        
        // Удаляем UI
        if (this.overlay) this.overlay.destroy();
        if (this.windowBg) this.windowBg.destroy();
        if (this.sequenceText) this.sequenceText.destroy();
        if (this.inputText) this.inputText.destroy();
        if (this.timerText) this.timerText.destroy();
        if (this.messageText) this.messageText.destroy();
        if (this.timerEvent) this.timerEvent.remove();
        
        if (this.callback) {
            this.callback(success);
        }
    }
}

window.TypingGame = TypingGame;