class CommandLine {
    constructor(scene, consoleCamera) {
        this.scene = scene;
        this.consoleCamera = consoleCamera;
        this.isInputActive = false;
        this.container = null;
        this.cmdBg = null;  // Сделано публичным
        this.inputText = null;
        this.cursorRect = null;
        this.placeholder = null;
        this.prefix = null;
        this.cursorTween = null;
    }
    
    create() {
        this.container = this.scene.add.container(0, 0);
        
        this.cmdBg = this.scene.add.rectangle(0, 0, 100, 40, 0x000000, 0.9)
            .setOrigin(0, 1)
            .setStrokeStyle(1, 0x333333)
            .setInteractive();
        
        this.prefix = this.scene.add.text(10, -30, '> ', { 
            fontSize: '18px', color: '#00ffcc', fontFamily: 'Courier New' 
        });
        
        this.inputText = this.scene.add.text(35, -30, '', { 
            fontSize: '18px', color: '#ffffff', fontFamily: 'Courier New' 
        });
        
        this.cursorRect = this.scene.add.rectangle(35, -20, 10, 2, 0x00ffcc)
            .setOrigin(0, 0)
            .setAlpha(0);
        
        this.placeholder = this.scene.add.text(35, -30, 'CLICK TO TYPE OR PRESS [/]', { 
            fontSize: '14px', color: '#444444', fontFamily: 'Courier New' 
        });
        
        this.container.add([this.cmdBg, this.prefix, this.inputText, this.cursorRect, this.placeholder]);
        
        this.cursorTween = this.scene.tweens.add({ 
            targets: this.cursorRect, 
            alpha: 1, 
            duration: 500, 
            yoyo: true, 
            loop: -1, 
            paused: true 
        });
        
        return this.container;
    }
    
    activate() {
        this.isInputActive = true;
        this.placeholder.setVisible(false);
        this.cursorTween.resume();
        this.cursorRect.setAlpha(1);
        this.cmdBg.setStrokeStyle(1, 0x00ffcc);
    }
    
    deactivate() {
        this.isInputActive = false;
        this.placeholder.setVisible(this.inputText.text.length === 0);
        this.cursorTween.pause();
        this.cursorRect.setAlpha(0);
        this.cmdBg.setStrokeStyle(1, 0x333333);
    }
    
    getText() {
        return this.inputText.text;
    }
    
    setText(text) {
        this.inputText.setText(text);
    }
    
    clear() {
        this.inputText.setText('');
        this.cursorRect.setX(35);
    }
    
    setColor(color) {
        this.inputText.setColor(color);
    }
    
    updateCursorPosition() {
        this.cursorRect.setX(this.inputText.x + this.inputText.width + 2);
    }
    
    setSize(width, height) {
        this.cmdBg.setSize(width, 40);
    }
    
    setPosition(x, y) {
        this.container.setPosition(x, y);
    }
}