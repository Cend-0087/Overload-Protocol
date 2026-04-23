// js/scenes/TerminalScene.js

class TerminalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TerminalScene', active: true });
        this.commandLine = null;
        this.isInputActive = false;
        this.consoleCamera = null;
        this.currentDevice = null; // Текущее устройство для взаимодействия
        this.waitingForHackCommand = false;
        this.waitingForDeviceAction = false;
    }

    create() {
        console.log('[TerminalScene] create()');

        // Получаем ссылку на камеру из UIScene
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.consoleCamera) {
            this.consoleCamera = uiScene.consoleCamera;
        }

        // Создаем терминал
        this.commandLine = new CommandLine(this);
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
            event.preventDefault();
            const command = this.commandLine.getText();
            console.log(`[TerminalScene] Введена команда: "${command}"`);

            if (command.trim() !== '') {
                // Добавляем команду в историю
                this.commandLine.addCommandToHistory(command);
                // Отображаем введенную команду
                this.commandLine.log(`> ${command}`, '#00ffcc');
                // Выполняем команду
                this.executeCommand(command);
            }

            // Очищаем строку ввода
            this.commandLine.setText('');
            this.commandLine.updateCursorPosition();

            // Деактивируем ввод
            this.deactivateInput();

            return;
        }

        if (event.key === 'Backspace') {
            const currentText = this.commandLine.getText();
            this.commandLine.setText(currentText.slice(0, -1));
        } else if (event.key === 'Escape') {
            this.deactivateInput();
        } else if (event.key.length === 1 && event.code !== 'Slash' && event.key !== 'Enter') {
            if (this.commandLine.currentInput.style.color === '#ff4444') {
                this.commandLine.setColor('#ffffff');
            }
            this.commandLine.setText(this.commandLine.getText() + event.key);
        }

        this.commandLine.updateCursorPosition();
    }

    executeCommand(cmd) {
        cmd = cmd.toLowerCase().trim();

        if (cmd === '') return;

        if (cmd === 'clear') {
            console.log('[TerminalScene] CLEAR - очистка экрана (история команд сохраняется)');

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

            this.commandLine.setColor('#00ffcc');
            this.flashSuccess();

            // Глитч эффект
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.simpleGlitch) {
                uiScene.simpleGlitch.destroy();
                uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
            }
        }
        else if (cmd === 'clearhistory') {
            // Новая команда для полной очистки истории команд
            this.commandLine.clearCommandHistory();
            this.commandLine.success('История команд очищена');
        }
        else if (cmd === 'help') {
            this.commandLine.log('', '#00ffcc');
            this.commandLine.log('╔══════════════════════════════════════════════════════════╗', '#00ffcc');
            this.commandLine.log('║  ДОСТУПНЫЕ КОМАНДЫ                                      ║', '#00ffcc');
            this.commandLine.log('╠══════════════════════════════════════════════════════════╣', '#00ffcc');
            this.commandLine.log('║  clear        - Очистить экран и память                  ║', '#cccccc');
            this.commandLine.log('║  clearhistory - Очистить историю команд                  ║', '#cccccc');
            this.commandLine.log('║  help         - Показать эту справку                     ║', '#cccccc');
            this.commandLine.log('║  stats        - Показать статистику системы              ║', '#cccccc');
            this.commandLine.log('║  glitch       - Запустить эффект глитча                  ║', '#cccccc');
            this.commandLine.log('╚══════════════════════════════════════════════════════════╝', '#00ffcc');
            this.commandLine.log('', '#00ffcc');
        } else if (cmd === 'stats') {
            const mem = this.registry.get('memory') || 0;
            const maxMem = this.registry.get('maxMemory') || 45;
            const att = this.registry.get('attention') || 0;

            this.commandLine.log('', '#00ffcc');
            this.commandLine.log('╔══════════════════════════════════════════════════════════╗', '#00ffcc');
            this.commandLine.log('║  СТАТИСТИКА СИСТЕМЫ                                      ║', '#00ffcc');
            this.commandLine.log('╠══════════════════════════════════════════════════════════╣', '#00ffcc');
            this.commandLine.log(`║  ПАМЯТЬ:    ${mem.toString().padStart(3)}/${maxMem}                                  ║`, '#cccccc');
            this.commandLine.log(`║  ВНИМАНИЕ:  ${att.toString().padStart(3)}%                                      ║`, '#cccccc');
            this.commandLine.log(`║  ПРЕДМЕТЫ:  ${(this.registry.get('itemsCollected') || 0).toString().padStart(3)}/∞                                      ║`, '#cccccc');
            this.commandLine.log('╚══════════════════════════════════════════════════════════╝', '#00ffcc');
            this.commandLine.log('', '#00ffcc');
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
            this.commandLine.success('Глитч-эффект завершен!');
        }
        // После обработки других команд, добавить:
        else if (cmd === 'y' || cmd === 'yes') {
            if (this.pendingTransition) {
                this.confirmTransition();
            } else {
                this.commandLine.log('Нет ожидающих переходов', '#888888');
            }
        }
        else if (cmd === 'n' || cmd === 'no') {
            if (this.pendingTransition) {
                this.cancelTransition();
            } else {
                this.commandLine.log('Нет ожидающих переходов', '#888888');
            }
        }
        else if (cmd === 'hack' && this.waitingForHackCommand && this.currentDevice) {
            this.startHacking();
        }
        else if ((cmd === '1' || cmd === '2' || cmd === '3') && this.waitingForDeviceAction && this.currentDevice) {
            this.executeDeviceAction(parseInt(cmd));
        }

