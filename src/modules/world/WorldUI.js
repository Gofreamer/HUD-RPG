// src/modules/world/WorldUI.js
// HUD estilo SAO + Menu + Inventário + Skills + Party + Admin

import './world.css';

export class WorldUI {
  constructor({ playerData, uid, authService, onLogout }) {
    this.player = playerData;
    this.uid = uid;
    this.authService = authService;
    this.onLogout = onLogout;
    this.container = null;
    this.menuOpen = false;
    this.inventoryOpen = false;
    this.skillsOpen = false;
    this.partyOpen = false;
    this.adminOpen = false;
  }

  show() {
    this.createDOM();
    this.bindEvents();
    requestAnimationFrame(() => this.container.classList.add('visible'));
  }

  createDOM() {
    const p = this.player;
    const hpPercent = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
    const mpPercent = Math.max(0, Math.min(100, ((p.mp || 0) / (p.maxMp || 50)) * 100));
    const initial = (p.displayName || p.account || '?').charAt(0).toUpperCase();
    const isAdmin = p.isAdmin === true;

    this.container = document.createElement('div');
    this.container.id = 'world-screen';
    this.container.innerHTML = `
      <!-- BARRA SUPERIOR -->
      <div class="hud-top">
        <div class="player-info">
          <div class="player-avatar">${initial}</div>
          <div class="player-details">
            <div class="player-name">${this.escape(p.displayName || p.account)}</div>
            <div class="player-level">Lv. ${p.level || 1}  ·  ${this.escape(p.class || 'Aventureiro')}</div>
          </div>
          <div class="bars-block">
            <div class="hp-block">
              <div class="hp-label">HP</div>
              <div class="hp-bar-container">
                <div class="hp-bar-fill" style="width: ${hpPercent}%"></div>
                <div class="hp-text">${p.hp} / ${p.maxHp}</div>
              </div>
            </div>
            <div class="hp-block" style="margin-top:4px">
              <div class="hp-label">MP</div>
              <div class="hp-bar-container">
                <div class="hp-bar-fill" style="width: ${mpPercent}%; background: linear-gradient(90deg,#1d4ed8,#60a5fa)"></div>
                <div class="hp-text">${p.mp || 0} / ${p.maxMp || 50}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hud-actions">
          ${isAdmin ? '<button class="btn-hud admin" id="btn-admin">Admin</button>' : ''}
          <button class="btn-hud" id="btn-menu">Menu</button>
          <button class="btn-hud logout" id="btn-logout">Sair</button>
        </div>
      </div>

      <!-- ÁREA CENTRAL -->
      <div class="world-center">
        <div class="welcome-text">Bem-vindo ao GRPG</div>
        <div class="character-name-large">${this.escape(p.displayName || p.account)}</div>
        <div class="location-badge">${this.escape(p.location || 'Cidade dos Iniciantes')}</div>
      </div>

      <!-- PAINEL DE STATS (desktop) -->
      <div class="stats-panel">
        <div class="stats-title">Status</div>
        <div class="stat-row"><span>STR</span><span>${p.stats?.str ?? 10}</span></div>
        <div class="stat-row"><span>AGI</span><span>${p.stats?.agi ?? 10}</span></div>
        <div class="stat-row"><span>VIT</span><span>${p.stats?.vit ?? 10}</span></div>
        <div class="stat-row"><span>INT</span><span>${p.stats?.int ?? 10}</span></div>
        <div class="stat-row"><span>DEX</span><span>${p.stats?.dex ?? 10}</span></div>
        <div class="stat-row"><span>LUK</span><span>${p.stats?.luk ?? 10}</span></div>
      </div>

      <!-- BARRA INFERIOR -->
      <div class="hud-bottom">
        <div class="location-info">
          <div class="location-label">Localização Atual</div>
          <div class="location-name">${this.escape(p.location || 'Cidade dos Iniciantes')}</div>
          <div class="location-label" style="margin-top:2px">${this.escape(p.region || '')}</div>
        </div>
        <div class="quick-actions">
          <button class="btn-quick" id="btn-inventory">Inventário</button>
          <button class="btn-quick" id="btn-skills">Skills</button>
          <button class="btn-quick" id="btn-party">Party</button>
        </div>
      </div>

      <!-- OVERLAY DE MENUS -->
      <div id="panel-overlay" class="panel-overlay hidden"></div>
    `;

    document.body.appendChild(this.container);
  }

