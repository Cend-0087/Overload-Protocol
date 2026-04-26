class AttentionSystem {
    constructor(registry) {
        this.registry = registry;
        this.onOverloadCallback = null;
    }
    
    setOnOverload(callback) {
        this.onOverloadCallback = callback;
    }
    
    init() {
        this.registry.set('attention', 0);
        this.registry.set('isOverloaded', false);
    }
    
    set(value) {
        const newValue = Math.min(100, Math.max(0, value));
        this.registry.set('attention', newValue);
        
        if (newValue >= 100 && !this.registry.get('isOverloaded')) {
            this.triggerOverload();
        }
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
    
    triggerOverload() {
        if (this.registry.get('isOverloaded')) return;
        
        console.log('[AttentionSystem] OVERLOAD TRIGGERED');
        this.registry.set('isOverloaded', true);
        
        if (this.onOverloadCallback) {
            this.onOverloadCallback();
        }
    }
    
    reset() {
        this.registry.set('attention', 0);
        this.registry.set('isOverloaded', false);
    }
}

window.AttentionSystem = AttentionSystem;