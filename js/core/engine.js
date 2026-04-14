class GameEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = options.width || 800;
        this.height = options.height || 600;
        
        this.entities = [];
        this.particles = [];
        this.input = { x: 0, y: 0, isDown: false, keys: {} };
        this.assets = { images: {}, sounds: {} };
        
        this.isRunning = false;
        this.lastTime = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        this.initCanvas();
        this.initInputs();
        
        // Hooks for the developer
        this.onUpdate = (dt) => {};
        this.onDraw = (ctx) => {};
    }

    // ── INITIALIZATION ──
    initCanvas() {
        const resize = () => {
            const containerWidth = window.innerWidth - 40;
            const containerHeight = window.innerHeight - 120;
            const ratio = this.width / this.height;

            if (containerWidth / containerHeight > ratio) {
                this.canvas.style.height = containerHeight + 'px';
                this.canvas.style.width = (containerHeight * ratio) + 'px';
            } else {
                this.canvas.style.width = containerWidth + 'px';
                this.canvas.style.height = (containerWidth / ratio) + 'px';
            }
        };

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        window.addEventListener('resize', resize);
        resize();
    }

    initInputs() {
        const updatePos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            this.input.x = (clientX - rect.left) * (this.width / rect.width);
            this.input.y = (clientY - rect.top) * (this.height / rect.height);
        };

        this.canvas.addEventListener('mousemove', updatePos);
        this.canvas.addEventListener('mousedown', () => this.input.isDown = true);
        this.canvas.addEventListener('mouseup', () => this.input.isDown = false);
        
        this.canvas.addEventListener('touchstart', (e) => {
            this.input.isDown = true;
            updatePos(e);
            if (e.cancelable) e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => this.input.isDown = false);
        this.canvas.addEventListener('touchmove', (e) => {
            updatePos(e);
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        window.addEventListener('keydown', (e) => this.input.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.input.keys[e.code] = false);
    }

    // ── ASSET LOADING ──
    async loadAssets(manifest) {
        const loadImg = (url) => new Promise(res => {
            const img = new Image();
            img.onload = () => res(img);
            img.src = url;
        });
        
        const loadSnd = (url) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            return audio;
        };

        if (manifest.images) {
            for (const [key, url] of Object.entries(manifest.images)) {
                this.assets.images[key] = await loadImg(url);
            }
        }
        if (manifest.sounds) {
            for (const [key, url] of Object.entries(manifest.sounds)) {
                this.assets.sounds[key] = loadSnd(url);
            }
        }
    }

    playSound(key, volume = 1) {
        const sound = this.assets.sounds[key];
        if (sound) {
            const s = sound.cloneNode();
            s.volume = volume;
            s.play().catch(() => {});
        }
    }

    // ── GAME LOOP ──
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    loop(now = performance.now()) {
        if (!this.isRunning) return;
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.shakeTimer > 0) this.shakeTimer -= dt;

        // Update Particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });

        // Update Entities
        this.entities = this.entities.filter(e => e.active);
        this.entities.forEach(e => e.update(dt));

        this.onUpdate(dt);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        
        // Screen Shake
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        this.onDraw(this.ctx);

        // Draw Entities
        this.entities.forEach(e => e.draw(this.ctx));

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    // ── EFFECTS ──
    shake(intensity = 10, duration = 0.2) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    spawnExplosion(x, y, color = '#fff', count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 0.5 + Math.random() * 0.5,
                color,
                size: 2 + Math.random() * 4
            });
        }
    }

    // ── COLLISION ──
    rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
    }
}

/**
 * 🎨 Entity Base Class
 */
class GameEntity {
    constructor(engine, x, y, w, h) {
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.active = true;
    }
    update(dt) {}
    draw(ctx) {}
}

window.GameEngine = GameEngine;
window.GameEntity = GameEntity;
