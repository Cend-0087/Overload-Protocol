class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
        this.isPlaying = false;
    }
    
    startMusic() {
        if (this.isPlaying) return;
        
        this.scene.sound.context.resume();
        this.music = this.scene.sound.add('calm', { loop: true, volume: 0.05 });
        this.music.play();
        this.isPlaying = true;
    }
}