class InterfaceElements {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.memoryText = null;
        this.attentionText = null;
    }
    
    create() {
        this.container = this.scene.add.container(0, 0);
        
        const title = this.scene.add.text(30, 40, 'SYSTEM INTERFACE', { 
            fontSize: '24px', color: '#ffcc00', fontFamily: 'Courier New' 
        }).setShadow(0, 0, '#ffff00', 3);
        
        this.memoryText = this.scene.add.text(30, 120, 'MEMORY: 0/45', { 
            fontSize: '20px', color: '#00ffcc', fontFamily: 'Courier New' 
        });
        
        this.attentionText = this.scene.add.text(30, 170, 'ATTENTION: 0%', { 
            fontSize: '18px', color: '#ff6666', fontFamily: 'Courier New' 
        });
        
        this.container.add([title, this.memoryText, this.attentionText]);
        
        return this.container;
    }
    
    updateMemory(memory, maxMemory) {
        this.memoryText.setText(`MEMORY: ${memory}/${maxMemory}`);
        this.memoryText.setColor(memory > maxMemory * 0.75 ? '#ff4444' : '#00ffcc');
    }
    
    updateAttention(attention) {
        this.attentionText.setText(`ATTENTION: ${attention}%`);
    }
    
    glitchMemory() {
        const chars = '01X#@%&?';
        const originalText = this.memoryText.text;
        
        this.memoryText.setText(originalText.split('').map(char =>
            Math.random() > 0.8 ? chars[Math.floor(Math.random() * chars.length)] : char
        ).join(''));
        this.memoryText.setX(30 + Math.random() * 10 - 5);
        this.memoryText.setColor(Math.random() > 0.5 ? '#ff0000' : '#00ffff');
    }
    
    resetMemoryPosition() {
        this.memoryText.setX(30);
        this.memoryText.setColor('#00ffcc');
    }
}