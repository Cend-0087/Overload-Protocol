class PasswordGame {
    constructor(scene, device, callback) {
        this.scene = scene;
        this.device = device;
        this.callback = callback;
        this.isActive = true;
        
        // Параметры игры
        this.password = this.generatePassword();
        this.userInput = "";
        this.attempts = 0;
        this.maxAttempts = 3;
        
        // Скрытые символы
        this.hiddenChars = this.password.split('');
        this.revealedChars = new Array(this.password.length).fill('?');
        
        this.createUI();
        this.setupInput();
        this.lockPlayerControl(true);
    }
    
    generatePassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const length = Math.floor(Math.random() * 3) + 4;
        let password = "";
        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password;
    }
    
    createUI() {
        // Получаем размеры видимой области EchoScene (без терминала и UI)
        const echoScene = this.scene;
        const viewport = echoScene.cameras.main;
        
        this.viewportWidth = viewport.width;
        this.viewportHeight = viewport.height;
        
        // Координаты центра камеры
        this.centerX = viewport.centerX;
        this.centerY = viewport.centerY;
        
        // Затемнение (привязано к камере)
        this.overlay = this.scene.add.rectangle(this.centerX, this.centerY, this.viewportWidth, this.viewportHeight, 0x000000, 0.85);
        this.overlay.setDepth(15000);
        this.overlay.setScrollFactor(0);
        this.overlay.setOrigin(0.5, 0.5);
        
        // Контейнер для игры (привязан к камере)
        this.gameContainer = this.scene.add.container(this.centerX, this.centerY);
        this.gameContainer.setDepth(15001);
        
        // Рассчитываем размеры окна (90% от видимой области)
        const windowWidth = Math.min(700, this.viewportWidth * 0.8);
        const windowHeight = Math.min(550, this.viewportHeight * 0.8);
        
        // Фон окна
        this.background = this.scene.add.rectangle(0, 0, windowWidth, windowHeight, 0x1a1a1a, 0.95);
        this.background.setStrokeStyle(2, 0x9b59b6);
        
        // Заголовок
        this.title = this.scene.add.text(0, -windowHeight/2 + 40, "🔐 ВЗЛОМ УСТРОЙСТВА #2", {
            fontSize: "22px",
            color: "#9b59b6",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        // Инструкция
        this.instruction = this.scene.add.text(0, -windowHeight/2 + 80, "Настройте частоту для обнаружения символов", {
            fontSize: "12px",
            color: "#cccccc",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        // === ШКАЛА ===
        const sliderY = -80;
        const sliderWidth = windowWidth - 100;
        const sliderHeight = 8;
        
        // Фон шкалы
        this.sliderBg = this.scene.add.rectangle(0, sliderY, sliderWidth, sliderHeight, 0x333333);
        
        // Заполненная часть шкалы
        this.sliderFill = this.scene.add.rectangle(-sliderWidth/2, sliderY, 0, sliderHeight, 0x9b59b6);
        
        // Бегунок
        this.sliderHandle = this.scene.add.circle(0, sliderY, 14, 0xffffff);
        this.sliderHandle.setStrokeStyle(2, 0x9b59b6);
        this.sliderHandle.setInteractive({ useHandCursor: true, draggable: true });
        
        this.sliderValue = 0;
        
        // Область перетаскивания бегунка
        this.sliderHandle.on('drag', (pointer, dragX, dragY) => {
            let newX = Phaser.Math.Clamp(dragX, -sliderWidth/2, sliderWidth/2);
            this.sliderHandle.x = newX;
            this.sliderValue = Math.floor(((newX + sliderWidth/2) / sliderWidth) * 100);
            this.updateSliderFill(sliderWidth);
            this.updateSpectrum();
        });
        
        // Метки шкалы
        this.addSliderLabels(sliderY, sliderWidth);
        
        // === СКРЫТЫЕ СИМВОЛЫ ===
        const charsY = 30;
        const slotSize = 55;
        const totalWidth = this.password.length * slotSize;
        const startX = -totalWidth / 2 + slotSize/2;
        
        this.charSlots = [];
        
        this.password.split('').forEach((char, index) => {
            const slotX = startX + (index * slotSize);
            const slotBg = this.scene.add.rectangle(slotX, charsY, 50, 60, 0x0c0c0c);
            slotBg.setStrokeStyle(2, 0x444444);
            
            const charText = this.scene.add.text(slotX, charsY, "?", {
                fontSize: "28px",
                color: "#888888",
                fontFamily: "Courier New",
                fontWeight: "bold"
            }).setOrigin(0.5);
            
            this.charSlots.push({
                bg: slotBg,
                text: charText,
                char: char,
                revealed: false
            });
        });
        
        // Индикатор сканирования
        this.scanIndicator = this.scene.add.text(0, 110, "🎛️ Перемещайте ползунок для сканирования символов", {
            fontSize: "11px",
            color: "#ffaa00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        // === ПОЛЕ ВВОДА ПАРОЛЯ ===
        const inputY = 190;
        
        this.inputLabel = this.scene.add.text(0, inputY - 15, "ВВЕДИТЕ ОБНАРУЖЕННЫЙ ПАРОЛЬ:", {
            fontSize: "11px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.inputBg = this.scene.add.rectangle(0, inputY + 10, 300, 40, 0x0c0c0c);
        this.inputBg.setStrokeStyle(2, 0x9b59b6);
        
        this.inputText = this.scene.add.text(-140, inputY, "", {
            fontSize: "22px",
            color: "#ffffff",
            fontFamily: "Courier New"
        }).setOrigin(0, 0.5);
        
        this.inputCursor = this.scene.add.rectangle(-140 + 2, inputY, 2, 28, 0x00ffcc, 1);
        
        // Анимация курсора
        this.scene.tweens.add({
            targets: this.inputCursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Попытки
        this.attemptsText = this.scene.add.text(0, inputY + 60, `Попыток осталось: ${this.maxAttempts}`, {
            fontSize: "12px",
            color: "#ff6600",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        // Сообщение
        this.messageText = this.scene.add.text(0, inputY + 100, "", {
            fontSize: "12px",
            color: "#ffff00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        // Кнопка выхода
        this.closeBtn = this.scene.add.text(windowWidth/2 - 35, -windowHeight/2 + 20, "✕", {
            fontSize: "18px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.closeBtn.on('pointerover', () => this.closeBtn.setColor('#ff5555'));
        this.closeBtn.on('pointerout', () => this.closeBtn.setColor('#888888'));
        this.closeBtn.on('pointerdown', () => this.finish(false));
        
        // Добавляем все в контейнер
        this.gameContainer.add([
            this.background, this.title, this.instruction,
            this.sliderBg, this.sliderFill, this.sliderHandle,
            this.scanIndicator, this.inputLabel, this.inputBg,
            this.inputText, this.inputCursor, this.attemptsText,
            this.messageText, this.closeBtn
        ]);
        
        this.charSlots.forEach(slot => {
            this.gameContainer.add([slot.bg, slot.text]);
        });
        
        if (this.sliderLabels) {
            this.sliderLabels.forEach(label => {
                this.gameContainer.add(label);
            });
        }
    }
    
    addSliderLabels(sliderY, sliderWidth) {
        this.sliderLabels = [];
        const labels = ["MIN", "25%", "50%", "75%", "MAX"];
        const positions = [-sliderWidth/2, -sliderWidth/4, 0, sliderWidth/4, sliderWidth/2];
        
        labels.forEach((label, i) => {
            const text = this.scene.add.text(positions[i], sliderY + 18, label, {
                fontSize: "9px",
                color: "#666666",
                fontFamily: "Courier New"
            }).setOrigin(0.5);
            this.sliderLabels.push(text);
        });
    }
    
    updateSliderFill(sliderWidth) {
        const fillWidth = (this.sliderValue / 100) * sliderWidth;
        this.sliderFill.width = fillWidth;
        this.sliderFill.x = -sliderWidth/2 + fillWidth/2;
        
        // Меняем цвет
        const hue = (this.sliderValue / 100) * 240;
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.5);
        this.sliderFill.setFillStyle(color.color);
    }
    
    updateSpectrum() {
        // Определяем, какой символ "сканируется"
        const charIndex = Math.floor(this.sliderValue / 100 * this.password.length);
        
        if (charIndex < this.password.length && !this.charSlots[charIndex].revealed) {
            const char = this.password[charIndex];
            this.charSlots[charIndex].text.setText(char);
            this.charSlots[charIndex].text.setColor('#00ffcc');
            
            if (this.revealTimer) clearTimeout(this.revealTimer);
            this.revealTimer = setTimeout(() => {
                if (this.isActive && !this.charSlots[charIndex].revealed) {
                    this.charSlots[charIndex].revealed = true;
                    this.charSlots[charIndex].text.setColor('#00ff00');
                    this.charSlots[charIndex].bg.setStrokeStyle(2, 0x00ff00);
                }
            }, 1500);
        }
    }
    
    setupInput() {
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = false;
        }
        
        this.keyHandler = (event) => {
            if (!this.isActive) return;
            
            if (event.key === 'Enter') {
                this.checkPassword();
                event.preventDefault();
            } else if (event.key === 'Backspace') {
                this.userInput = this.userInput.slice(0, -1);
                this.updateInputDisplay();
                event.preventDefault();
            } else if (event.key.length === 1 && event.key !== ' ') {
                this.userInput += event.key.toUpperCase();
                this.updateInputDisplay();
                event.preventDefault();
            } else if (event.key === 'Escape') {
                this.finish(false);
                event.preventDefault();
            }
        };
        
        window.addEventListener('keydown', this.keyHandler);
    }
    
    updateInputDisplay() {
        this.inputText.setText(this.userInput);
        const cursorX = -140 + this.inputText.width + 2;
        this.inputCursor.setX(cursorX);
    }
    
    checkPassword() {
        if (this.userInput === this.password) {
            this.messageText.setText("✅ ПАРОЛЬ ВЕРНЫЙ! ДОСТУП ПРЕДОСТАВЛЕН");
            this.messageText.setColor('#00ff00');
            this.finish(true);
        } else {
            this.attempts++;
            const attemptsLeft = this.maxAttempts - this.attempts;
            
            if (attemptsLeft <= 0) {
                this.messageText.setText("❌ СЛИШКОМ МНОГО ПОПЫТОК! ДОСТУП ЗАБЛОКИРОВАН");
                this.messageText.setColor('#ff5555');
                this.finish(false);
            } else {
                this.messageText.setText(`❌ НЕВЕРНЫЙ ПАРОЛЬ! Осталось попыток: ${attemptsLeft}`);
                this.messageText.setColor('#ff5555');
                this.attemptsText.setText(`Попыток осталось: ${attemptsLeft}`);
                this.userInput = "";
                this.updateInputDisplay();
                
                this.scene.tweens.add({
                    targets: this.gameContainer,
                    x: this.gameContainer.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            }
        }
    }
    
    lockPlayerControl(lock) {
        const echoScene = this.scene.scene.get('EchoScene');
        if (echoScene && echoScene.player) {
            echoScene.player.canMove = !lock;
        }
    }
    
    finish(success) {
        this.isActive = false;
        
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
        
        this.lockPlayerControl(false);
        
        const terminalScene = this.scene.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = true;
        }
        
        if (this.overlay) this.overlay.destroy();
        if (this.gameContainer) this.gameContainer.destroy();
        if (this.revealTimer) clearTimeout(this.revealTimer);
        
        if (this.callback) {
            this.callback(success);
        }
    }
}

window.PasswordGame = PasswordGame;