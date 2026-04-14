class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    create() {
        // Правая панель
        this.add.rectangle(900, 0, 380, 720, 0x1a1a1a).setOrigin(0);
        
        this.add.text(950, 40, 'SYSTEM INTERFACE', {
            fontSize: '22px',
            color: '#ffcc00'
        });

        this.memoryText = this.add.text(950, 100, 'MEMORY: 0/45', {
            fontSize: '18px',
            color: '#00ffcc'
        });

        // Обновляем текст каждые 200 мс
        this.time.addEvent({
            delay: 200,
            callback: this.updateUI,
            callbackScope: this,
            loop: true
        });
    }

    updateUI() {
        const mem = this.registry.get('memory');
        const max = this.registry.get('maxMemory');
        this.memoryText.setText(`MEMORY: ${mem}/${max}`);
        
        if (mem > max * 0.8) {
            this.memoryText.setColor('#ff4444');
        } else {
            this.memoryText.setColor('#00ffcc');
        }
    }
}