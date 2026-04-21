class CommandLine {
    constructor(scene) {
        this.scene = scene;
        this.isInputActive = false;
        this.container = null;
        
        // Элементы терминала
        this.terminalBg = null;
        this.terminalHeader = null;
        this.terminalContent = null;
        this.historyLines = [];
        this.currentInput = null;
        this.cursorRect = null;
        
        // Размеры
        this.minHeight = 0.12;
        this.maxHeight = 0.25;
        this.currentHeight = 0.18;
        
        // История команд (для стрелок)
        this.commandHistory = [];
        this.historyIndex = -1;
        
        // Прокрутка
        this.userScrolledUp = false;
        this.scrollOffset = 0;
        this.maxScrollOffset = 0;
        
        // Resize
        this.resizeHandle = null;
        this.isDragging = false;
    }

    
    create() {
        const totalWidth = this.scene.scale.width;
        const totalHeight = this.scene.scale.height;
        const echoWidth = this.getEchoWidth();
        const terminalHeight = totalHeight * this.currentHeight;
        
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(10001);
        
        // Фон терминала (позиционируем от нижнего края)
        this.terminalBg = this.scene.add.rectangle(0, totalHeight - terminalHeight, echoWidth, terminalHeight, 0x0c0c0c, 0.95)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x2b2b2b);
        
        // Заголовок терминала
        this.createHeader();
        
        // Область вывода истории
        this.createContentArea();
        
        // Область ввода
        this.createInputArea();
        
        // Handle для ресайза
        this.createResizeHandle();
        
        this.container.add([this.terminalBg, this.terminalHeader, this.terminalContent, 
                           this.inputContainer, this.resizeHandle]);
        
        // Добавляем приветственное сообщение
        this.addWelcomeMessage();
        
        // Обновляем позиции
        this.updateLayout();
        
        // Настраиваем прокрутку колесиком мыши
        this.setupScrollHandler();
        
        return this.container;
    }
    
setupScrollHandler() {
    this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        // Получаем границы терминала
        const terminalY = this.terminalBg.y;
        const terminalHeight = this.terminalBg.height;
        
        // Проверяем, находится ли мышь над областью терминала
        if (pointer.y >= terminalY && pointer.y <= terminalY + terminalHeight) {
            const scrollDelta = deltaY > 0 ? 30 : -30;
            this.scrollContent(scrollDelta);
        }
    });
}
    
scrollContent(delta) {
    const totalHeight = this.scene.scale.height;
    const terminalHeight = totalHeight * this.currentHeight;
    const inputHeight = 36;
    const visibleHeight = terminalHeight - 32 - inputHeight - 10; // Вычитаем 10 пикселей
    const totalContentHeight = this.historyLines.length * 22;
    
    if (totalContentHeight <= visibleHeight) {
        return;
    }
    
    this.maxScrollOffset = totalContentHeight - visibleHeight + 10;
    
    let newOffset = this.scrollOffset + delta;
    newOffset = Phaser.Math.Clamp(newOffset, 0, this.maxScrollOffset);
    
    if (newOffset < this.maxScrollOffset) {
        this.userScrolledUp = true;
    }
    
    if (newOffset >= this.maxScrollOffset) {
        this.userScrolledUp = false;
    }
    
    this.scrollOffset = newOffset;
    
    const contentY = this.getContentY();
    this.terminalContent.setY(contentY - this.scrollOffset);
}
    
