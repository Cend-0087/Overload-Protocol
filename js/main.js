class GlitchPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            name: 'GlitchPipeline',
            fragShader: `
            precision mediump float;
            uniform sampler2D uMainSampler;
            uniform float uTime;
            uniform float uIntensity;
            varying vec2 outTexCoord;

            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vec2 uv = outTexCoord;
                float i = uIntensity;
                if (i > 0.0) {
                    float sliceY = floor(uv.y * 20.0);
                    if (rand(vec2(sliceY, uTime)) < i * 0.15) {
                        uv.x += (rand(vec2(uTime)) - 0.5) * 0.1 * i;
                    }
                    vec4 r = texture2D(uMainSampler, uv + vec2(0.01 * i, 0.0));
                    vec4 g = texture2D(uMainSampler, uv);
                    vec4 b = texture2D(uMainSampler, uv - vec2(0.01 * i, 0.0));
                    gl_FragColor = vec4(r.r, g.g, b.b, 1.0) + (rand(uv + uTime) - 0.5) * 0.2 * i;
                } else {
                    gl_FragColor = texture2D(uMainSampler, uv);
                }
            }`
        });
        this.intensity = 0; // Публичное свойство для доступа извне
    }

    onPreRender() {
        this.set1f('uTime', this.game.loop.time);
        this.set1f('uIntensity', this.intensity);
    }
}

// 2. Теперь создаем конфиг
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    // Регистрируем наш класс пайплайна
    pipeline: { 'Glitch': GlitchPipeline },
    scene: [EchoScene, UIScene]
};

const game = new Phaser.Game(config);

// Реестр данных
game.registry.set('memory', 0);
game.registry.set('maxMemory', 128);
game.registry.set('attention', 0);
game.registry.set('uiWidth', 420);
game.registry.set('isDraggingDivider', false);