// src/modules/world/WorldUI.js
// Tela in-world com HUD estilo SAO clássico

import './world.css';

export class WorldUI {
  constructor({ playerData, onLogout }) {
    this.player = playerData;
    this.onLogout = onLogout;
    this.container = null;
  }

  show() {
    this.createDOM();
    this.bindEvents();
    requestAnimationFrame(() => {
      this.container.classList.add('visible');
    });
  }

  createDOM() {
    const p = this.player;
    const hpPercent = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
    const initial = (p.displayName || p.account || '?').charAt(0).toUpperCase();

    this.container = document.createElement('div');
    this.container.id = 'world-screen';
    this.container.innerHTML = `
      <!-- BARRA SUPERIOR -->
      <div class="hud-top">
        <div class="player-info">
          <div class="player-avatar">${initial}</div>
          <div class="player-details">
            <div class="player-name">${this.escape(p.displayName || p.account)}</div>
            <div class="player-level">Lv. ${p.level || 1}</div>
          </div>
          <div class="hp-block">
            <div class="hp-label">HP</div>
            <div class="hp-bar-container">
              <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
              <div class="hp-text">${p.hp} / ${p.maxHp}</div>
            </div>
          </div>
        </div>

        <div class="hud-actions">
          <button class="btn-hud" id="btn-menu">Menu</button>
          <button class="btn-hud logout" id="btn-logout">Logout</button>
        </div>
      </div>

      <!-- ÁREA CENTRAL -->
      <div class="world-center">
        <div class="welcome-text">Welcome to</div>
        <div class="character-name-large">${this.escape(p.displayName || p.account)}</div>
        <div class="location-badge">${this.escape(p.location || 'Unknown')}</div>
      </div>

      <!-- PAINEL DE STATS (esquerda) -->
      <div class="stats-panel">
        <div class="stats-title">Status</div>
        <div class="stat-row"><span>STR</span><span>${p.stats?.str ?? 10}</span></div>
        <div class="stat-row"><span>AGI</span><span>${p.stats?.agi ?? 10}</span></div>
        <div class="stat-row"><span>VIT</span><span>${p.stats?.vit ?? 10}</span></div>
        <div class="stat-row"><span>INT</span><span>${p.stats?.int ?? 10}</span></div>
      </div>

      <!-- BARRA INFERIOR -->
      <div class="hud-bottom">
        <div class="location-info">
          <div class="location-label">Current Location</div>
          <div class="location-name">${this.escape(p.location || 'Town of Beginnings')}</div>
        </div>
        <div class="quick-actions">
          <button class="btn-quick" disabled>Inventory</button>
          <button class="btn-quick" disabled>Skills</button>
          <button class="btn-quick" disabled>Party</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
  }

  bindEvents() {
    const btnLogout = this.container.querySelector('#btn-logout');
    btnLogout.addEventListener('click', async () => {
      btnLogout.textContent = '...';
      btnLogout.disabled = true;
      try {
        await this.onLogout();
      } catch (err) {
        console.error(err);
        btnLogout.textContent = 'Logout';
        btnLogout.disabled = false;
      }
    });

    // Menu ainda não implementado
    const btnMenu = this.container.querySelector('#btn-menu');
    btnMenu.addEventListener('click', () => {
      alert('Menu em construção...');
    });
  }

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => {
        this.container?.remove();
      }, 800);
    }
  }

  // Atualiza HP em tempo real (útil depois)
  updateHP(current, max) {
    const fill = this.container?.querySelector('.hp-bar-fill');
    const text = this.container?.querySelector('.hp-text');
    if (fill && text) {
      const percent = Math.max(0, Math.min(100, (current / max) * 100));
      fill.style.width = `${percent}%`;
      text.textContent = `${current} / ${max}`;
    }
  }
}
