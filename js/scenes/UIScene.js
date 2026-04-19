class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
        this.isInputActive = false;
        this.commandLine = null;
        this.interfaceElements = null;
        this.glitchCounter = 0;
        this.simpleGlitch = null;
    }

    create() {
        console.log('[UIScene] create()');

        // Создаем эффект
        this.simpleGlitch = new SimpleGlitchEffect(this);

        this.setupCameras();
        this.createUIElements();
        this.commandLine = new CommandLine(this, this.consoleCamera);
        this.commandLine.create();

        this.cameras.main.ignore(this.commandLine.container);
        this.consoleCamera.ignore(this.uiElements);

        this.setupEventHandlers();
        this.updateViewports();
        this.scale.on('resize', this.updateViewports, this);
        this.startUIUpdates();

        // Для отладки
        window.killGlitch = () => {
            if (this.simpleGlitch) this.simpleGlitch.destroy();
        };

        console.log('[UIScene] Инициализация завершена');
    }

    setupCameras() {
        this.consoleCamera = this.cameras.add();
        this.cameras.main.setBackgroundColor('#1a1a1a');
        console.log('[UIScene] Камеры настроены: main и consoleCamera');
    }

    createUIElements() {
        // Только элементы правой панели, без командной строки!
        this.uiElements = this.add.container(0, 0);

        const title = this.add.text(30, 40, 'SYSTEM INTERFACE', {
            fontSize: '24px', color: '#ffcc00', fontFamily: 'Courier New'
        }).setShadow(0, 0, '#ffff00', 3);

        this.memoryText = this.add.text(30, 120, 'MEMORY: 0/45', {
            fontSize: '20px', color: '#00ffcc', fontFamily: 'Courier New'
        });

        this.attentionText = this.add.text(30, 170, 'ATTENTION: 0%', {
            fontSize: '18px', color: '#ff6666', fontFamily: 'Courier New'
        });

        this.uiElements.add([title, this.memoryText, this.attentionText]);

        console.log('[UIScene] UI элементы созданы (память и внимание)');
    }

    setupEventHandlers() {
        // Обработка клика для активации командной строки
        this.input.on('pointerdown', (pointer) => {
            if (!this.commandLine) return;

            const worldPoint = this.consoleCamera.getWorldPoint(pointer.x, pointer.y);
            if (this.commandLine.cmdBg.getBounds().contains(worldPoint.x, worldPoint.y)) {
                this.activateInput();
            } else {
                this.deactivateInput();
            }
        });

        // Обработка клавиатуры
        this.input.keyboard.on('keydown', (event) => {
            if ((event.code === 'Slash' || event.key === '/') && !this.isInputActive) {
                event.preventDefault();
                this.activateInput();
            } else {
                this.handleTyping(event);
            }
        });

        console.log('[UIScene] Обработчики событий настроены');
    }

    activateInput() {
        if (!this.commandLine) return;

        this.isInputActive = true;
        this.commandLine.activate();

        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = false;
        }

        console.log('[UIScene] Командная строка активирована');
    }

    deactivateInput() {
        if (!this.commandLine) return;

        this.isInputActive = false;
        this.commandLine.deactivate();

        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = true;
        }

        console.log('[UIScene] Командная строка деактивирована');
    }

    handleTyping(event) {
        if (!this.isInputActive || !this.commandLine) return;

        if (event.key === 'Enter') {
            const command = this.commandLine.getText();
            console.log(`[UIScene] Введена команда: "${command}"`);

            this.isInputActive = false;

            this.flashTerminalConfirm(() => {
                this.executeCommand(command);

                this.time.delayedCall(400, () => {
                    this.commandLine.clear();
                    this.commandLine.setColor('#ffffff');
                    this.deactivateInput();
                });
            });
            return;
        }

        if (event.key === 'Backspace') {
            const currentText = this.commandLine.getText();
            this.commandLine.setText(currentText.slice(0, -1));
        } else if (event.key === 'Escape') {
            this.deactivateInput();
        } else if (event.key.length === 1 && event.code !== 'Slash') {
            if (this.commandLine.inputText.color === '#ff4444') {
                this.commandLine.setColor('#ffffff');
            }
            this.commandLine.setText(this.commandLine.getText() + event.key);
        }

        this.commandLine.updateCursorPosition();
    }

    executeCommand(cmd) {
        cmd = cmd.toLowerCase().trim();
        console.log(`[UIScene] Команда: "${cmd}"`);

        if (cmd === '') return;

        if (cmd === 'clear') {
            console.log('[UIScene] CLEAR - очистка всего');
            this.registry.set('memory', 0);
            this.events.emit('command-clear');
            this.commandLine.setColor('#00ffcc');
            this.flashSuccess();

            // ПОЛНОСТЬЮ уничтожаем эффект если он активен
            if (this.simpleGlitch) {
                this.simpleGlitch.destroy();
            }
        } else {
            console.log(`[UIScene] Ошибка: "${cmd}"`);
            this.commandLine.setColor('#ff4444');

            // Пересоздаем эффект (на случай если он в странном состоянии)
            if (this.simpleGlitch) {
                this.simpleGlitch.destroy();
                this.simpleGlitch = new SimpleGlitchEffect(this);
            }

            // Запускаем эффект
            this.simpleGlitch.start(600);
        }
    }

    triggerGlitchEffect() {
        console.log(`[UIScene] === НАЧАЛО ГЛИТЧ ЭФФЕКТА #${++this.glitchCounter} ===`);

        // Временно отключаем все пост-эффекты
        const cams = [this.cameras.main, this.consoleCamera];
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.cameras && echoScene.cameras.main) {
            cams.push(echoScene.cameras.main);
        }

        cams.forEach((cam, index) => {
            if (!cam) return;

            // Полностью очищаем все пайплайны с камеры
            console.log(`[UIScene] Камера ${index}: очищаем все пайплайны`);
            const pipelines = cam.postPipelines;
            if (pipelines) {
                pipelines.forEach(pipeline => {
                    if (pipeline && pipeline.name) {
                        console.log(`[UIScene] Камера ${index}: удаляем пайплайн ${pipeline.name}`);
                        cam.removePostPipeline(pipeline.name);
                    }
                });
            }

            // Создаем новый пайплайн с задержкой
            this.time.delayedCall(50, () => {
                console.log(`[UIScene] Камера ${index}: создаем новый пайплайн GlitchPipeline`);
                cam.setPostPipeline(GlitchPipeline);
                const fx = cam.getPostPipeline(GlitchPipeline);

                if (fx) {
                    fx.intensity = 1.0;
                    console.log(`[UIScene] Камера ${index}: интенсивность = ${fx.intensity}`);

                    this.tweens.add({
                        targets: fx,
                        intensity: 0,
                        duration: 600,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            console.log(`[UIScene] Камера ${index}: эффект завершен`);
                            // Опционально: удаляем пайплайн после завершения
                            // cam.removePostPipeline(GlitchPipeline);
                        }
                    });
                }
            });
        });
    }

    flashSuccess() {
        this.commandLine.cmdBg.setStrokeStyle(2, 0x00ffcc);
        this.tweens.add({
            targets: this.commandLine.cmdBg,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                if (this.commandLine && this.commandLine.cmdBg) {
                    this.commandLine.cmdBg.setStrokeStyle(1, 0x333333);
                    this.commandLine.cmdBg.setAlpha(0.9);
                }
            }
        });
    }

    cleanupEffects() {
        console.log('[UIScene] Очистка всех эффектов');

        // Останавливаем глитч эффект
        if (this.simpleGlitch) {
            this.simpleGlitch.forceStop();
        }

        // Сбрасываем все камеры
        const cameras = [this.cameras.main, this.consoleCamera];
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.cameras && echoScene.cameras.main) {
            cameras.push(echoScene.cameras.main);
        }

        cameras.forEach(cam => {
            if (cam) {
                cam.stopShake();
                cam.clearFlash();

                const fx = cam.getPostPipeline(GlitchPipeline);
                if (fx) {
                    fx.intensity = 0;
                }
            }
        });
    }


    flashTerminalConfirm(callback) {
        if (!this.commandLine) {
            callback();
            return;
        }

        this.commandLine.cmdBg.setStrokeStyle(2, 0xffffff);
        this.tweens.add({
            targets: this.commandLine.cmdBg,
            alpha: 0.5,
            duration: 60,
            yoyo: true,
            onComplete: () => {
                if (this.commandLine && this.commandLine.cmdBg) {
                    this.commandLine.cmdBg.setStrokeStyle(1, 0x333333);
                    this.commandLine.cmdBg.setAlpha(0.9);
                }
                callback();
            }
        });
    }

