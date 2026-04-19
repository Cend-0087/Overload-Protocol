class SimpleGlitchEffect {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.glitchGraphics = null;
        this.glitchInterval = null;
        this.stopTimer = null;
        this.activeTweens = [];
    }
    
    start(duration = 600) {
        console.log('[SimpleGlitchEffect] Запуск эффекта');
        
        // ПОЛНОСТЬЮ уничтожаем всё предыдущее
        this.destroy();
        
        this.isActive = true;
        
        // Получаем все камеры
        const cameras = this.getAllCameras();
        
        // 1. Сначала очищаем все камеры от старых пайплайнов
        this.cleanAllCameras(cameras);
        
        // 2. Применяем новый глитч
        this.applyFreshGlitch(cameras);
        
        // 3. Тряска
        this.shakeCameras(cameras);
        
        // 4. Визуальные артефакты (с автоматическим уничтожением)
        this.createFreshArtifacts();
        
        // 5. Таймер остановки
        this.stopTimer = this.scene.time.delayedCall(duration, () => {
            this.destroy();
        });
    }
    
    getAllCameras() {
        const cameras = [];
        
        if (this.scene.cameras && this.scene.cameras.main) {
            cameras.push(this.scene.cameras.main);
        }
        if (this.scene.consoleCamera) {
            cameras.push(this.scene.consoleCamera);
        }
        
        const echoScene = this.scene.scene.get('EchoScene');
        if (echoScene && echoScene.cameras && echoScene.cameras.main) {
            cameras.push(echoScene.cameras.main);
        }
        
        return cameras;
    }
    
    cleanAllCameras(cameras) {
        cameras.forEach(cam => {
            if (!cam) return;
            
            // Останавливаем тряску
            if (cam.stopShake) cam.stopShake();
            if (cam.clearFlash) cam.clearFlash();
            
            // Удаляем ВСЕ пост-эффекты с камеры
            if (cam.postPipelines) {
                // Создаем копию массива, чтобы избежать проблем при итерации
                const pipelines = [...cam.postPipelines];
                pipelines.forEach(pipeline => {
                    if (pipeline && pipeline.name) {
                        cam.removePostPipeline(pipeline.name);
                    }
                });
            }
        });
    }
    
    applyFreshGlitch(cameras) {
        cameras.forEach((cam, idx) => {
            if (!cam) return;
            
            // Создаем новый пайплайн
            cam.setPostPipeline(GlitchPipeline);
            const fx = cam.getPostPipeline(GlitchPipeline);
            
            if (fx) {
                fx.intensity = 1.0;
                
                // Пульсация
                const tween = this.scene.tweens.add({
                    targets: fx,
                    intensity: 0.5,
                    duration: 100,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        // Плавное затухание
                        if (fx && this.isActive) {
                            const fadeTween = this.scene.tweens.add({
                                targets: fx,
                                intensity: 0,
                                duration: 200,
                                ease: 'Sine.easeOut'
                            });
                            this.activeTweens.push(fadeTween);
                        }
                    }
                });
                this.activeTweens.push(tween);
            }
        });
    }
    
    shakeCameras(cameras) {
        cameras.forEach(cam => {
            if (cam && cam.shake) {
                cam.shake(300, 0.012);
            }
        });
    }
    
    createFreshArtifacts() {
        // Создаем новый графический объект
        this.glitchGraphics = this.scene.add.graphics();
        this.glitchGraphics.setDepth(10000);
        this.glitchGraphics.setScrollFactor(0);
        
        let frames = 0;
        const maxFrames = 12;
        
        this.glitchInterval = this.scene.time.addEvent({
            delay: 45,
            callback: () => {
                if (!this.glitchGraphics) return;
                
                // Очищаем предыдущий кадр
                this.glitchGraphics.clear();
                
                // Рассчитываем затухание
                const progress = frames / maxFrames;
                const intensity = 1 - progress;
                
                // Горизонтальные полосы (уменьшаются со временем)
                const numBars = Math.floor(Math.random() * 8 * intensity) + 3;
                for (let i = 0; i < numBars; i++) {
                    const y = Math.random() * this.scene.scale.height;
                    const height = Math.random() * 4 + 1;
                    const alpha = Math.random() * 0.4 * intensity;
                    
                    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    this.glitchGraphics.fillStyle(color, alpha);
                    this.glitchGraphics.fillRect(0, y, this.scene.scale.width, height);
                }
                
                // Случайные глитч-блоки (только в начале)
                if (frames < 6 && Math.random() > 0.7) {
                    const x = Math.random() * this.scene.scale.width;
                    const w = Math.random() * 60 + 20;
                    this.glitchGraphics.fillStyle(0xffffff, 0.15 * intensity);
                    this.glitchGraphics.fillRect(x, 0, w, this.scene.scale.height);
                }
                
                frames++;
                
                // Самоуничтожение после завершения
                if (frames >= maxFrames) {
                    this.destroyArtifacts();
                }
            },
            repeat: maxFrames
        });
    }
    
    destroyArtifacts() {
        if (this.glitchInterval) {
            this.glitchInterval.remove();
            this.glitchInterval = null;
        }
        if (this.glitchGraphics) {
            this.glitchGraphics.clear();
            this.glitchGraphics.destroy();
            this.glitchGraphics = null;
        }
    }
    
    destroy() {
        console.log('[SimpleGlitchEffect] Полное уничтожение эффекта');
        
        // Останавливаем все твины
        this.activeTweens.forEach(tween => {
            if (tween && tween.stop) tween.stop();
        });
        this.activeTweens = [];
        
        // Останавливаем таймер
        if (this.stopTimer) {
            this.stopTimer.remove();
            this.stopTimer = null;
        }
        
        // Уничтожаем артефакты
        this.destroyArtifacts();
        
        // Очищаем все камеры
        const cameras = this.getAllCameras();
        this.cleanAllCameras(cameras);
        
        // Небольшая задержка для гарантии
        this.scene.time.delayedCall(50, () => {
            // Принудительно перерисовываем
            cameras.forEach(cam => {
                if (cam && cam.render) cam.render();
            });
        });
        
        this.isActive = false;
        console.log('[SimpleGlitchEffect] Уничтожение завершено');
    }
}