scrollToBottom() {
    const totalHeight = this.scene.scale.height;
    const terminalHeight = totalHeight * this.currentHeight;
    const inputHeight = 36;
    const visibleHeight = terminalHeight - 32 - inputHeight - 10; // Вычитаем 10 пикселей отступа
    const totalContentHeight = this.historyLines.length * 22;
    
    if (totalContentHeight > visibleHeight) {
        // Добавляем отступ при прокрутке вниз
        this.scrollOffset = totalContentHeight - visibleHeight + 10;
        this.maxScrollOffset = this.scrollOffset;
    } else {
        this.scrollOffset = 0;
    }
    
    const contentY = this.getContentY();
    this.terminalContent.setY(contentY - this.scrollOffset);
}
    
    createHeader() {
        const echoWidth = this.getEchoWidth();
        const totalHeight = this.scene.scale.height;
        const terminalHeight = totalHeight * this.currentHeight;
        const headerY = totalHeight - terminalHeight;
        
        this.terminalHeader = this.scene.add.container(0, headerY);
        
        // Полоса заголовка
        const headerBg = this.scene.add.rectangle(0, 0, echoWidth, 32, 0x1e1e1e, 1)
            .setOrigin(0, 0);
        
        // Иконка терминала
        const icon = this.scene.add.text(10, 8, '>_', {
            fontSize: '16px',
            color: '#00ffcc',
            fontFamily: 'Segoe UI, Courier New',
            fontWeight: 'bold'
        });
        
        // Название
        const title = this.scene.add.text(35, 8, 'КОМАНДНАЯ СТРОКА', {
            fontSize: '13px',
            color: '#e0e0e0',
            fontFamily: 'Segoe UI',
            fontWeight: '500'
        });
        
        // Кнопка закрытия (скрыта, но код оставлен на будущее)
        const closeBtn = this.scene.add.text(echoWidth - 45, 5, '✕', {
            fontSize: '18px',
            color: '#cccccc',
            fontFamily: 'Segoe UI'
        })
            .setInteractive({ useHandCursor: true })
            .setVisible(false); // Скрываем кнопку
        
        closeBtn.on('pointerover', () => closeBtn.setColor('#ff5555'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#cccccc'));
        closeBtn.on('pointerdown', () => this.clearHistory());
        
        this.terminalHeader.add([headerBg, icon, title, closeBtn]);
    }
    
    createContentArea() {
        const totalHeight = this.scene.scale.height;
        const terminalHeight = totalHeight * this.currentHeight;
        const headerHeight = 32;
        const contentY = totalHeight - terminalHeight + headerHeight;
        
        // Контейнер для истории команд
        this.terminalContent = this.scene.add.container(0, contentY);
        
        // Маска для обрезки текста
        const contentHeight = terminalHeight - headerHeight - 36;
        const maskGraphics = this.scene.add.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(0, contentY, this.getEchoWidth(), contentHeight);
        const mask = maskGraphics.createGeometryMask();
        this.terminalContent.setMask(mask);
        this.contentMask = mask;
        this.maskGraphics = maskGraphics;
    }
    
    createInputArea() {
        const totalHeight = this.scene.scale.height;
        const terminalHeight = totalHeight * this.currentHeight;
        const inputHeight = 36;
        const inputY = totalHeight - inputHeight;
        
        this.inputContainer = this.scene.add.container(0, inputY);
        
        // Фон строки ввода
        const inputBg = this.scene.add.rectangle(0, 0, this.getEchoWidth(), inputHeight, 0x1a1a1a, 1)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x2b2b2b);
        
        // Промпт
        this.prompt = this.scene.add.text(10, 8, 'PS>', {
            fontSize: '14px',
            color: '#00ffcc',
            fontFamily: 'Consolas, Courier New',
            fontWeight: 'bold'
        });
        
        // Поле ввода
        this.currentInput = this.scene.add.text(55, 8, '', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Consolas, Courier New'
        });
        
        // Курсор
        this.cursorRect = this.scene.add.rectangle(55, 10, 8, 16, 0x00ffcc, 1)
            .setOrigin(0, 0);
        
        // Placeholder
        this.placeholder = this.scene.add.text(55, 8, 'Введите команду...', {
            fontSize: '14px',
            color: '#555555',
            fontFamily: 'Consolas, Courier New'
        });
        
        this.inputContainer.add([inputBg, this.prompt, this.currentInput, this.cursorRect, this.placeholder]);
        
        // Анимация курсора
        this.scene.tweens.add({
            targets: this.cursorRect,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
            paused: true
        });
    }
    
    createResizeHandle() {
        const totalHeight = this.scene.scale.height;
        const terminalHeight = totalHeight * this.currentHeight;
        const echoWidth = this.getEchoWidth();
        const handleHeight = 4; // Тонкая горизонтальная линия
        const handleWidth = echoWidth; // На всю ширину терминала
        
        this.resizeHandle = this.scene.add.rectangle(echoWidth / 2, totalHeight - terminalHeight, handleWidth, handleHeight, 0x555555, 0.8)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(10002);
        
        // Обработчики ресайза
        this.resizeHandle.on('pointerover', () => this.resizeHandle.setFillStyle(0x00ffcc));
        this.resizeHandle.on('pointerout', () => this.resizeHandle.setFillStyle(0x555555));
        
        this.resizeHandle.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.resizeHandle.setFillStyle(0xffcc00);
            this.scene.input.setDefaultCursor('ns-resize');
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;
            
            const totalHeight = this.scene.scale.height;
            const mouseY = pointer.y;
            const newHeightPercent = (totalHeight - mouseY) / totalHeight;
            
            // Ограничиваем высоту от 12% до 25%
            const clampedHeight = Phaser.Math.Clamp(newHeightPercent, this.minHeight, this.maxHeight);
            this.currentHeight = clampedHeight;
            
            this.updateLayout();
        });
        
        this.scene.input.on('pointerup', () => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            this.resizeHandle.setFillStyle(0x555555);
            this.scene.input.setDefaultCursor('default');
        });
    }
    
    addWelcomeMessage() {
        const welcomeMsg = [
            '╔══════════════════════════════════════════════════════════╗',
            '║  СИСТЕМНЫЙ ТЕРМИНАЛ v2.0                                 ║',
            '║  Введите "help" для списка команд                        ║',
            '║  Введите "clear" для очистки экрана                      ║',
            '╚══════════════════════════════════════════════════════════╝',
            ''
        ];
        
        welcomeMsg.forEach(msg => {
            this.addHistoryLine(msg, '#888888');
        });
    }
    