updateViewports() {
    const totalWidth = this.scale.width;
    const totalHeight = this.scale.height;
    const uiWidth = this.registry.get('uiWidth');
    const echoWidth = Math.max(totalWidth - uiWidth, 400);
    
    // Правая камера (UI) - от echoWidth до конца экрана
    if (this.cameras.main) {
        this.cameras.main.setViewport(echoWidth, 0, uiWidth, totalHeight);
    }
    
    // Левая камера (консоль/игра) - от 0 до echoWidth
    if (this.consoleCamera) {
        this.consoleCamera.setViewport(0, 0, echoWidth, totalHeight);
    }
    
    // Позиционируем командную строку
    if (this.commandLine) {
        this.commandLine.setPosition(0, totalHeight);
        this.commandLine.setSize(echoWidth, 40);
    }
}

    startUIUpdates() {
        this.time.addEvent({
            delay: 150,
            callback: this.updateUI,
            callbackScope: this,
            loop: true
        });
    }

    updateUI() {
        const mem = this.registry.get('memory');
        const max = this.registry.get('maxMemory');
        const att = this.registry.get('attention');

        this.memoryText.setText(`MEMORY: ${mem}/${max}`);
        this.memoryText.setColor(mem > max * 0.75 ? '#ff4444' : '#00ffcc');
        this.attentionText.setText(`ATTENTION: ${att}%`);
    }

    triggerOverload(duration = 3000) {
        console.log('[UIScene] Триггер перегрузки системы');

        this.registry.set('isOverloaded', true);

        const scenes = [this, this.scene.get('EchoScene')];
        scenes.forEach(s => {
            if (s && s.cameras && s.cameras.main) {
                s.cameras.main.shake(duration, 0.01);
            }
        });

        const glitchInterval = this.time.addEvent({
            delay: 50,
            callback: () => this.createInterfaceGlitch(),
            repeat: duration / 50
        });

        this.cameras.main.setFlash(duration, 0xffffff);

        this.time.delayedCall(duration, () => {
            this.registry.set('isOverloaded', false);
            this.resetUI();
            console.log('[UIScene] Перегрузка завершена');
        });
    }

    testGlitch() {
        console.log('[UIScene] РУЧНОЙ ВЫЗОВ ГЛИТЧА');
        this.glitchCounter++;
        this.triggerGlitchEffect();
    }

    createInterfaceGlitch() {
        if (Math.random() > 0.7) {
            const originalMemoryText = `MEMORY: ${this.registry.get('memory')}/${this.registry.get('maxMemory')}`;
            const chars = '01X#@%&?';

            this.memoryText.setText(originalMemoryText.split('').map(char =>
                Math.random() > 0.8 ? chars[Math.floor(Math.random() * chars.length)] : char
            ).join(''));
            this.memoryText.setX(30 + Math.random() * 10 - 5);
            this.memoryText.setColor(Math.random() > 0.5 ? '#ff0000' : '#00ffff');
        }

        let block = this.add.rectangle(
            Math.random() * this.scale.width,
            Math.random() * this.scale.height,
            Math.random() * 100,
            Math.random() * 2,
            0xffffff,
            Math.random()
        );

        this.time.delayedCall(50, () => block.destroy());
    }

    resetUI() {
        this.memoryText.setX(30);
        this.memoryText.setColor('#00ffcc');
        this.updateUI();
    }
}