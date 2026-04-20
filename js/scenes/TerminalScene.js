// js/scenes/TerminalScene.js

class TerminalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TerminalScene', active: true });

        this.commandLine = null;
        this.isInputActive = false;
        this.consoleCamera = null;
    }

    create() {
        console.log('[TerminalScene] create()');

        // Получаем ссылку на камеру из UIScene
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.consoleCamera) {
            this.consoleCamera = uiScene.consoleCamera;
        }

        // Создаем терминал
        this.commandLine = new CommandLine(this, this.consoleCamera);
        this.commandLine.create();

        // Настройка обработчиков
        this.setupEventHandlers();

        // Обновляем вьюпорт при ресайзе
        this.scale.on('resize', this.updateViewport, this);
        this.updateViewport();

        console.log('[TerminalScene] Инициализация завершена');
    }

    setupEventHandlers() {
        // Обработка клика для активации
        this.input.on('pointerdown', (pointer) => {
            if (!this.commandLine) return;

            // Проверяем, кликнули ли по области терминала
            const terminalBg = this.commandLine.terminalBg;
            if (!terminalBg) return;

            const bounds = terminalBg.getBounds();
            const clickY = pointer.y;

            if (clickY >= bounds.y - bounds.height && clickY <= bounds.y) {
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
    }

    activateInput() {
        if (!this.commandLine) return;

        this.isInputActive = true;
        this.commandLine.activate();

        // Блокируем ввод в других сценах
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = false;
        }

        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.input && uiScene.input.keyboard) {
            uiScene.input.keyboard.enabled = false;
        }

        console.log('[TerminalScene] Командная строка активирована');
    }

    deactivateInput() {
        if (!this.commandLine) return;

        this.isInputActive = false;
        this.commandLine.deactivate();

        // Разблокируем ввод в других сценах
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = true;
        }

        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.input && uiScene.input.keyboard) {
            uiScene.input.keyboard.enabled = true;
        }

        console.log('[TerminalScene] Командная строка деактивирована');
    }

    handleTyping(event) {
        if (!this.isInputActive || !this.commandLine) return;

        // Обработка стрелок для истории команд
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.commandLine.navigateHistory('up');
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.commandLine.navigateHistory('down');
            return;
        }

        if (event.key === 'Enter') {
            const command = this.commandLine.getText();
            console.log(`[TerminalScene] Введена команда: "${command}"`);

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
            if (this.commandLine.currentInput.style.color === '#ff4444') {
                this.commandLine.setColor('#ffffff');
            }
            this.commandLine.setText(this.commandLine.getText() + event.key);
        }

        this.commandLine.updateCursorPosition();
    }

    executeCommand(cmd) {
        cmd = cmd.toLowerCase().trim();

        // Добавляем команду в историю терминала (ВАЖНО: ДО любой очистки!)
        if (this.commandLine && cmd !== '') {
            this.commandLine.addCommandToHistory(cmd);
            this.commandLine.log(`> ${cmd}`, '#00ffcc');
        }

        if (cmd === '') return;

        if (cmd === 'clear') {
            console.log('[TerminalScene] CLEAR - очистка всего');

            // Очищаем память в реестре
            this.registry.set('memory', 0);

            // Прямой вызов очистки точек в EchoScene
            const echoScene = this.scene.get('EchoScene');
            if (echoScene) {
                if (echoScene.memoryPoints) {
                    echoScene.memoryPoints.clear(true, true);
                }
                if (echoScene.memorySystem) {
                    echoScene.memorySystem.clear();
                }
                console.log('[TerminalScene] Точки памяти очищены');
            }

            // Очищаем терминал (только визуальный вывод)
            if (this.commandLine) {
                this.commandLine.clear(); // Теперь это не очищает историю команд!
            }

            this.commandLine.setColor('#00ffcc');
            this.flashSuccess();

            // Глитч эффект
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.simpleGlitch) {
                uiScene.simpleGlitch.destroy();
                uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
            }
        }
        else if (cmd === 'help') {
            this.commandLine.log('\nДоступные команды:', '#00ffcc');
            this.commandLine.log('  clear  - Очистить экран и память', '#cccccc');
            this.commandLine.log('  help   - Показать эту справку', '#cccccc');
            this.commandLine.log('  stats  - Показать статистику системы', '#cccccc');
            this.commandLine.log('  glitch - Запустить эффект глитча', '#cccccc');
            this.commandLine.log('');
        } else if (cmd === 'stats') {
            const mem = this.registry.get('memory') || 0;
            const maxMem = this.registry.get('maxMemory') || 45;
            const att = this.registry.get('attention') || 0;

            this.commandLine.log('\n=== СТАТИСТИКА СИСТЕМЫ ===', '#00ffcc');
            this.commandLine.log(`Память: ${mem}/${maxMem}`, '#cccccc');
            this.commandLine.log(`Внимание: ${att}%`, '#cccccc');
            this.commandLine.log(`Предметов собрано: ${this.registry.get('itemsCollected') || 0}`, '#cccccc');
            this.commandLine.log('==========================\n', '#00ffcc');
        } else if (cmd === 'glitch') {
            this.commandLine.log('Запуск глитч-эффекта...', '#ffcc00');

            const uiScene = this.scene.get('UIScene');
            if (uiScene) {
                if (uiScene.simpleGlitch) {
                    uiScene.simpleGlitch.destroy();
                    uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
                }
                uiScene.simpleGlitch.start(800);
            }
        } else {
            console.log(`[TerminalScene] Ошибка: "${cmd}"`);
            this.commandLine.setColor('#ff4444');

            if (this.commandLine) {
                this.commandLine.error(`Ошибка: неизвестная команда "${cmd}"`);
                this.commandLine.log('Введите "help" для списка доступных команд', '#888888');
            }

            // Глитч эффект через UIScene
            const uiScene = this.scene.get('UIScene');
            if (uiScene) {
                if (uiScene.simpleGlitch) {
                    uiScene.simpleGlitch.destroy();
                    uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
                }
                uiScene.simpleGlitch.start(600);
            }
        }
    }

    flashSuccess() {
        if (!this.commandLine || !this.commandLine.inputContainer) return;

        const inputBg = this.commandLine.inputContainer.getAt(0);
        inputBg.setStrokeStyle(2, 0x00ffcc);
        this.tweens.add({
            targets: inputBg,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                if (this.commandLine && this.commandLine.inputContainer) {
                    inputBg.setStrokeStyle(1, 0x2b2b2b);
                    inputBg.setAlpha(1);
                }
            }
        });
    }

    flashTerminalConfirm(callback) {
        if (!this.commandLine || !this.commandLine.inputContainer) {
            callback();
            return;
        }

        const inputBg = this.commandLine.inputContainer.getAt(0);
        inputBg.setStrokeStyle(2, 0xffffff);
        this.tweens.add({
            targets: inputBg,
            alpha: 0.5,
            duration: 60,
            yoyo: true,
            onComplete: () => {
                if (this.commandLine && this.commandLine.inputContainer) {
                    inputBg.setStrokeStyle(1, 0x2b2b2b);
                    inputBg.setAlpha(1);
                }
                callback();
            }
        });
    }

    updateViewport() {
        if (!this.commandLine) return;

        const totalWidth = this.scale.width;
        const totalHeight = this.scale.height;
        const uiWidth = this.registry.get('uiWidth') || 420;
        const echoWidth = Math.max(totalWidth - uiWidth, 400);

        // Устанавливаем вьюпорт камеры терминала
        this.cameras.main.setViewport(0, 0, echoWidth, totalHeight);

        // Обновляем layout терминала
        this.commandLine.updateLayout();
    }
}

// Экспорт
window.TerminalScene = TerminalScene;