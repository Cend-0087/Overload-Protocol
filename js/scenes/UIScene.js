class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    create() {
        // 1. Сначала инициализируем переменные состояний
        this.isInputActive = false;

        // 2. Создаем камеры (основную и консольную)
        this.consoleCamera = this.cameras.add();
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // 3. Создаем элементы правой панели
        this.uiElements = this.add.container(0, 0);
        const title = this.add.text(30, 40, 'SYSTEM INTERFACE', { fontSize: '24px', color: '#ffcc00', fontFamily: 'Courier New' }).setShadow(0, 0, '#ffff00', 3);
        this.memoryText = this.add.text(30, 120, 'MEMORY: 0/45', { fontSize: '20px', color: '#00ffcc', fontFamily: 'Courier New' });
        this.attentionText = this.add.text(30, 170, 'ATTENTION: 0%', { fontSize: '18px', color: '#ff6666', fontFamily: 'Courier New' });
        this.uiElements.add([title, this.memoryText, this.attentionText]);

        // 4. Создаем консоль
        this.commandLineContainer = this.add.container(0, 0);
        this.cmdBg = this.add.rectangle(0, 0, 100, 40, 0x000000, 0.9).setOrigin(0, 1).setStrokeStyle(1, 0x333333).setInteractive();
        this.prefix = this.add.text(10, -30, '> ', { fontSize: '18px', color: '#00ffcc', fontFamily: 'Courier New' });
        this.inputText = this.add.text(35, -30, '', { fontSize: '18px', color: '#ffffff', fontFamily: 'Courier New' });
        this.cursorRect = this.add.rectangle(35, -20, 10, 2, 0x00ffcc).setOrigin(0, 0).setAlpha(0);
        this.placeholder = this.add.text(35, -30, 'CLICK TO TYPE OR PRESS [/]', { fontSize: '14px', color: '#444444', fontFamily: 'Courier New' });

        this.commandLineContainer.add([this.cmdBg, this.prefix, this.inputText, this.cursorRect, this.placeholder]);

        // 5. Игнорирование камер (чтобы не двоилось)
        this.cameras.main.ignore(this.commandLineContainer);
        this.consoleCamera.ignore(this.uiElements);

        // 6. Только ТЕПЕРЬ вызываем обновление вьюпортов и вешаем ресайз
        this.updateViewports(); 
        this.scale.on('resize', this.updateViewports, this);

        // ... остальной код (tweens, input.on('pointerdown'), keyboard.on) остается без изменений ...

        this.cursorTween = this.tweens.add({ targets: this.cursorRect, alpha: 1, duration: 500, yoyo: true, loop: -1, paused: true });

        this.input.on('pointerdown', (pointer) => {
            const worldPoint = this.consoleCamera.getWorldPoint(pointer.x, pointer.y);
            if (this.cmdBg.getBounds().contains(worldPoint.x, worldPoint.y)) {
                this.activateInput();
            } else {
                this.deactivateInput();
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            // Проверяем физический код клавиши (Slash — это кнопка рядом с правым Shift)
            // Либо оставляем проверку на символ "/", если вдруг кто-то сменил раскладку программно
            if ((event.code === 'Slash' || event.key === '/') && !this.isInputActive) {
                event.preventDefault();
                this.activateInput();
            } else {
                this.handleTyping(event);
            }
        });

        this.time.addEvent({ delay: 150, callback: this.updateUI, callbackScope: this, loop: true });
    }

    activateInput() {
        this.isInputActive = true;
        this.placeholder.setVisible(false);
        this.cursorTween.resume();
        this.cursorRect.setAlpha(1);
        this.cmdBg.setStrokeStyle(1, 0x00ffcc);
        this.scene.get('EchoScene').input.keyboard.enabled = false;
    }

    deactivateInput() {
        this.isInputActive = false;
        this.placeholder.setVisible(this.inputText.text.length === 0);
        this.cursorTween.pause();
        this.cursorRect.setAlpha(0);
        // this.cmdBg.setStrokeStyle(1, 0x333333);
        this.scene.get('EchoScene').input.keyboard.enabled = true;
    }

    handleTyping(event) {
        if (!this.isInputActive) return;
    
        // 1. Если нажат Enter
        if (event.key === 'Enter') {
            const command = this.inputText.text;
            this.isInputActive = false; // Блокируем ввод на время анимации
        
            this.flashTerminalConfirm(() => {
                this.executeCommand(command);
                
                // Очищаем текст и возвращаем курсор в начало через небольшую паузу
                // чтобы игрок успел увидеть результат (красный/бирюзовый цвет)
                this.time.delayedCall(400, () => {
                    this.inputText.setText('');
                    this.inputText.setColor('#ffffff'); // Возвращаем белый для следующего ввода
                    this.cursorRect.setX(35);
                    this.deactivateInput();
                });
            });
            return;
        }
    
        // 2. Если нажат Backspace
        if (event.key === 'Backspace') {
            this.inputText.setText(this.inputText.text.slice(0, -1));
        } 
        // 3. Если нажат Escape
        else if (event.key === 'Escape') {
            this.deactivateInput();
        } 
        // 4. Печать символа (проверяем, что это один символ и не служебная клавиша)
        else if (event.key.length === 1 && event.code !== 'Slash') {
            // Принудительно ставим белый цвет, если до этого была ошибка (красный)
            if (this.inputText.color === '#ff4444') {
                this.inputText.setColor('#ffffff');
            }
            this.inputText.setText(this.inputText.text + event.key);
        }
    
        // ВАЖНО: Обновляем положение курсора ВСЕГДА в конце метода
        this.cursorRect.setX(this.inputText.x + this.inputText.width + 2);
    }
    
    executeCommand(cmd) {
        cmd = cmd.toLowerCase().trim();
        if (cmd === '') return;
    
        if (cmd === 'clear') {
            this.registry.set('memory', 0);
            this.events.emit('command-clear');
            this.inputText.setColor('#00ffcc'); // Подсветка успеха
        } else {
            this.inputText.setColor('#ff4444'); // Подсветка ошибки
            // Эффект тряски при ошибке
            this.tweens.add({
                targets: this.commandLineContainer,
                x: { from: 0, to: 5 },
                duration: 50,
                yoyo: true,
                repeat: 3,
                onComplete: () => this.commandLineContainer.setX(0)
            });
        }
    }
    
    flashTerminalConfirm(callback) {
        // Просто быстрый визуальный отклик рамки
        this.cmdBg.setStrokeStyle(2, 0xffffff);
        this.tweens.add({
            targets: this.cmdBg,
            alpha: 0.5,
            duration: 60,
            yoyo: true,
            onComplete: () => {
                this.cmdBg.setStrokeStyle(1, 0x333333);
                this.cmdBg.setAlpha(0.9);
                callback();
            }
        });
    }

    updateViewports() {
        const totalWidth = this.scale.width;
        const totalHeight = this.scale.height;
        const uiWidth = this.registry.get('uiWidth');
        const echoWidth = totalWidth - uiWidth;

        // Безопасная проверка: выполняем позиционирование только если объекты уже созданы
        if (this.cameras.main) {
            this.cameras.main.setViewport(echoWidth, 0, uiWidth, totalHeight);
        }

        if (this.consoleCamera && this.commandLineContainer) {
            this.consoleCamera.setViewport(0, 0, echoWidth, totalHeight);
            this.commandLineContainer.setPosition(0, totalHeight);
            this.cmdBg.setSize(echoWidth, 40);
        }
    }

    updateUI() {
        const mem = this.registry.get('memory');
        const max = this.registry.get('maxMemory');
        const att = this.registry.get('attention');
        this.memoryText.setText(`MEMORY: ${mem}/${max}`);
        this.memoryText.setColor(mem > max * 0.75 ? '#ff4444' : '#00ffcc');
        this.attentionText.setText(`ATTENTION: ${att}%`);
    }
}