  bindEvents() {
    this.container.querySelector('#btn-logout').addEventListener('click', async () => {
      const btn = this.container.querySelector('#btn-logout');
      btn.textContent = '...';
      btn.disabled = true;
      try {
        await this.onLogout();
      } catch (err) {
        console.error(err);
        btn.textContent = 'Sair';
        btn.disabled = false;
      }
    });

    this.container.querySelector('#btn-menu').addEventListener('click', () => this.toggleMenu());
    this.container.querySelector('#btn-inventory').addEventListener('click', () => this.toggleInventory());
    this.container.querySelector('#btn-skills').addEventListener('click', () => this.toggleSkills());
    this.container.querySelector('#btn-party').addEventListener('click', () => this.toggleParty());

    const adminBtn = this.container.querySelector('#btn-admin');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.toggleAdmin());
    }

    this.container.querySelector('#panel-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'panel-overlay') this.closeAllPanels();
    });
  }

  // ========== MENU ==========
  toggleMenu() {
    if (this.menuOpen) return this.closeAllPanels();
    this.closeAllPanels();
    this.menuOpen = true;

    const p = this.player;
    const overlay = this.container.querySelector('#panel-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header">
          <h2>Menu</h2>
          <button class="btn-close" id="close-menu">✕</button>
        </div>
        <div class="panel-body">
          <div class="menu-section">
            <h3>Personagem</h3>
            <p><strong>Nome:</strong> ${this.escape(p.displayName)}</p>
            <p><strong>Classe:</strong> ${this.escape(p.class || 'Aventureiro')}</p>
            <p><strong>Nível:</strong> ${p.level || 1}</p>
            <p><strong>Conta:</strong> ${this.escape(p.account)}</p>
          </div>
          <div class="menu-section">
            <h3>Status Completo</h3>
            <div class="stat-grid">
              <div>STR <strong>${p.stats?.str ?? 10}</strong></div>
              <div>AGI <strong>${p.stats?.agi ?? 10}</strong></div>
              <div>VIT <strong>${p.stats?.vit ?? 10}</strong></div>
              <div>INT <strong>${p.stats?.int ?? 10}</strong></div>
              <div>DEX <strong>${p.stats?.dex ?? 10}</strong></div>
              <div>LUK <strong>${p.stats?.luk ?? 10}</strong></div>
            </div>
          </div>
          <div class="menu-section">
            <h3>Localização</h3>
            <p>${this.escape(p.location || 'Cidade dos Iniciantes')}</p>
            <p style="opacity:0.7;font-size:0.85rem">${this.escape(p.region || '')}</p>
          </div>
          <div class="menu-section">
            <button class="btn-panel" id="menu-logout">Sair do Jogo</button>
          </div>
        </div>
      </div>
    `;

    overlay.querySelector('#close-menu').addEventListener('click', () => this.closeAllPanels());
    overlay.querySelector('#menu-logout').addEventListener('click', () => {
      this.container.querySelector('#btn-logout').click();
    });
  }

  // ========== INVENTÁRIO ==========
  toggleInventory() {
    if (this.inventoryOpen) return this.closeAllPanels();
    this.closeAllPanels();
    this.inventoryOpen = true;

    const items = this.player.inventory || [];
    const overlay = this.container.querySelector('#panel-overlay');
    overlay.classList.remove('hidden');

    let itemsHtml = '';
    if (items.length === 0) {
      itemsHtml = `<div class="empty-inventory">Seu inventário está vazio.<br>Itens aparecerão aqui conforme o mestre distribuir nas cenas.</div>`;
    } else {
      itemsHtml = items.map(item => `
        <div class="inv-item">
          <div>
            <div class="inv-item-name">${this.escape(item.name || 'Item')}</div>
            ${item.description ? `<div style="font-size:0.78rem;color:#94a3b8;margin-top:2px">${this.escape(item.description)}</div>` : ''}
          </div>
          <div class="inv-item-qty">x${item.qty || 1}</div>
        </div>
      `).join('');
    }

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header">
          <h2>Inventário</h2>
          <button class="btn-close" id="close-inv">✕</button>
        </div>
        <div class="panel-body">
          <div class="inventory-grid">${itemsHtml}</div>
        </div>
      </div>
    `;
    overlay.querySelector('#close-inv').addEventListener('click', () => this.closeAllPanels());
  }

  // ========== SKILLS ==========
  toggleSkills() {
    if (this.skillsOpen) return this.closeAllPanels();
    this.closeAllPanels();
    this.skillsOpen = true;

    const skills = this.player.skills || this.getDefaultSkills();
    const overlay = this.container.querySelector('#panel-overlay');
    overlay.classList.remove('hidden');

    const skillsHtml = skills.map(s => `
      <div class="inv-item">
        <div>
          <div class="inv-item-name">${this.escape(s.name)}</div>
          <div style="font-size:0.78rem;color:#94a3b8;margin-top:2px">${this.escape(s.description || '')}</div>
        </div>
        <div class="inv-item-qty">${s.type || 'Ativa'}</div>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header">
          <h2>Skills</h2>
          <button class="btn-close" id="close-skills">✕</button>
        </div>
        <div class="panel-body">
          <div class="menu-section">
            <h3>Classe: ${this.escape(this.player.class || 'Aventureiro')}</h3>
          </div>
          <div class="inventory-grid">
            ${skills.length ? skillsHtml : '<div class="empty-inventory">Nenhuma skill ainda.<br>O mestre pode liberar habilidades conforme a história.</div>'}
          </div>
        </div>
      </div>
    `;
    overlay.querySelector('#close-skills').addEventListener('click', () => this.closeAllPanels());
  }

  getDefaultSkills() {
    const classId = (this.player.classId || '').toLowerCase();
    const defaults = {
      espadachim: [
        { name: 'Corte Horizontal', description: 'Ataque básico com a espada.', type: 'Ativa' },
        { name: 'Postura de Guarda', description: 'Aumenta defesa temporariamente.', type: 'Ativa' }
      ],
      mago: [
        { name: 'Bola de Fogo', description: 'Projétil mágico de fogo.', type: 'Ativa' },
        { name: 'Barreira Arcana', description: 'Escudo mágico básico.', type: 'Ativa' }
      ],
      assassino: [
        { name: 'Ataque Furtivo', description: 'Alto dano pelas costas.', type: 'Ativa' },
        { name: 'Passo Sombrio', description: 'Movimento rápido de curta distância.', type: 'Ativa' }
      ],
      curandeiro: [
        { name: 'Cura Leve', description: 'Restaura uma pequena quantidade de HP.', type: 'Ativa' },
        { name: 'Bênção', description: 'Aumenta resistência do alvo.', type: 'Ativa' }
      ],
      arqueiro: [
        { name: 'Tiro Preciso', description: 'Ataque à distância focado.', type: 'Ativa' },
        { name: 'Chuva de Flechas', description: 'Ataque em área com flechas.', type: 'Ativa' }
      ]
    };
    return defaults[classId] || [
      { name: 'Ataque Básico', description: 'Golpe simples.', type: 'Ativa' }
    ];
  }

  // ========== PARTY ==========
  toggleParty() {
    if (this.partyOpen) return this.closeAllPanels();
    this.closeAllPanels();
    this.partyOpen = true;

    const party = this.player.party || [];
    const overlay = this.container.querySelector('#panel-overlay');
    overlay.classList.remove('hidden');

    let partyHtml = '';
    if (party.length === 0) {
      partyHtml = `
        <div class="empty-inventory">
          Você não está em nenhuma party no momento.<br><br>
          Partys são formadas pelo mestre durante as cenas no Discord.<br>
          Quando fizer parte de um grupo, os membros aparecerão aqui.
        </div>`;
    } else {
      partyHtml = party.map(m => `
        <div class="inv-item">
          <div>
            <div class="inv-item-name">${this.escape(m.name)}</div>
            <div style="font-size:0.78rem;color:#94a3b8;margin-top:2px">${this.escape(m.class || '')} · Lv.${m.level || '?'}</div>
          </div>
          <div class="inv-item-qty">${m.role || 'Membro'}</div>
        </div>
      `).join('');
    }

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header">
          <h2>Party</h2>
          <button class="btn-close" id="close-party">✕</button>
        </div>
        <div class="panel-body">
          <div class="inventory-grid">${partyHtml}</div>
        </div>
      </div>
    `;
    overlay.querySelector('#close-party').addEventListener('click', () => this.closeAllPanels());
  }

  // ========== ADMIN ==========
  async toggleAdmin() {
    if (this.adminOpen) return this.closeAllPanels();
    this.closeAllPanels();
    this.adminOpen = true;

    const overlay = this.container.querySelector('#panel-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="side-panel admin-panel">
        <div class="panel-header">
          <h2>Painel Admin</h2>
          <button class="btn-close" id="close-admin">✕</button>
        </div>
        <div class="panel-body">
          <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:12px">Carregando jogadores...</p>
        </div>
      </div>
    `;
    overlay.querySelector('#close-admin').addEventListener('click', () => this.closeAllPanels());

    try {
      const players = await this.authService.getAllPlayers();
      this.renderAdminList(players);
    } catch (err) {
      overlay.querySelector('.panel-body').innerHTML = `<p style="color:#fca5a5">Erro ao carregar jogadores. Verifique as regras do Realtime Database.</p>`;
    }
  }

  renderAdminList(players) {
    const body = this.container.querySelector('.admin-panel .panel-body');
    if (!body) return;

    body.innerHTML = `
      <div class="admin-section">
        <h3>Jogadores (${players.length})</h3>
        <div class="admin-player-list">
          ${players.map(p => `
            <div class="admin-player" data-uid="${p.uid}">
              <div>
                <strong>${this.escape(p.displayName || p.account)}</strong>
                <span style="opacity:0.6;font-size:0.8rem"> · Lv.${p.level || 1} · ${this.escape(p.class || '-')}</span>
              </div>
              <button class="btn-tiny edit-player" data-uid="${p.uid}">Editar</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div id="admin-edit-area"></div>
    `;

    body.querySelectorAll('.edit-player').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const player = players.find(p => p.uid === uid);
        this.renderAdminEdit(player);
      });
    });
  }

  renderAdminEdit(player) {
    const area = this.container.querySelector('#admin-edit-area');
    if (!area || !player) return;

    const invStr = (player.inventory || []).map(i => `${i.name}|${i.qty || 1}|${i.description || ''}`).join('\n');

    area.innerHTML = `
      <div class="admin-section" style="margin-top:16px;border-top:1px solid rgba(148,163,184,0.15);padding-top:14px">
        <h3>Editando: ${this.escape(player.displayName || player.account)}</h3>
        <div class="admin-form">
          <label>Nome <input type="text" id="adm-name" value="${this.escape(player.displayName || '')}" /></label>
          <label>Nível <input type="number" id="adm-level" value="${player.level || 1}" min="1" /></label>
          <label>HP <input type="number" id="adm-hp" value="${player.hp || 100}" /></label>
          <label>Max HP <input type="number" id="adm-maxhp" value="${player.maxHp || 100}" /></label>
          <label>MP <input type="number" id="adm-mp" value="${player.mp || 50}" /></label>
          <label>Max MP <input type="number" id="adm-maxmp" value="${player.maxMp || 50}" /></label>
          <label>Localização <input type="text" id="adm-location" value="${this.escape(player.location || '')}" /></label>
          <label>Região <input type="text" id="adm-region" value="${this.escape(player.region || '')}" /></label>
          <label>STR <input type="number" id="adm-str" value="${player.stats?.str ?? 10}" /></label>
          <label>AGI <input type="number" id="adm-agi" value="${player.stats?.agi ?? 10}" /></label>
          <label>VIT <input type="number" id="adm-vit" value="${player.stats?.vit ?? 10}" /></label>
          <label>INT <input type="number" id="adm-int" value="${player.stats?.int ?? 10}" /></label>
          <label>DEX <input type="number" id="adm-dex" value="${player.stats?.dex ?? 10}" /></label>
          <label>LUK <input type="number" id="adm-luk" value="${player.stats?.luk ?? 10}" /></label>
        </div>

        <div style="margin-top:14px">
          <label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px">
            Inventário (um item por linha: Nome|Qtd|Descrição)
          </label>
          <textarea id="adm-inventory" style="width:100%;height:90px;background:rgba(30,41,59,0.8);border:1px solid rgba(148,163,184,0.25);border-radius:4px;color:#e2e8f0;padding:8px;font-size:0.85rem;resize:vertical">${this.escape(invStr)}</textarea>
        </div>

        <button class="btn-panel" id="adm-save" style="margin-top:12px">Salvar Alterações</button>
        <div id="adm-msg" style="margin-top:8px;font-size:0.85rem"></div>
      </div>
    `;

    area.querySelector('#adm-save').addEventListener('click', async () => {
      const msg = area.querySelector('#adm-msg');
      msg.textContent = 'Salvando...';
      msg.style.color = '#94a3b8';

      // Parse inventário
      const invRaw = area.querySelector('#adm-inventory').value.trim();
      const inventory = invRaw
        ? invRaw.split('\n').filter(l => l.trim()).map(line => {
            const [name, qty, ...desc] = line.split('|');
            return {
              name: (name || 'Item').trim(),
              qty: Number(qty) || 1,
              description: (desc.join('|') || '').trim()
            };
          })
        : [];

      const data = {
        displayName: area.querySelector('#adm-name').value.trim(),
        level: Number(area.querySelector('#adm-level').value),
        hp: Number(area.querySelector('#adm-hp').value),
        maxHp: Number(area.querySelector('#adm-maxhp').value),
        mp: Number(area.querySelector('#adm-mp').value),
        maxMp: Number(area.querySelector('#adm-maxmp').value),
        location: area.querySelector('#adm-location').value.trim(),
        region: area.querySelector('#adm-region').value.trim(),
        stats: {
          str: Number(area.querySelector('#adm-str').value),
          agi: Number(area.querySelector('#adm-agi').value),
          vit: Number(area.querySelector('#adm-vit').value),
          int: Number(area.querySelector('#adm-int').value),
          dex: Number(area.querySelector('#adm-dex').value),
          luk: Number(area.querySelector('#adm-luk').value)
        },
        inventory
      };

      try {
        await this.authService.updatePlayer(player.uid, data);
        msg.textContent = 'Salvo com sucesso!';
        msg.style.color = '#4ade80';

        if (player.uid === this.uid) {
          this.player = { ...this.player, ...data };
          this.refreshHUD();
        }
      } catch (err) {
        msg.textContent = 'Erro: ' + (err.message || 'falha ao salvar');
        msg.style.color = '#fca5a5';
      }
    });
  }

  refreshHUD() {
    this.hide();
    setTimeout(() => this.show(), 100);
  }

  closeAllPanels() {
    this.menuOpen = false;
    this.inventoryOpen = false;
    this.skillsOpen = false;
    this.partyOpen = false;
    this.adminOpen = false;
    const overlay = this.container?.querySelector('#panel-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
    }
  }

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => this.container?.remove(), 800);
    }
  }
}
