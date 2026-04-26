class TypingGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TypingGameScene' });
        this.device = null;
        this.callback = null;
        this.userInput = "";
        this.targetSequence = "";
        this.timeLeft = 5;
    }
    
    init(data) {
        this.device = data.device;
        this.callback = data.callback;
        this.userInput = "";
        this.targetSequence = this.generateSequence();
        this.timeLeft = 5;
    }
    
    generateSequence() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let sequence = "";
        for (let i = 0; i < 6; i++) {
            sequence += chars[Math.floor(Math.random() * chars.length)];
        }
        return sequence;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        this.add.rectangle(centerX, centerY, width, height, 0x000000);
        
        const windowWidth = 500;
        const windowHeight = 300;
        
        const bg = this.add.rectangle(centerX, centerY, windowWidth, windowHeight, 0x1a1a1a);
        bg.setStrokeStyle(2, 0x9b59b6);
        
        this.add.text(centerX, centerY - 120, "🔐 DEVICE BREACH #1", {
            fontSize: "24px",
            color: "#9b59b6",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY - 50, "Enter the sequence:", {
            fontSize: "14px",
            color: "#cccccc",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.sequenceText = this.add.text(centerX, centerY + 10, this.targetSequence, {
            fontSize: "40px",
            color: "#00ffcc",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        const inputBg = this.add.rectangle(centerX, centerY + 70, 300, 40, 0x0c0c0c);
        inputBg.setStrokeStyle(2, 0x9b59b6);
        
        this.inputText = this.add.text(centerX - 140, centerY + 70, "", {
            fontSize: "24px",
            color: "#ffffff",
            fontFamily: "Courier New"
        }).setOrigin(0, 0.5);
        
        this.inputCursor = this.add.rectangle(centerX - 140 + 2, centerY + 70, 2, 30, 0x00ffcc, 1);
        
        this.tweens.add({
            targets: this.inputCursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        this.timerText = this.add.text(centerX, centerY + 130, `TIME: ${this.timeLeft}s`, {
            fontSize: "18px",
            color: "#ff6600",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.messageText = this.add.text(centerX, centerY + 170, "", {
            fontSize: "14px",
            color: "#ffff00",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(centerX + 220, centerY - 130, "✕", {
            fontSize: "20px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => closeBtn.setColor('#ff5555'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#888888'));
        closeBtn.on('pointerdown', () => this.finish(false));
        
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(`TIME: ${this.timeLeft}s`);
                if (this.timeLeft <= 0) {
                    this.timerEvent.remove();
                    this.finish(false);
                }
            },
            repeat: 4
        });
        
        this.setupKeyboard();
    }
    
    setupKeyboard() {
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkInput();
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
                
                if (this.userInput.length === this.targetSequence.length) {
                    this.checkInput();
                }
                event.preventDefault();
            } else if (event.key === 'Escape') {
                this.finish(false);
                event.preventDefault();
            }
        });
    }
    
    checkInput() {
        if (this.timerEvent) this.timerEvent.remove();
        
        if (this.userInput === this.targetSequence) {
            this.messageText.setText("✅ BREACH SUCCESSFUL!");
            this.messageText.setColor('#00ff00');
            this.finish(true);
        } else {
            this.messageText.setText("❌ INCORRECT SEQUENCE!");
            this.messageText.setColor('#ff5555');
            this.finish(false);
        }
    }
    
    finish(success) {
        if (this.timerEvent) this.timerEvent.remove();
        
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.player) {
            echoScene.player.canMove = true;
        }
        
        const terminalScene = this.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = true;
        }
        
        this.scene.stop('TypingGameScene');
        
        if (this.callback) {
            this.callback(success);
        }
    }
}

window.TypingGameScene = TypingGameScene;