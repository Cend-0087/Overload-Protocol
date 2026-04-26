class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
        this.glitchCounter = 0;
        this.simpleGlitch = null;
    }

    create() {
        this.simpleGlitch = new SimpleGlitchEffect(this);

        this.setupCameras();
        this.createUIElements();

        this.updateViewports();
        this.scale.on('resize', this.updateViewports, this);
        this.startUIUpdates();

        window.killGlitch = () => {
            if (this.simpleGlitch) this.simpleGlitch.destroy();
        };
    }

    setupCameras() {
        this.cameras.main.setBackgroundColor('#1a1a1a');
    }

    createUIElements() {
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
    }

    updateViewports() {
        const totalWidth = this.scale.width;
        const totalHeight = this.scale.height;
        const uiWidth = this.registry.get('uiWidth') || 420;
        const echoWidth = Math.max(totalWidth - uiWidth, 400);
        
        this.cameras.main.setViewport(echoWidth, 0, uiWidth, totalHeight);
        
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.updateViewports) {
            echoScene.updateViewports();
        }
        
        const terminalScene = this.scene.get('TerminalScene');
        if (terminalScene && terminalScene.updateViewport) {
            terminalScene.updateViewport();
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
        });
    }

    testGlitch() {
        this.glitchCounter++;
        if (this.simpleGlitch) {
            this.simpleGlitch.start(600);
        }
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