class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.currentMusic = null;
        this.isMuted = false;
    }
    
    playMusic(key, config = {}) {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
        
        this.currentMusic = this.scene.sound.add(key, {
            loop: config.loop || true,
            volume: config.volume || 0.5
        });
        
        if (!this.isMuted) {
            this.currentMusic.play();
        }
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }
    
    setVolume(volume) {
        if (this.currentMusic) {
            this.currentMusic.setVolume(volume);
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted && this.currentMusic) {
            this.currentMusic.pause();
        } else if (!this.isMuted && this.currentMusic) {
            this.currentMusic.resume();
        }
    }
    
    playEffect(key, config = {}) {
        const effect = this.scene.sound.add(key, {
            volume: config.volume || 0.3
        });
        
        if (!this.isMuted) {
            effect.play();
        }
        
        return effect;
    }
}