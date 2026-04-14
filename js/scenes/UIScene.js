class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    create() {
        this.updateViewports();
        this.scale.on('resize', this.updateViewports, this);

        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(30, 40, 'SYSTEM INTERFACE', {
            fontSize: '24px',
            color: '#ffcc00',
            fontFamily: 'Courier New'
        }).setShadow(0, 0, '#ffff00', 3);

        this.memoryText = this.add.text(30, 120, 'MEMORY: 0/45', {
            fontSize: '20px',
            color: '#00ffcc',
            fontFamily: 'Courier New'
        });

        this.attentionText = this.add.text(30, 170, 'ATTENTION: 0%', {
            fontSize: '18px',
            color: '#ff6666',
            fontFamily: 'Courier New'
        });

        this.time.addEvent({
            delay: 150,
            callback: this.updateUI,
            callbackScope: this,
            loop: true
        });
    }

    updateViewports() {
        const totalWidth = this.scale.width;
        const uiWidth = this.registry.get('uiWidth');
        const echoWidth = Math.max(totalWidth - uiWidth, 600);

        this.cameras.main.setViewport(echoWidth, 0, uiWidth, this.scale.height);
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