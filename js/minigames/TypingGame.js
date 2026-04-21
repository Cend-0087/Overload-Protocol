class TypingGame {
    constructor(scene, device, callback) {
        this.scene = scene;
        this.device = device;
        this.callback = callback;
        this.isActive = true;
        
        // Параметры
        this.targetSequence = "";
        this.userInput = "";
        this.timeLeft = 5;
        
        // Создаем UI
        this.createUI();
        this.startGame();
    }
    
    createUI() {
        // Затемнение
        this.overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.8);
        this.overlay.setDepth(20000);
        this.overlay.setOrigin(0, 0);
        
        // Окно игры (по центру)
        const windowWidth = 500;
        const windowHeight = 300;
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        
        // Фон окна
        this.windowBg = this.scene.add.rectangle(centerX, centerY, windowWidth, windowHeight, 0x1a1a1a);
        this.windowBg.setStrokeStyle(2, 0x9b59b6);
        this.windowBg.setDepth(20001);
        
        // Текст с последовательностью
        this.sequenceText = this.scene.add.text(centerX, centerY - 60, "", {
            fontSize: "40px",
            color: "#00ffcc",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.sequenceText.setDepth(20002);
        
        // Поле ввода
        this.inputText = this.scene.add.text(centerX, centerY, "", {
            fontSize: "30px",
            color: "#ffffff",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.inputText.setDepth(20002);
        
        // Таймер
        this.timerText = this.scene.add.text(centerX, centerY + 80, "", {
            fontSize: "20px",
            color: "#ff6600",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.timerText.setDepth(20002);
        
        // Сообщение
        this.messageText = this.scene.add.text(centerX, centerY + 130, "", {
            fontSize: "16px",
            color: "#ffff00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        this.messageText.setDepth(20002);
        
        // Настройка ввода
        this.setupInput();
    }
    
    setupInput() {
        // Блокируем основной ввод
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = false;
        }
        
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
        const chars = "AB";
        this.targetSequence = "";
        for (let i = 0; i < 6; i++) {
            this.targetSequence += chars[Math.floor(Math.random() * chars.length)];
        }
        
        this.sequenceText.setText(this.targetSequence);
        this.userInput = "";
        this.inputText.setText("");
        this.timeLeft = 5;
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
        
        // Возвращаем управление
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = true;
        }
        
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