class MemorySystem {
    constructor(registry) {
        this.registry = registry;
    }
    
    init() {
        this.registry.set('memory', 0);
        this.registry.set('maxMemory', 512);
    }
    
    add(amount) {
        const current = this.registry.get('memory');
        const max = this.registry.get('maxMemory');
        const newValue = Math.min(current + amount, max);
        this.registry.set('memory', newValue);
        return newValue;
    }
    
    clear() {
        this.registry.set('memory', 0);
    }
    
    getCurrent() {
        return this.registry.get('memory');
    }
    
    getMax() {
        return this.registry.get('maxMemory');
    }
    
    getPercentage() {
        return (this.getCurrent() / this.getMax()) * 100;
    }
    
    isFull() {
        return this.getCurrent() >= this.getMax();
    }
}