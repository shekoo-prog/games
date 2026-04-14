class EngineUI {
    constructor(engine, options = {}) {
        this.engine = engine;
        this.gameTitle = options.title || 'Game';
        this.instructions = options.instructions || 'Press Start to Play';
        this.icon = options.icon || '🎮';
        
        this.overlay = null;
        this.hud = null;
        
        this.init();
    }

    init() {
        this.injectStyles();
        this.createHUD();
        this.createOverlay();
    }

    injectStyles() {
        if (document.getElementById('engine-ui-styles')) return;
        const s = document.createElement('style');
        s.id = 'engine-ui-styles';
        s.textContent = `
            .game-overlay {
                position: fixed; inset: 0; background: rgba(0,8,25,0.95);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                z-index: 2000; backdrop-filter: blur(10px); color: white;
                font-family: 'Outfit', sans-serif; text-align: center;
                transition: opacity 0.3s;
            }
            .game-overlay.hidden { opacity: 0; pointer-events: none; }
            .game-overlay h1 { font-size: 4rem; margin: 0; color: #ffd700; text-shadow: 0 0 20px rgba(255,215,0,0.5); }
            .game-overlay .icon { font-size: 6rem; margin-bottom: 20px; animation: bounce 2s infinite; }
            .game-overlay .instructions { font-size: 1.2rem; color: #aaa; margin: 20px 0; line-height: 1.6; }
            .game-btn {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border: none; padding: 15px 40px; font-size: 1.5rem; font-weight: 900;
                border-radius: 50px; cursor: pointer; color: #000;
                box-shadow: 0 10px 30px rgba(255,215,0,0.3); transition: 0.2s;
            }
            .game-btn:hover { transform: scale(1.1); box-shadow: 0 15px 40px rgba(255,215,0,0.5); }
            
            .game-hud {
                position: fixed; top: 20px; left: 20px; display: flex; gap: 20px;
                z-index: 1000; font-family: 'Outfit', sans-serif; pointer-events: none;
            }
            .hud-item {
                background: rgba(255,255,255,0.1); backdrop-filter: blur(5px);
                border: 1px solid rgba(255,255,255,0.1); padding: 8px 20px;
                border-radius: 12px; color: white; font-weight: 900;
            }
            .hud-label { color: #ffd700; font-size: 0.8rem; text-transform: uppercase; display: block; }
            .hud-value { font-size: 1.5rem; }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(s);
    }

    createHUD() {
        this.hud = document.createElement('div');
        this.hud.className = 'game-hud';
        document.body.appendChild(this.hud);
        this.updateHUD({ score: 0, level: 1 });
    }

    updateHUD(data) {
        this.hud.innerHTML = `
            <div class="hud-item"><span class="hud-label">Score</span><span class="hud-value">${data.score}</span></div>
            ${data.lives !== undefined ? `<div class="hud-item"><span class="hud-label">Lives</span><span class="hud-value">${'❤️'.repeat(data.lives)}</span></div>` : ''}
            <div class="hud-item"><span class="hud-label">Level</span><span class="hud-value">${data.level}</span></div>
        `;
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'game-overlay';
        document.body.appendChild(this.overlay);
        this.showStart();
    }

    showStart() {
        this.overlay.innerHTML = `
            <div class="icon">${this.icon}</div>
            <h1>${this.gameTitle}</h1>
            <div class="instructions">${this.instructions}</div>
            <button class="game-btn" id="engine-start-btn">START GAME</button>
        `;
        this.overlay.classList.remove('hidden');
        document.getElementById('engine-start-btn').onclick = () => {
            this.overlay.classList.add('hidden');
            this.engine.start();
            if (this.onStart) this.onStart();
        };
    }

    showGameOver(score, level) {
        // Calculate rewards via GameCore if available
        let coins = Math.floor(score / 10);
        if (window.GameCore) window.GameCore.addCoins(coins);

        this.overlay.innerHTML = `
            <div class="icon">💀</div>
            <h1 style="color: #ff4757">GAME OVER</h1>
            <div class="instructions">
                SCORE: <span style="color:#ffd700; font-size: 2rem">${score}</span><br>
                LEVEL: ${level}<br>
                <span style="color:#2ed573">+${coins} 🪙 EARNED</span>
            </div>
            <button class="game-btn" id="engine-restart-btn">PLAY AGAIN</button>
        `;
        this.overlay.classList.remove('hidden');
        document.getElementById('engine-restart-btn').onclick = () => {
            location.reload(); // Simple way to reset everything
        };
    }
}

window.EngineUI = EngineUI;