addHistoryLine(text, color = '#cccccc', isError = false) {
    const maxWidth = this.getEchoWidth() - 20;
    // Увеличиваем отступ между строками и добавляем отступ снизу
    const yPos = 10 + this.historyLines.length * 22;
    
    const lineText = this.scene.add.text(10, yPos, text, {
        fontSize: '13px',
        color: isError ? '#ff5555' : color,
        fontFamily: 'Consolas, Courier New',
        wordWrap: { width: maxWidth, useAdvancedWrap: true }
    });
    
    this.terminalContent.add(lineText);
    this.historyLines.push(lineText);
    
    if (!this.userScrolledUp) {
        this.scrollToBottom();
    }
    
    return lineText;
}
    
    getContentY() {
        const totalHeight = this.scene.scale.height;
        const terminalHeight = totalHeight * this.currentHeight;
        return totalHeight - terminalHeight + 32;
    }
    
    updateLayout() {
        const totalWidth = this.scene.scale.width;
        const totalHeight = this.scene.scale.height;
        const echoWidth = this.getEchoWidth();
        const terminalHeight = totalHeight * this.currentHeight;
        const headerHeight = 32;
        const inputHeight = 36;
        const contentHeight = terminalHeight - headerHeight - inputHeight;
        const terminalY = totalHeight - terminalHeight;
        
        // Обновляем фон
        this.terminalBg.setSize(echoWidth, terminalHeight);
        this.terminalBg.setPosition(0, terminalY);
        
        // Обновляем заголовок
        this.terminalHeader.setPosition(0, terminalY);
        const headerBg = this.terminalHeader.getAt(0);
        if (headerBg) headerBg.setSize(echoWidth, headerHeight);
        
        const closeBtn = this.terminalHeader.getAt(3);
        if (closeBtn) closeBtn.setPosition(echoWidth - 45, 5);
        
        // Обновляем маску
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(0, terminalY + headerHeight, echoWidth, contentHeight);
        
        // Обновляем контент
        this.terminalContent.setPosition(0, terminalY + headerHeight);
        
        // Обновляем строку ввода
        this.inputContainer.setPosition(0, totalHeight - inputHeight);
        const inputBg = this.inputContainer.getAt(0);
        if (inputBg) {
            inputBg.setSize(echoWidth, inputHeight);
        }
        
        // Обновляем ресайз хэндл (горизонтальная линия на всю ширину)
        this.resizeHandle.setPosition(echoWidth / 2, terminalY);
        this.resizeHandle.setSize(echoWidth, 4);
        
        // Обновляем позиции строк истории
        this.updateHistoryPositions();
        
        // Обновляем скролл
        this.scrollToBottom();
    }
    
