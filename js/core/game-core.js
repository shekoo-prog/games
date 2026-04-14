const GameCore = {
    // ───── DATA ─────
    state: {
        coins: 0,
        bestScores: {},
        trophies: [],
        user: { name: 'بطل القمار', avatar: '🎮' },
        settings: { sound: true, theme: 'dark' },
        dailyChallenge: { date: '', game: '', goal: 0, completed: false }
    },

    // ───── INITIALIZE ─────
    init() {
        this.load();
        this.checkDaily();
        this.injectGlobalStyles();
    },

    load() {
        const saved = localStorage.getItem('game_hub_data');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch(e) { console.error("Data corruption", e); }
        }
    },

    save() {
        this.checkTrophies();
        localStorage.setItem('game_hub_data', JSON.stringify(this.state));
        window.dispatchEvent(new CustomEvent('coreDataUpdated', { detail: this.state }));
    },

    checkTrophies() {
        const s = this.state;
        const add = (id, name, icon) => {
            if (!s.trophies.find(t => t.id === id)) {
                s.trophies.push({ id, name, icon });
                this.showPopup(`🏆 جائزة جديدة: ${name}!`, '#ffd700');
            }
        };

        if (s.coins >= 100) add('coins_100', 'جامع العملات', '🥉');
        if (s.coins >= 1000) add('coins_1000', 'ثري الحرب', '🥈');
        if (s.dailyChallenge.completed) add('daily_1', 'بطل اليوم', '🌟');
        
        // Best scores achievements
        Object.entries(s.bestScores).forEach(([game, score]) => {
            if (score >= 500) add(`master_${game}`, `أستاذ ${game}`, '🥇');
        });
    },

    // ───── ECONOMY ─────
    addCoins(amount) {
        this.state.coins += amount;
        this.save();
        this.showPopup(`+${amount} 🪙`, '#ffd700');
    },

    updateBest(gameId, score) {
        if (!this.state.bestScores[gameId] || score > this.state.bestScores[gameId]) {
            this.state.bestScores[gameId] = score;
            this.save();
            return true;
        }
        return false;
    },

    // ───── USER PROFILE ─────
    updateUser(name, avatar) {
        this.state.user = { name, avatar };
        this.save();
    },

    // ───── DAILY CHALLENGE ─────
    checkDaily() {
        const today = new Date().toLocaleDateString();
        if (this.state.dailyChallenge.date !== today) {
            const games = ['neon-runner', 'hexa-puzzle', 'math-quest', 'word-connect', 'color-maze'];
            const randomGame = games[Math.floor(Math.random() * games.length)];
            this.state.dailyChallenge = {
                date: today,
                game: randomGame,
                goal: 100 + Math.floor(Math.random() * 400),
                completed: false
            };
            this.save();
        }
    },

    // ───── UI HELPERS ─────
    showPopup(text, color = '#fff') {
        const p = document.createElement('div');
        p.className = 'core-popup';
        p.textContent = text;
        p.style.cssText = `
            position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.8); color: ${color}; padding: 10px 20px;
            border-radius: 20px; border: 1.5px solid ${color}; font-weight: 900;
            z-index: 9999; animation: core-pop 1.5s forwards; pointer-events: none;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    },

    injectGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes core-pop {
                0% { opacity: 0; transform: translate(-50%, 20px) scale(0.8); }
                15% { opacity: 1; transform: translate(-50%, 0) scale(1.1); }
                85% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -40px) scale(0.8); }
            }
            .global-hud {
                position: fixed; top: 10px; right: 10px; z-index: 1000;
                display: flex; gap: 10px; pointer-events: none;
            }
            .hud-pill {
                background: rgba(0,0,0,0.7); border: 1px solid rgba(255,215,0,0.3);
                border-radius: 20px; padding: 4px 12px; font-size: 13px; font-weight: 900;
                display: flex; align-items: center; gap: 5px; color: #ffd700;
                backdrop-filter: blur(5px);
            }
        `;
        document.head.appendChild(style);
    },

    updateGlobalHUD() {
        let hud = document.getElementById('core-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'core-hud';
            hud.className = 'global-hud';
            document.body.appendChild(hud);
        }
        hud.innerHTML = `
            <div class="hud-pill">🪙 ${this.state.coins}</div>
            <div class="hud-pill">${this.state.user.avatar} ${this.state.user.name}</div>
        `;
    },

    // ───── ENGINE INTEGRATION ─────
    setupEngine(canvasId, options) {
        if (!window.GameEngine) {
            console.error("GameEngine not loaded. Include js/engine.js first.");
            return null;
        }
        const engine = new GameEngine(canvasId, options);
        engine.core = this; // Link core to engine
        return engine;
    }
};

// Initialize on Load
window.addEventListener('load', () => {
    GameCore.init();
    GameCore.updateGlobalHUD();
});
window.addEventListener('coreDataUpdated', () => GameCore.updateGlobalHUD());
