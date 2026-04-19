class AttentionSystem {
    constructor(registry) {
        this.registry = registry;
    }
    
    init() {
        this.registry.set('attention', 0);
    }
    
    set(value) {
        this.registry.set('attention', Math.min(100, Math.max(0, value)));
    }
    
    add(amount) {
        const current = this.registry.get('attention');
        this.set(current + amount);
    }
    
    getCurrent() {
        return this.registry.get('attention');
    }
    
    isOverloaded() {
        return this.registry.get('isOverloaded') || false;
    }
    
    setOverloaded(value) {
        this.registry.set('isOverloaded', value);
    }
}