updateHistoryPositions() {
    this.historyLines.forEach((line, index) => {
        line.setY(10 + index * 22);
    });
    this.scrollToBottom();
}
    
    getEchoWidth() {
        const totalWidth = this.scene.scale.width;
        const uiWidth = this.scene.registry.get('uiWidth') || 420;
        return Math.max(totalWidth - uiWidth, 400);
    }
    
    // Публичные методы
    activate() {
        this.isInputActive = true;
        this.placeholder.setVisible(false);
        this.cursorRect.setAlpha(1);
        
        // Включаем анимацию курсора
        const tween = this.scene.tweens.getTweensOf(this.cursorRect)[0];
        if (tween) tween.resume();
        
        // Меняем цвет рамки
        const inputBg = this.inputContainer.getAt(0);
        inputBg.setStrokeStyle(1, 0x00ffcc);
    }
    
    deactivate() {
        this.isInputActive = false;
        this.placeholder.setVisible(this.currentInput.text.length === 0);
        this.cursorRect.setAlpha(0);
        
        // Останавливаем анимацию курсора
        const tween = this.scene.tweens.getTweensOf(this.cursorRect)[0];
        if (tween) tween.pause();
        
        // Возвращаем цвет рамки
        const inputBg = this.inputContainer.getAt(0);
        inputBg.setStrokeStyle(1, 0x2b2b2b);
    }
    
    getText() {
        return this.currentInput.text;
    }
    
    setText(text) {
        this.currentInput.setText(text);
        this.updateCursorPosition();
        // Обновляем видимость placeholder
        this.placeholder.setVisible(!this.isInputActive && text.length === 0);
    }
    
    // Очистка только вывода терминала (сохраняет историю команд)
clearTerminal() {
    // Уничтожаем все строки вывода
    this.historyLines.forEach(line => line.destroy());
    this.historyLines = [];
    
    // СБРАСЫВАЕМ СКРОЛЛ
    this.scrollOffset = 0;
    this.maxScrollOffset = 0;
    
    // Добавляем сообщение об очистке
    this.addHistoryLine('> Экран очищен', '#888888');
}
    
    // Полная очистка (очищает и вывод, и историю команд)
    clear() {
        this.clearTerminal();
        
        // Сбрасываем историю команд НО сохраняем команды для навигации
        // Для полной очистки истории команд нужен отдельный метод
    }
    
    // Очистка истории команд (сохраняет вывод)
    clearCommandHistory() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.log('> История команд очищена', '#888888');
    }
    
    clearHistory() {
        this.historyLines.forEach(line => line.destroy());
        this.historyLines = [];
        this.addHistoryLine('> История очищена', '#888888');
    }
    
    setColor(color) {
        this.currentInput.setColor(color);
    }
    
    updateCursorPosition() {
        const cursorX = 55 + this.currentInput.width;
        this.cursorRect.setX(cursorX);
    }
    
    setSize(width, height) {
        this.updateLayout();
    }
    
    setPosition(x, y) {
        this.container.setPosition(x, y);
    }
    
    addCommandToHistory(command) {
        if (command.trim() === '') return;
        
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.setText(this.commandHistory[this.historyIndex]);
            }
        } else if (direction === 'down') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.setText(this.commandHistory[this.historyIndex]);
            } else {
                this.historyIndex = this.commandHistory.length;
                this.setText('');
            }
        }
        
        this.updateCursorPosition();
    }
    
    log(message, color = '#cccccc') {
        if (typeof message === 'object') {
            message = JSON.stringify(message, null, 2);
        }
        
        const lines = message.split('\n');
        lines.forEach(line => {
            this.addHistoryLine(line, color);
        });
        
        this.scrollToBottom();
    }
    
    error(message) {
        this.log(message, '#ff5555');
    }
    
    success(message) {
        this.log(message, '#00ffcc');
    }
    
    setTempMessage(message, color = '#00ffcc', duration = 2000) {
        const originalInput = this.currentInput.text;
        const originalColor = this.currentInput.style.color;
        
        this.currentInput.setText(message);
        this.currentInput.setColor(color);
        
        this.scene.time.delayedCall(duration, () => {
            if (this.currentInput.text === message) {
                this.currentInput.setText(originalInput);
                this.currentInput.setColor(originalColor);
                this.updateCursorPosition();
            }
        });
        
        this.updateCursorPosition();
    }
}