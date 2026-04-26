// AttentionGameScene.js - только одна декларация класса

class AttentionGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AttentionGameScene' });
        this.player = null;
        this.obstacles = null;
        this.cursors = null;
        this.keys = null;
        this.gameActive = true;
        this.timeLeft = 60;
        this.playerSpeed = 350;
        this.obstacleSpawnTimer = null;
        this.gameTimer = null;
    }
    
    init(data) {
        console.log('[AttentionGameScene] Init');
        this.onComplete = data.onComplete;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a);
        
        // Grid effect
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x1a1a2e, 0.3);
        for (let i = 0; i < width; i += 50) {
            grid.moveTo(i, 0);
            grid.lineTo(i, height);
            grid.moveTo(0, i);
            grid.lineTo(width, i);
        }
        grid.strokePath();
        
        // Warning header
        const warning = this.add.text(width / 2, 40, "⚠️ CRITICAL ALERT ⚠️", {
            fontSize: "28px",
            color: "#ff0000",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: warning,
            alpha: 0.4,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
        
        this.add.text(width / 2, 85, "Attention threshold exceeded. System purge initiated.", {
            fontSize: "12px",
            color: "#ff6666",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 110, "Use WASD or Arrow Keys to evade. Survive 60 seconds.", {
            fontSize: "12px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        // Player
        this.player = this.add.rectangle(width / 2, height - 70, 28, 28, 0x00ffcc);
        this.player.setStrokeStyle(2, 0xffffff);
        
        this.physics.add.existing(this.player);
        this.player.body.setCircle(16);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setBounce(0);
        
        // Player trail effect
        this.playerGlow = this.add.rectangle(width / 2, height - 70, 40, 40, 0x00ffcc, 0.25);
        
        // UI
        this.timerText = this.add.text(20, 20, "TIME: 01:00", {
            fontSize: "26px",
            color: "#00ffcc",
            fontFamily: "Courier New",
            fontWeight: "bold"
        });
        
        this.escapeText = this.add.text(width - 20, 20, "SURVIVE", {
            fontSize: "18px",
            color: "#ffaa00",
            fontFamily: "Courier New"
        }).setOrigin(1, 0);
        
        this.obstaclesGroup = this.physics.add.group();
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        
        // Lock player in main scene
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.player) {
            echoScene.player.canMove = false;
        }
        
        const terminalScene = this.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = false;
        }
        
        // Start timers
        this.startGameTimers();
        
        // Collision
        this.physics.add.overlap(this.player, this.obstaclesGroup, this.onHit, null, this);
    }
    
    startGameTimers() {
        // Spawn obstacles every 1 second
        this.obstacleSpawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
        
        // Countdown timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.gameActive) return;
                
                this.timeLeft--;
                const minutes = Math.floor(this.timeLeft / 60);
                const seconds = this.timeLeft % 60;
                this.timerText.setText(`TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                
                if (this.timeLeft <= 0) {
                    this.gameWin();
                }
            },
            callbackScope: this,
            repeat: 59
        });
    }
    
    spawnObstacle() {
        if (!this.gameActive) return;
        
        const width = this.cameras.main.width;
        const x = Phaser.Math.Between(50, width - 50);
        
        const obstacle = this.add.rectangle(x, -30, 32, 32, 0xff3333);
        obstacle.setStrokeStyle(2, 0xff8888);
        
        this.physics.add.existing(obstacle);
        obstacle.body.setVelocityY(280);
        obstacle.body.setCircle(16);
        
        // Rotation animation
        this.tweens.add({
            targets: obstacle,
            angle: 360,
            duration: 1500,
            repeat: -1
        });
        
        this.obstaclesGroup.add(obstacle);
        
        // Auto remove after 6 seconds
        this.time.delayedCall(6000, () => {
            if (obstacle && obstacle.active) obstacle.destroy();
        });
    }
    
    onHit() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        
        // Red flash
        this.cameras.main.flash(300, 255, 0, 0);
        
        // Stop all obstacles
        this.obstaclesGroup.getChildren().forEach(obs => {
            if (obs && obs.body) obs.body.setVelocityY(0);
        });
        
        // Stop timers
        if (this.obstacleSpawnTimer) this.obstacleSpawnTimer.remove();
        if (this.gameTimer) this.gameTimer.remove();
        
        // Show failure message
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, height / 2 - 40, "💀 SYSTEM PURGE FAILED 💀", {
            fontSize: "26px",
            color: "#ff0000",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 20, "Resetting all systems...", {
            fontSize: "16px",
            color: "#888888",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.time.delayedCall(2500, () => {
            this.exitGame(false);
        });
    }
    
    gameWin() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        
        // Stop timers
        if (this.obstacleSpawnTimer) this.obstacleSpawnTimer.remove();
        if (this.gameTimer) this.gameTimer.remove();
        
        // Stop obstacles
        this.obstaclesGroup.getChildren().forEach(obs => {
            if (obs && obs.body) obs.body.setVelocityY(0);
        });
        
        // Show victory message
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, height / 2 - 40, "✅ SYSTEM PURGE SUCCESSFUL ✅", {
            fontSize: "26px",
            color: "#00ff00",
            fontFamily: "Courier New",
            fontWeight: "bold"
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 20, "Returning to Nexus Core...", {
            fontSize: "16px",
            color: "#00ffcc",
            fontFamily: "Courier New"
        }).setOrigin(0.5);
        
        this.time.delayedCall(2500, () => {
            this.exitGame(true);
        });
    }
    
    update() {
        if (!this.gameActive || !this.player || !this.player.body) return;
        
        // Movement
        let vx = 0, vy = 0;
        const speed = this.playerSpeed;
        
        if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;
        
        this.player.body.setVelocity(vx, vy);
        
        // Update glow position
        this.playerGlow.setPosition(this.player.x, this.player.y);
        
        // Boundaries
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        if (this.player.x < 30) this.player.x = 30;
        if (this.player.x > width - 30) this.player.x = width - 30;
        if (this.player.y < 30) this.player.y = 30;
        if (this.player.y > height - 30) this.player.y = height - 30;
    }
    
    exitGame(success) {
        // Unlock player in main scene
        const echoScene = this.scene.get('EchoScene');
        if (echoScene && echoScene.player) {
            echoScene.player.canMove = true;
            
            if (success) {
                // Victory: keep progress, reset attention, teleport to spawn
                echoScene.registry.set('attention', 0);
                echoScene.player.x = 450;
                echoScene.player.y = 360;
                echoScene.cameras.main.centerOn(450, 360);
            } else {
                // Failure: full reset
                echoScene.registry.set('memory', 0);
                echoScene.registry.set('attention', 0);
                echoScene.registry.set('loreList', []);
                
                echoScene.player.x = 450;
                echoScene.player.y = 360;
                echoScene.cameras.main.centerOn(450, 360);
                
                // Reset rayCount
                if (echoScene.gameConfig) {
                    echoScene.gameConfig.rayCount = 20;
                    if (echoScene.lidarSystem) {
                        echoScene.lidarSystem.updateConfig(echoScene.gameConfig);
                    }
                }
                
                // Reload level to reset walls, items, devices
                if (echoScene.levelManager) {
                    echoScene.levelManager.loadLevel(echoScene.levelManager.currentLevel);
                }
            }
        }
        
        // Unlock terminal input
        const terminalScene = this.scene.get('TerminalScene');
        if (terminalScene) {
            terminalScene.input.keyboard.enabled = true;
        }
        
        // Resume main scenes
        this.scene.resume('EchoScene');
        this.scene.resume('UIScene');
        this.scene.resume('TerminalScene');
        
        // Stop this scene
        this.scene.stop('AttentionGameScene');
        
        if (this.onComplete) {
            this.onComplete(success);
        }
    }
}

window.AttentionGameScene = AttentionGameScene;