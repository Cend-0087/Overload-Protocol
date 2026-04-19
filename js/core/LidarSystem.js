class LidarSystem {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.lastPulseTime = 0;
    }
    
    emitPulse(playerX, playerY, walls, memoryPoints, registry) {
        const now = this.scene.time.now / 1000;
        if (now - this.lastPulseTime >= this.config.cooldownTime) {
            this.executePulse(playerX, playerY, walls, memoryPoints, registry);
            this.lastPulseTime = now;
        }
    }
    
    executePulse(startX, startY, walls, memoryPoints, registry) {
        const cfg = this.config;
        let currentMem = registry.get('memory');
        const maxMem = registry.get('maxMemory');
        
        for (let i = 0; i < cfg.rayCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const result = this.castRay(startX, startY, angle, cfg.maxDistance, walls);
            
            this.animateRay(startX, startY, angle, result);
            
            if (result.hit && currentMem < maxMem) {
                this.createMemoryPoint(result.x, result.y, memoryPoints, cfg);
                
                this.createHitSpark(result.x, result.y, cfg);
                
                currentMem += cfg.memoryPerHit;
                const finalMem = Math.min(currentMem, maxMem);
                registry.set('memory', finalMem);
            }
        }
    }
    
    castRay(startX, startY, angle, maxDist, walls) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        let closestDist = maxDist;
        let hitDetected = false;
        let hitX = startX, hitY = startY;
        
        walls.getChildren().forEach(wall => {
            const body = wall.body;
            if (!body) return;
            
            const left   = body.x;
            const right  = body.x + body.width;
            const top    = body.y;
            const bottom = body.y + body.height;
            
            const t1 = (left   - startX) / dx;
            const t2 = (right  - startX) / dx;
            const t3 = (top    - startY) / dy;
            const t4 = (bottom - startY) / dy;
            
            const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
            const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
            
            if (tmax < 0 || tmin > tmax) return;
            
            const t = (tmin < 0) ? tmax : tmin;
            
            if (t > 0 && t < closestDist) {
                closestDist = t;
                hitDetected = true;
                hitX = startX + dx * t;
                hitY = startY + dy * t;
            }
        });
        
        return {
            x: hitX,
            y: hitY,
            hit: hitDetected,
            distance: closestDist
        };
    }
    
    animateRay(startX, startY, angle, result) {
        const cfg = this.config;
        const line = this.scene.add.graphics();
        line.lineStyle(cfg.lineThickness, cfg.lineColor, cfg.lineAlpha);
        line.moveTo(startX, startY);
        line.lineTo(startX, startY);
        line.strokePath();
        
        this.scene.tweens.add({
            targets: line,
            props: { scaleX: 1, alpha: 0 },
            duration: cfg.propagationTime,
            ease: 'Sine.easeOut',
            onUpdate: () => {
                line.clear();
                line.lineStyle(cfg.lineThickness, cfg.lineColor, cfg.lineAlpha);
                line.moveTo(startX, startY);
                const currentDist = result.distance * (line.scaleX || 1);
                line.lineTo(startX + Math.cos(angle) * currentDist, startY + Math.sin(angle) * currentDist);
                line.strokePath();
            },
            onComplete: () => line.destroy()
        });
    }
    
    createMemoryPoint(x, y, memoryPoints, cfg) {
        let merged = false;
        memoryPoints.getChildren().forEach(p => {
            if (Phaser.Math.Distance.Between(x, y, p.x, p.y) <= cfg.memoryPointMergeDistance) {
                merged = true;
            }
        });
        if (!merged) {
            memoryPoints.add(this.scene.add.circle(x, y, 3.5, 0x00ffcc, 1));
        }
    }
    
    createHitSpark(x, y, cfg) {
        const spark = this.scene.add.circle(x, y, cfg.hitSparkRadius, cfg.hitSparkColor, 0.85);
        this.scene.tweens.add({ 
            targets: spark, 
            radius: 1, 
            alpha: 0, 
            duration: 320, 
            onComplete: () => spark.destroy() 
        });
    }
}