else if (cmd === 'testmodetrue') {
    const echoScene = this.scene.get('EchoScene');
    if (echoScene) {
        if (!echoScene.testMode) {
            echoScene.testMode = new TestMode(echoScene);
        }
        echoScene.testMode.enable();
    }
}
else if (cmd === 'testmodefalse') {
    const echoScene = this.scene.get('EchoScene');
    if (echoScene && echoScene.testMode) {
        echoScene.testMode.disable();
    }
}


        else {
            console.log(`[TerminalScene] Ошибка: "${cmd}"`);
            this.commandLine.setColor('#ff4444');
            this.commandLine.error(`Ошибка: неизвестная команда "${cmd}"`);
            this.commandLine.log('Введите "help" для списка доступных команд', '#888888');

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

requestDeviceInteraction(device) {
    this.currentDevice = device;
    this.waitingForHackCommand = !device.isHacked;
    this.waitingForDeviceAction = device.isHacked;
    
    if (!device.isHacked) {
        this.commandLine.log("\n🔐 Подключение к устройству установлено", '#9b59b6');
        this.commandLine.log("Введите 'hack' для взлома", '#ffff00');
    } else {
        this.commandLine.log("\n💻 Устройство взломано. Выберите действие:", '#00ffcc');
        this.commandLine.log("1) Загрузить данные на свой диск", '#cccccc');
        this.commandLine.log("2) Открыть запертую дверь", '#cccccc');
        this.commandLine.log("3) Обновить свое ПО", '#cccccc');
    }
    
    this.activateInput();
}

executeDeviceAction(actionNumber) {
    this.waitingForDeviceAction = false;
    const result = this.currentDevice.executeAction(actionNumber);
    
    if (result.success) {
        this.commandLine.success(result.message);
        
        // Обрабатываем разные типы действий
        switch(result.type) {
            case 'download_data':
                this.commandLine.log(`📀 ${result.lore}`, '#88ff88');
                // Добавляем в память игрока
                const currentMemory = this.registry.get('memory') || 0;
                this.registry.set('memory', currentMemory + 15);
                break;
                
            case 'open_door':
                // Открываем дверь в EchoScene
                const echoScene = this.scene.get('EchoScene');
                if (echoScene && echoScene.openDoor) {
                    echoScene.openDoor(result.doorId);
                }
                break;
                
            case 'upgrade_player':
                // Улучшаем игрока
                const echoScene2 = this.scene.get('EchoScene');
                if (echoScene2 && echoScene2.upgradePlayer) {
                    echoScene2.upgradePlayer(result.upgrade);
                }
                break;
        }
    } else {
        this.commandLine.error(result.message);
    }
    
    this.currentDevice = null;
}

handleHackResult(isSuccess) {
    if (!this.currentDevice) return;
    
    const result = this.currentDevice.hack(isSuccess);
    
    if (result.success) {
        this.commandLine.success(result.message);
        this.commandLine.log("Теперь у вас есть доступ к функциям устройства!", '#00ffcc');
        this.waitingForDeviceAction = true;
    } else {
        this.commandLine.error(result.message);
        
        // Увеличиваем внимание при провале
        if (result.attentionIncrease) {
            const currentAttention = this.registry.get('attention') || 0;
            const newAttention = Math.min(currentAttention + result.attentionIncrease, 100);
            this.registry.set('attention', newAttention);
            this.commandLine.log(`⚠️ Внимание повышено до ${newAttention}%`, '#ff6600');
        }
        
        // Даем еще одну попытку
        this.commandLine.log("Попробуйте снова: введите 'hack'", '#ffff00');
        this.waitingForHackCommand = true;
    }
}

    startHacking() {
        this.waitingForHackCommand = false;
        this.commandLine.log("Запуск взлома...", '#9b59b6');

        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.miniGameManager) {
            echoScene.miniGameManager.startHackingGame(this.currentDevice, (isSuccess) => {
                this.handleHackResult(isSuccess);
            });
        }
    }

    requestTransition(zone) {
        this.pendingTransition = true;
        this.pendingZone = zone;
        this.commandLine.log('\n⚠️  Желаете перейти в следующую зону?', '#ffcc00');
        this.commandLine.log('Введите: y или n', '#ffcc00');
        this.activateInput();
    }

    confirmTransition() {
        this.pendingTransition = false;
        this.commandLine.log('Переход подтвержден. Запуск глитч-эффекта...', '#00ffcc');

        // Запускаем глитч
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.simpleGlitch) {
            uiScene.simpleGlitch.destroy();
            uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
            uiScene.simpleGlitch.start(1500);
        }

        // Ждем завершения глитча и переключаем уровень
        this.time.delayedCall(1600, () => {
            const echoScene = this.scene.get('EchoScene');
            if (echoScene && echoScene.levelManager) {
                const targetLevel = this.pendingZone.targetLevel;
                echoScene.levelManager.loadLevel(targetLevel);
                this.commandLine.success(`Переход на уровень ${targetLevel} завершен!`);
            }
            this.pendingZone = null;
        });
    }

    cancelTransition() {
        this.pendingTransition = false;
        this.pendingZone = null;
        this.commandLine.log('Переход отменен', '#888888');
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
            if (callback) callback();
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
                if (callback) callback();
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