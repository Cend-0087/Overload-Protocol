class PasswordGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PasswordGameScene' });
        this.device = null;
        this.callback = null;
        this.userInput = "";
        this.attempts = 0;
        this.maxAttempts = 3;
    }
    
    init(data) {
        this.device = data.device;
        this.callback = data.callback;
        this.userInput = "";
        this.attempts = 0;
        this.password = this.generatePassword();
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
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x1a0a2e, 0x1a0a2e);
        graphics.fillRect(0, 0, width, height);
        
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            const particle = this.add.circle(Math.random() * width, Math.random() * height, 2, 0x9b59b6, 0.3);
            this.particles.push(particle);
        }
        
        this.tweens.add({
            targets: this.particles,
            alpha: 0.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            delay: this.tweens.stagger(100)
        });
        
        const windowWidth = 700;
        const windowHeight = 600;
        
        const shadow = this.add.rectangle(centerX + 5, centerY + 5, windowWidth, windowHeight, 0x000000, 0.5);
        
        const bg = this.add.rectangle(centerX, centerY, windowWidth, windowHeight, 0x16213e);
        bg.setStrokeStyle(2, 0x9b59b6);
        
        const border = this.add.rectangle(centerX, centerY, windowWidth - 10, windowHeight - 10, 0x000000, 0);
        border.setStrokeStyle(1, 0x6c3483);
        
        this.add.text(centerX, centerY - 260, "⚡ BREACH SYSTEM v2.0 ⚡", {
            fontSize: "18px",
            color: "#9b59b6",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY - 230, "🔐 DEVICE BREACH #2", {
            fontSize: "26px",
            color: "#e0e0e0",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        const line = this.add.graphics();
        line.lineStyle(1, 0x9b59b6, 0.5);
        line.lineBetween(centerX - 250, centerY - 200, centerX + 250, centerY - 200);
        
        this.add.text(centerX, centerY - 180, "ADJUST FREQUENCY TO REVEAL CHARACTERS", {
            fontSize: "12px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        const sliderY = centerY - 100;
        const sliderWidth = 500;
        
        const trackBg = this.add.rectangle(centerX, sliderY, sliderWidth, 8, 0x2c2c44);
        trackBg.setStrokeStyle(1, 0x444466);
        
        this.sliderFill = this.add.graphics();
        this.sliderValue = 0;
        
        const freqLabels = ["30Hz", "50Hz", "100Hz", "200Hz", "400Hz"];
        const positions = [-sliderWidth/2, -sliderWidth/4, 0, sliderWidth/4, sliderWidth/2];
        positions.forEach((pos, i) => {
            this.add.text(centerX + pos, sliderY - 15, freqLabels[i], {
                fontSize: "9px",
                color: "#666688",
                fontFamily: "Courier New"
            }).setOrigin(0.5);
            
            this.add.rectangle(centerX + pos, sliderY - 5, 2, 5, 0x666688);
        });
        
        this.sliderHandle = this.add.circle(centerX, sliderY, 16, 0xffffff);
        this.sliderHandle.setStrokeStyle(3, 0x9b59b6);
        this.sliderHandle.setInteractive({ draggable: true });
        
        this.handleGlow = this.add.circle(centerX, sliderY, 22, 0x9b59b6, 0.3);
        
        this.sliderHandle.on('drag', (pointer, dragX, dragY) => {
            let newX = Phaser.Math.Clamp(dragX, centerX - sliderWidth/2, centerX + sliderWidth/2);
            this.sliderHandle.x = newX;
            this.handleGlow.x = newX;
            this.sliderValue = Math.floor(((newX - (centerX - sliderWidth/2)) / sliderWidth) * 100);
            this.updateSliderFill(centerX, sliderY, sliderWidth);
            this.updateSpectrum();
        });
        
        const matrixY = centerY + 20;
        const slotSize = 70;
        const spacing = 15;
        const totalWidth = this.password.length * slotSize + (this.password.length - 1) * spacing;
        const startX = centerX - totalWidth / 2 + slotSize/2;
        
        this.charSlots = [];
        
        this.password.split('').forEach((char, index) => {
            const slotX = startX + (index * (slotSize + spacing));
            
            const glowBg = this.add.rectangle(slotX, matrixY, slotSize, slotSize, 0x9b59b6, 0.1);
            glowBg.setStrokeStyle(0);
            
            const slotBg = this.add.rectangle(slotX, matrixY, slotSize - 4, slotSize - 4, 0x0c0c1a);
            slotBg.setStrokeStyle(1, 0x2c2c44);
            
            this.tweens.add({
                targets: slotBg,
                alpha: { from: 0.8, to: 1 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                delay: index * 200
            });
            
            const charText = this.add.text(slotX, matrixY, "?", {
                fontSize: "36px",
                color: "#1a1a2e",
                fontFamily: "Courier New",
                fontWeight: "bold"
            }).setOrigin(0.5);
            
            const shadowText = this.add.text(slotX + 2, matrixY + 2, "?", {
                fontSize: "36px",
                color: "#000000",
                fontFamily: "Courier New",
                fontWeight: "bold"
            }).setOrigin(0.5);
            shadowText.setAlpha(0);
            
            this.charSlots.push({
                bg: slotBg,
                glowBg: glowBg,
                text: charText,
                shadow: shadowText,
                char: char,
                revealed: false,
                intensity: 0
            });
        });
        
        this.scanIndicator = this.add.text(centerX, matrixY + 60, "🔍 SCANNING...", {
            fontSize: "11px",
            color: "#ffaa00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: this.scanIndicator,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        const inputY = centerY + 150;
        
        this.add.text(centerX, inputY - 25, "ENTER DETECTED PASSWORD:", {
            fontSize: "12px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        const inputBg = this.add.rectangle(centerX, inputY + 5, 350, 45, 0x0c0c1a);
        inputBg.setStrokeStyle(2, 0x9b59b6);
        
        this.tweens.add({
            targets: inputBg,
            scaleX: 1.01,
            scaleY: 1.01,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        this.inputText = this.add.text(centerX - 165, inputY + 5, "", {
            fontSize: "26px",
            color: "#00ffcc",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0, 0.5);
        
        this.inputCursor = this.add.rectangle(centerX - 165 + 2, inputY + 5, 3, 32, 0x00ffcc, 1);
        
        this.tweens.add({
            targets: this.inputCursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        this.attemptsText = this.add.text(centerX, inputY + 60, `⚠️ ATTEMPTS LEFT: ${this.maxAttempts}`, {
            fontSize: "14px",
            color: "#ff6600",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        this.messageText = this.add.text(centerX, inputY + 110, "", {
            fontSize: "13px",
            color: "#ffff00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(centerX + 320, centerY - 280, "✕", {
            fontSize: "22px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => closeBtn.setColor('#ff5555'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#888888'));
        closeBtn.on('pointerdown', () => this.finish(false));
        
        this.setupKeyboard();
        
        this.tweens.add({
            targets: [bg, shadow, border],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.9, to: 1 },
            duration: 300,
            ease: 'Back.out'
        });
    }
    
    updateSliderFill(centerX, sliderY, sliderWidth) {
        this.sliderFill.clear();
        const fillWidth = (this.sliderValue / 100) * sliderWidth;
        
        const hue = (this.sliderValue / 100) * 240;
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.6);
        
        this.sliderFill.fillStyle(color.color, 1);
        this.sliderFill.fillRect(centerX - sliderWidth/2, sliderY - 3, fillWidth, 14);
        
        this.sliderHandle.setFillStyle(color.color);
    }
    
    updateSpectrum() {
        const charIndex = Math.floor(this.sliderValue / 100 * this.password.length);
        
        this.charSlots.forEach((slot, idx) => {
            const distance = Math.abs(idx - charIndex);
            
            if (!slot.revealed) {
                if (idx === charIndex) {
                    slot.text.setText(slot.char);
                    slot.text.setColor('#00ffcc');
                    slot.shadow.setText(slot.char);
                    slot.shadow.setAlpha(0.3);
                    
                    this.tweens.add({
                        targets: [slot.text, slot.shadow],
                        scaleX: { from: 0.5, to: 1 },
                        scaleY: { from: 0.5, to: 1 },
                        duration: 200,
                        ease: 'Back.out'
                    });
                    
                    slot.glowBg.setStrokeStyle(2, 0x00ffcc);
                    slot.bg.setStrokeStyle(2, 0x00ffcc);
                    
                    if (this.revealTimer) clearTimeout(this.revealTimer);
                    this.revealTimer = setTimeout(() => {
                        if (this.charSlots[idx] && !this.charSlots[idx].revealed) {
                            this.charSlots[idx].revealed = true;
                            this.charSlots[idx].text.setColor('#00ff00');
                            this.charSlots[idx].bg.setStrokeStyle(2, 0x00ff00);
                            this.charSlots[idx].glowBg.setStrokeStyle(2, 0x00ff00);
                            
                            this.tweens.add({
                                targets: this.charSlots[idx].text,
                                scaleX: 1.2,
                                scaleY: 1.2,
                                duration: 100,
                                yoyo: true
                            });
                        }
                    }, 1500);
                } else {
                    slot.text.setText(slot.char);
                    const alpha = Math.max(0, 0.3 - distance * 0.1);
                    slot.text.setAlpha(alpha);
                    slot.text.setColor('#8866aa');
                }
            }
        });
        
        const foundCount = this.charSlots.filter(s => s.revealed).length;
        this.scanIndicator.setText(`🔍 SCANNING... ${foundCount}/${this.password.length} characters detected`);
        
        if (foundCount === this.password.length) {
            this.scanIndicator.setText(`✅ ALL CHARACTERS DETECTED! ENTER PASSWORD`);
            this.scanIndicator.setColor('#00ff00');
        }
    }
    
    setupKeyboard() {
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkPassword();
                event.preventDefault();
            } else if (event.key === 'Backspace') {
                this.userInput = this.userInput.slice(0, -1);
                this.inputText.setText(this.userInput);
                const cursorX = this.inputText.x + this.inputText.width + 2;
                this.inputCursor.setX(cursorX);
                event.preventDefault();
            } else if (event.key.length === 1 && event.key !== ' ') {
                this.userInput += event.key.toUpperCase();
                this.inputText.setText(this.userInput);
                const cursorX = this.inputText.x + this.inputText.width + 2;
                this.inputCursor.setX(cursorX);
                event.preventDefault();
            } else if (event.key === 'Escape') {
                this.finish(false);
                event.preventDefault();
            }
        });
    }
    
    checkPassword() {
        if (this.userInput === this.password) {
            this.messageText.setText("✅ ACCESS GRANTED! BREACH SUCCESSFUL");
            this.messageText.setColor('#00ff00');
            
            this.tweens.add({
                targets: this.messageText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true
            });
            
            this.finish(true);
        } else {
            this.attempts++;
            const attemptsLeft = this.maxAttempts - this.attempts;
            
            if (attemptsLeft <= 0) {
                this.messageText.setText("❌ ACCESS LOCKED! TOO MANY ATTEMPTS");
                this.messageText.setColor('#ff5555');
                this.finish(false);
            } else {
                this.messageText.setText(`❌ INCORRECT PASSWORD! ${attemptsLeft} attempts remaining`);
                this.messageText.setColor('#ff5555');
                this.attemptsText.setText(`⚠️ ATTEMPTS LEFT: ${attemptsLeft}`);
                this.userInput = "";
                this.inputText.setText("");
                const cursorX = this.inputText.x;
                this.inputCursor.setX(cursorX);
                
                this.tweens.add({
                    targets: this.cameras.main,
                    x: this.cameras.main.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => { this.cameras.main.x = 0; }
                });
            }
        }
    }
    
    finish(success) {
        if (this.revealTimer) clearTimeout(this.revealTimer);
        
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.player) {
            echoScene.player.canMove = true;
        }
        
        const terminalScene = this.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = true;
        }
        
        this.scene.stop('PasswordGameScene');
        
        if (this.callback) {
            this.callback(success);
        }
    }
}

window.PasswordGameScene = PasswordGameScene;