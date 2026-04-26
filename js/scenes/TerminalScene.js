// js/scenes/TerminalScene.js

class TerminalScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TerminalScene', active: true });
        this.commandLine = null;
        this.isInputActive = false;
        this.consoleCamera = null;
        this.currentDevice = null;
        this.waitingForHackCommand = false;
        this.waitingForDeviceAction = false;
    }

    create() {
        window.addEventListener('keydown', (event) => {
            if (event.key === '/' && !this.isInputActive) {
                event.preventDefault();
                this.activateInput();
            }
        });

        this.commandLine = new CommandLine(this);
        this.commandLine.create();

        this.setupEventHandlers();

        this.scale.on('resize', this.updateViewport, this);
        this.updateViewport();

        this.commandLine.log("╔══════════════════════════════════════════════════════════╗", '#00ffcc');
        this.commandLine.log("║  NEXUS CORE | SECTOR ECHO                               ║", '#00ffcc');
        this.commandLine.log("║  System restore completed.                              ║", '#888888');
        this.commandLine.log("║  Type 'help' for available commands.                    ║", '#888888');
        this.commandLine.log("║  Memory integrity: UNKNOWN. Use 'stats' to check.       ║", '#888888');
        this.commandLine.log("╚══════════════════════════════════════════════════════════╝", '#00ffcc');
        this.commandLine.log("", '#00ffcc');
    }

    setupEventHandlers() {
        this.input.on('pointerdown', (pointer) => {
            if (!this.commandLine) return;

            const terminalBg = this.commandLine.terminalBg;
            if (!terminalBg) return;

            const bounds = terminalBg.getBounds();
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

            const isInTerminal = worldPoint.x >= bounds.x &&
                worldPoint.x <= bounds.x + bounds.width &&
                worldPoint.y >= bounds.y &&
                worldPoint.y <= bounds.y + bounds.height;

            if (isInTerminal) {
                this.activateInput();
            } else {
                this.deactivateInput();
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === '/' || event.code === 'Slash') {
                event.preventDefault();
                if (!this.isInputActive) {
                    this.activateInput();
                }
            } else {
                this.handleTyping(event);
            }
        });
    }

    activateInput() {
        if (!this.commandLine) return;

        this.isInputActive = true;
        this.commandLine.activate();

        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = false;
        }

        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.input && uiScene.input.keyboard) {
            uiScene.input.keyboard.enabled = false;
        }
    }

    deactivateInput() {
        if (!this.commandLine) return;

        this.isInputActive = false;
        this.commandLine.deactivate();

        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.input && echoScene.input.keyboard) {
            echoScene.input.keyboard.enabled = true;
        }

        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.input && uiScene.input.keyboard) {
            uiScene.input.keyboard.enabled = true;
        }
    }

    handleTyping(event) {
        if (!this.isInputActive || !this.commandLine) return;

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

            if (command.trim() !== '') {
                this.commandLine.addCommandToHistory(command);
                this.commandLine.log(`> ${command}`, '#00ffcc');
                this.executeCommand(command);
            }

            this.commandLine.setText('');
            this.commandLine.updateCursorPosition();
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
            this.registry.set('memory', 0);

            const echoScene = this.scene.get('EchoScene');
            if (echoScene) {
                if (echoScene.memoryPoints) {
                    echoScene.memoryPoints.clear(true, true);
                }
                if (echoScene.memorySystem) {
                    echoScene.memorySystem.clear();
                }
            }

            this.commandLine.setColor('#00ffcc');
            this.flashSuccess();

            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.simpleGlitch) {
                uiScene.simpleGlitch.destroy();
                uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
            }
        }
        else if (cmd === 'clearhistory') {
            this.commandLine.clearCommandHistory();
            this.commandLine.success('Command history cleared');
        }
        else if (cmd === 'help') {
            this.commandLine.log('', '#00ffcc');
            this.commandLine.log('╔══════════════════════════════════════════════════════════╗', '#00ffcc');
            this.commandLine.log('║  NEXUS CORE - COMMAND REFERENCE                         ║', '#00ffcc');
            this.commandLine.log('╠══════════════════════════════════════════════════════════╣', '#00ffcc');
            this.commandLine.log('║  MOVEMENT: WASD or Arrow Keys                           ║', '#888888');
            this.commandLine.log('║  INTERACT: Press E near objects                         ║', '#888888');
            this.commandLine.log('║  SCAN: Press SPACE to emit Lidar pulse                  ║', '#888888');
            this.commandLine.log('║  TERMINAL: Press / or click to activate                 ║', '#888888');
            this.commandLine.log('║                                                        ║', '#00ffcc');
            this.commandLine.log('║  clear    - Clear screen and memory                    ║', '#cccccc');
            this.commandLine.log('║  stats    - Show system statistics                     ║', '#cccccc');
            this.commandLine.log('║  data list - List retrieved data fragments             ║', '#cccccc');
            this.commandLine.log('║  data read [num] - Read data fragment                  ║', '#cccccc');
            this.commandLine.log('╚══════════════════════════════════════════════════════════╝', '#00ffcc');
            this.commandLine.log('', '#00ffcc');
        }
        else if (cmd === 'stats') {
            const mem = this.registry.get('memory') || 0;
            const maxMem = this.registry.get('maxMemory') || 45;
            const att = this.registry.get('attention') || 0;

            this.commandLine.log('', '#00ffcc');
            this.commandLine.log('╔══════════════════════════════════════════════════════════╗', '#00ffcc');
            this.commandLine.log('║  SYSTEM STATISTICS                                      ║', '#00ffcc');
            this.commandLine.log('╠══════════════════════════════════════════════════════════╣', '#00ffcc');
            this.commandLine.log(`║  MEMORY:    ${mem.toString().padStart(3)}/${maxMem}                                  ║`, '#cccccc');
            this.commandLine.log(`║  ATTENTION: ${att.toString().padStart(3)}%                                      ║`, '#cccccc');
            this.commandLine.log(`║  ITEMS:     ${(this.registry.get('itemsCollected') || 0).toString().padStart(3)}/∞                                      ║`, '#cccccc');
            this.commandLine.log('╚══════════════════════════════════════════════════════════╝', '#00ffcc');
            this.commandLine.log('', '#00ffcc');
        }
        else if (cmd === 'y' || cmd === 'yes') {
            if (this.pendingTransition) {
                this.confirmTransition();
            } else {
                this.commandLine.log('No pending transitions', '#888888');
            }
        }
        else if (cmd === 'n' || cmd === 'no') {
            if (this.pendingTransition) {
                this.cancelTransition();
            } else {
                this.commandLine.log('No pending transitions', '#888888');
            }
        }
        else if (cmd === 'hack' && this.waitingForHackCommand && this.currentDevice) {
            this.startHacking();
        }
        else if ((cmd === '1' || cmd === '2' || cmd === '3') && this.waitingForDeviceAction && this.currentDevice) {
            this.executeDeviceAction(parseInt(cmd));
        }
        else if (cmd === 'tt') {
            const echoScene = this.scene.get('EchoScene');
            if (echoScene) {
                if (!echoScene.testMode) {
                    echoScene.testMode = new TestMode(echoScene);
                }
                echoScene.testMode.enable();
            }
        }
        else if (cmd === 'tf') {
            const echoScene = this.scene.get('EchoScene');
            if (echoScene && echoScene.testMode) {
                echoScene.testMode.disable();
            }
        }
        else if (cmd === 'data' || cmd.startsWith('data ')) {
            this.handleDataCommand(cmd);
        }
        else {
            this.commandLine.setColor('#ff4444');
            this.commandLine.error(`Error: unknown command "${cmd}"`);
            this.commandLine.log('Type "help" for available commands', '#888888');

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

    handleDataCommand(cmd) {
        const parts = cmd.split(' ');

        if (parts[1] === 'list') {
            const loreList = this.registry.get('loreList') || [];

            if (loreList.length === 0) {
                this.commandLine.log("No data retrieved", '#888888');
                return;
            }

            this.commandLine.log("\n╔══════════════════════════════════════════════════════════╗", '#00ffcc');
            this.commandLine.log("║  RETRIEVED DATA                                         ║", '#00ffcc');
            this.commandLine.log("╠══════════════════════════════════════════════════════════╣", '#00ffcc');

            loreList.forEach((lore, index) => {
                this.commandLine.log(`║  ${(index + 1).toString().padStart(2)}. ${lore.title.padEnd(47)}║`, '#cccccc');
            });

            this.commandLine.log("╚══════════════════════════════════════════════════════════╝", '#00ffcc');
            this.commandLine.log("Type 'data read [number]' to read", '#888888');
        }
        else if (parts[1] === 'read') {
            const index = parseInt(parts[2]) - 1;
            const loreList = this.registry.get('loreList') || [];

            if (isNaN(index) || index < 0 || index >= loreList.length) {
                this.commandLine.error("Invalid data number");
                return;
            }

            const lore = loreList[index];
            this.commandLine.log(`\n╔══════════════════════════════════════════════════════════╗`, '#00ffcc');
            this.commandLine.log(`║  📜 ${lore.title.padEnd(47)}║`, '#ffcc00');
            this.commandLine.log(`╠══════════════════════════════════════════════════════════╣`, '#00ffcc');

            const lines = lore.text.match(/.{1,50}/g) || [lore.text];
            lines.forEach(line => {
                this.commandLine.log(`║  ${line.padEnd(48)}║`, '#cccccc');
            });

            this.commandLine.log(`╚══════════════════════════════════════════════════════════╝`, '#00ffcc');
        }
        else {
            this.commandLine.log("Usage: data list - show list, data read [number] - read data", '#888888');
        }
    }

    requestDeviceInteraction(device) {
        this.currentDevice = device;
        this.waitingForHackCommand = !device.isHacked;
        this.waitingForDeviceAction = device.isHacked;

        if (!device.isHacked) {
            this.commandLine.log("\n🔐 Connection established", '#9b59b6');
            this.commandLine.log("Type 'hack' to attempt breach", '#ffff00');
        } else {
            this.commandLine.log("\n💻 Device compromised. Choose action:", '#00ffcc');
            this.commandLine.log("1) Download data", '#cccccc');
            this.commandLine.log("2) Open locked door", '#cccccc');
            this.commandLine.log("3) Update system", '#cccccc');
        }

        this.activateInput();
    }

executeDeviceAction(actionNumber) {
    this.waitingForDeviceAction = false;
    const result = this.currentDevice.executeAction(actionNumber);

    if (result.success) {
        this.commandLine.success(result.message);

        switch (result.type) {
            case 'download_data':
                if (result.lorePackage && result.lorePackage.entries) {
                    const loreList = this.registry.get('loreList') || [];
                    let newCount = 0;

                    result.lorePackage.entries.forEach(lore => {
                        const exists = loreList.some(existing => existing.id === lore.id);
                        if (!exists) {
                            loreList.push({
                                id: lore.id,
                                title: lore.title,
                                text: lore.text,
                                timestamp: Date.now()
                            });
                            newCount++;
                        }
                    });

                    this.registry.set('loreList', loreList);

                    if (newCount > 0) {
                        this.commandLine.log(`\n📀 RETRIEVED: ${newCount} new data fragment(s)`, '#88ff88');
                        this.commandLine.log(`Type 'data list' to view all retrieved fragments`, '#888888');
                    } else {
                        this.commandLine.log("No new data fragments found.", '#888888');
                    }
                } else {
                    this.commandLine.log("No readable data fragments found on this device.", '#888888');
                }
                break;

            case 'open_door':
                const echoScene = this.scene.get('EchoScene');
                if (echoScene && echoScene.openDoor && result.doorId) {
                    echoScene.openDoor(result.doorId);
                } else if (!result.doorId) {
                    this.commandLine.log("This device is not connected to any door.", '#888888');
                }
                break;

            case 'upgrade_player':
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
            this.commandLine.log("Administrative access granted!", '#00ffcc');
            this.waitingForDeviceAction = true;
        } else {
            this.commandLine.error(result.message);
            this.commandLine.log("Try again: type 'hack'", '#ffff00');
            this.waitingForHackCommand = true;
        }
    }

    startHacking() {
        this.waitingForHackCommand = false;
        this.commandLine.log("Initiating breach sequence...", '#9b59b6');

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
    this.commandLine.log('\n⚠️ Do you want to proceed to the next zone?', '#ffcc00');
    this.commandLine.log('Type: y or n', '#ffcc00');
    this.activateInput();
}

confirmTransition() {
    this.pendingTransition = false;
    
    // Check if this is the level 2 transition zone (targetLevel === 1 means going back from level 2)
    if (this.pendingZone && this.pendingZone.targetLevel === 1) {
        this.commandLine.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#ffaa00');
        this.commandLine.log('⚠️ END OF CURRENT CONTENT ⚠️', '#ffaa00');
        this.commandLine.log('You have reached the end of the currently available content.', '#ffaa00');
        this.commandLine.log('This game is in active development. More content will be added in future updates.', '#ffaa00');
        this.commandLine.log('Thank you for playing!', '#ffaa00');
        this.commandLine.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#ffaa00');
        this.commandLine.log('', '#00ffcc');
    }
    
    this.commandLine.log('Transition confirmed..', '#00ffcc');

    const uiScene = this.scene.get('UIScene');
    if (uiScene && uiScene.simpleGlitch) {
        uiScene.simpleGlitch.destroy();
        uiScene.simpleGlitch = new SimpleGlitchEffect(uiScene);
        uiScene.simpleGlitch.start(1500);
    }

    this.time.delayedCall(1600, () => {
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.levelManager) {
            const targetLevel = this.pendingZone.targetLevel;
            const zonePosition = { x: this.pendingZone.x, y: this.pendingZone.y };
            echoScene.levelManager.loadLevel(targetLevel, zonePosition);
            this.commandLine.success(`Transition to level ${targetLevel} completed!`);
        }
        this.pendingZone = null;
    });
}

    cancelTransition() {
        this.pendingTransition = false;
        this.pendingZone = null;
        this.commandLine.log('Transition cancelled', '#888888');
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

        this.cameras.main.setViewport(0, 0, echoWidth, totalHeight);
        this.commandLine.updateLayout();
    }
}

window.TerminalScene = TerminalScene;