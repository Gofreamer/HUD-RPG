// src/modules/world/WorldUI.js
import './world.css';
import { Sound } from '../utils/Sound.js';

const CONDITION_LABELS = {
  normal: 'Normal',
  ferido: 'Ferido',
  exausto: 'Exausto',
  critico: 'Crítico'
};

const RARITY_LABELS = {
  comum: 'Comum',
  raro: 'Raro',
  unico: 'Único'
};

export class WorldUI {
  constructor({ playerData, uid, authService, onLogout }) {
    this.player = playerData;
    this.uid = uid;
    this.authService = authService;
    this.onLogout = onLogout;
    this.container = null;
    this.currentPanel = null;
  }

  show() {
    this.createDOM();
    this.bindEvents();
    this.authService.listenPlayer(this.uid, (data) => {
      this.player = data;
      this.updateHUD();
      if (this.currentPanel && this.currentPanel !== 'admin') {
        this.renderCurrentPanel();
      }
    });
    requestAnimationFrame(() => this.container.classList.add('visible'));
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'world-screen';
    this.container.innerHTML = `
      <div class="hud-top">
        <div class="player-info">
          <div class="player-avatar" id="hud-avatar">?</div>
          <div class="player-details">
            <div class="player-name" id="hud-name">—</div>
            <div class="player-level" id="hud-level">Lv. 1</div>
            <div class="player-meta">
              <span class="condition-badge" id="hud-condition">Normal</span>
              <span class="zone-badge" id="hud-zone">Área Segura</span>
            </div>
          </div>
          <div class="bars-block">
            <div class="hp-block">
              <div class="hp-label">HP</div>
              <div class="hp-bar-container">
                <div class="hp-bar-fill" id="hud-hp-fill" style="width:100%"></div>
                <div class="hp-text" id="hud-hp-text">100 / 100</div>
              </div>
            </div>
            <div class="hp-block" style="margin-top:4px">
              <div class="hp-label">MP</div>
              <div class="hp-bar-container">
                <div class="hp-bar-fill" id="hud-mp-fill" style="width:100%;background:linear-gradient(90deg,#1d4ed8,#60a5fa)"></div>
                <div class="hp-text" id="hud-mp-text">50 / 50</div>
              </div>
            </div>
          </div>
        </div>
        <div class="hud-actions" id="hud-actions"></div>
      </div>

      <div class="world-center">
        <div class="welcome-text">Bem-vindo ao GRPG</div>
        <div class="character-name-large" id="hud-name-large">—</div>
        <div class="guild-line" id="hud-guild" style="display:none"></div>
        <div class="location-badge" id="hud-location-badge">—</div>
        <div class="title-badge" id="hud-title-badge" style="display:none"></div>
      </div>

      <div class="stats-panel" id="hud-stats"></div>

      <div class="hud-bottom">
        <div class="location-info">
          <div class="location-label">Localização Atual</div>
          <div class="location-name" id="hud-location">—</div>
          <div class="location-label" id="hud-region" style="margin-top:2px"></div>
        </div>
        <div class="quick-actions">
          <button class="btn-quick" data-panel="inventory">Inventário</button>
          <button class="btn-quick" data-panel="equipment">Equipamento</button>
          <button class="btn-quick" data-panel="skills">Skills</button>
          <button class="btn-quick" data-panel="party">Party</button>
          <button class="btn-quick" data-panel="titles">Títulos</button>
        </div>
      </div>

      <div id="panel-overlay" class="panel-overlay hidden"></div>
      <div id="item-modal" class="item-modal hidden"></div>
    `;
    document.body.appendChild(this.container);
    this.updateHUD();
  }

  updateHUD() {
    if (!this.container || !this.player) return;
    const p = this.player;
    const hpPercent = Math.max(0, Math.min(100, ((p.hp || 0) / (p.maxHp || 1)) * 100));
    const mpPercent = Math.max(0, Math.min(100, ((p.mp || 0) / (p.maxMp || 1)) * 100));
    const initial = (p.displayName || p.account || '?').charAt(0).toUpperCase();

    // Avatar
    const avatarEl = this.container.querySelector('#hud-avatar');
    if (avatarEl) {
      if (p.avatarUrl) {
        avatarEl.style.backgroundImage = `url(${p.avatarUrl})`;
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.textContent = '';
      } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.textContent = initial;
      }
    }

    this.setText('hud-name', p.displayName || p.account || '—');
    this.setText('hud-level', `Lv. ${p.level || 1}  ·  ${p.class || 'Aventureiro'}`);
    this.setText('hud-name-large', p.displayName || p.account || '—');
    this.setText('hud-location-badge', p.location || 'Cidade dos Iniciantes');
    this.setText('hud-location', p.location || 'Cidade dos Iniciantes');
    this.setText('hud-region', p.region || '');
    this.setText('hud-hp-text', `${p.hp ?? 0} / ${p.maxHp ?? 100}`);
    this.setText('hud-mp-text', `${p.mp ?? 0} / ${p.maxMp ?? 50}`);

    const hpFill = this.container.querySelector('#hud-hp-fill');
    const mpFill = this.container.querySelector('#hud-mp-fill');
    if (hpFill) hpFill.style.width = `${hpPercent}%`;
    if (mpFill) mpFill.style.width = `${mpPercent}%`;

    // Condição
    const cond = p.condition || 'normal';
    const condEl = this.container.querySelector('#hud-condition');
    if (condEl) {
      condEl.textContent = CONDITION_LABELS[cond] || 'Normal';
      condEl.className = `condition-badge cond-${cond}`;
    }

    // Zona
    const zone = p.zoneType || 'safe';
    const zoneEl = this.container.querySelector('#hud-zone');
    if (zoneEl) {
      zoneEl.textContent = zone === 'combat' ? 'Área de Combate' : 'Área Segura';
      zoneEl.className = `zone-badge zone-${zone}`;
    }

    // Guilda
    const guildEl = this.container.querySelector('#hud-guild');
    if (guildEl) {
      if (p.guild) {
        guildEl.style.display = 'block';
        guildEl.textContent = `「 ${p.guild} 」`;
      } else {
        guildEl.style.display = 'none';
      }
    }

    // Título
    const titleBadge = this.container.querySelector('#hud-title-badge');
    if (titleBadge) {
      if (p.activeTitle) {
        titleBadge.style.display = 'inline-block';
        titleBadge.textContent = p.activeTitle;
      } else {
        titleBadge.style.display = 'none';
      }
    }

    // Stats
    const statsEl = this.container.querySelector('#hud-stats');
    if (statsEl) {
      const s = p.stats || {};
      statsEl.innerHTML = `
        <div class="stats-title">Status</div>
        <div class="stat-row"><span>STR</span><span>${s.str ?? 10}</span></div>
        <div class="stat-row"><span>AGI</span><span>${s.agi ?? 10}</span></div>
        <div class="stat-row"><span>VIT</span><span>${s.vit ?? 10}</span></div>
        <div class="stat-row"><span>INT</span><span>${s.int ?? 10}</span></div>
        <div class="stat-row"><span>DEX</span><span>${s.dex ?? 10}</span></div>
        <div class="stat-row"><span>LUK</span><span>${s.luk ?? 10}</span></div>
      `;
    }

    // Actions
    const actions = this.container.querySelector('#hud-actions');
    if (actions) {
      actions.innerHTML = `
        ${p.isAdmin ? '<button class="btn-hud admin" id="btn-admin">Admin</button>' : ''}
        <button class="btn-hud" id="btn-menu">Menu</button>
        <button class="btn-hud logout" id="btn-logout">Sair</button>
      `;
      actions.querySelector('#btn-logout')?.addEventListener('click', () => this.handleLogout());
      actions.querySelector('#btn-menu')?.addEventListener('click', () => this.openPanel('menu'));
      actions.querySelector('#btn-admin')?.addEventListener('click', () => this.openPanel('admin'));
    }
  }

  setText(id, text) {
    const el = this.container?.querySelector(`#${id}`);
    if (el) el.textContent = text ?? '';
  }

  bindEvents() {
    this.container.querySelectorAll('.btn-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.click();
        this.openPanel(btn.dataset.panel);
      });
    });
    this.container.querySelector('#panel-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'panel-overlay') this.closePanel();
    });
  }

  async handleLogout() {
    Sound.click();
    const btn = this.container.querySelector('#btn-logout');
    if (btn) { btn.textContent = '...'; btn.disabled = true; }
    try {
      this.authService.stopPlayerListener();
      await this.onLogout();
    } catch (err) {
      if (btn) { btn.textContent = 'Sair'; btn.disabled = false; }
    }
  }

  openPanel(name) {
    if (this.currentPanel === name) return this.closePanel();
    this.currentPanel = name;
    Sound.panel();
    this.renderCurrentPanel();
  }

  closePanel() {
    this.currentPanel = null;
    const overlay = this.container?.querySelector('#panel-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay.innerHTML = ''; }
  }

  renderCurrentPanel() {
    const overlay = this.container.querySelector('#panel-overlay');
    if (!overlay || !this.currentPanel) return;
    overlay.classList.remove('hidden');
    const map = {
      menu: () => this.renderMenu(overlay),
      inventory: () => this.renderInventory(overlay),
      skills: () => this.renderSkills(overlay),
      party: () => this.renderParty(overlay),
      equipment: () => this.renderEquipment(overlay),
      titles: () => this.renderTitles(overlay),
      admin: () => this.renderAdmin(overlay)
    };
    map[this.currentPanel]?.();
  }

  renderMenu(overlay) {
    const p = this.player;
    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Menu</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body">
          <div class="menu-section">
            <h3>Personagem</h3>
            <p><strong>Nome:</strong> ${this.escape(p.displayName)}</p>
            <p><strong>Classe:</strong> ${this.escape(p.class || 'Aventureiro')}</p>
            <p><strong>Nível:</strong> ${p.level || 1}</p>
            <p><strong>Condição:</strong> ${CONDITION_LABELS[p.condition] || 'Normal'}</p>
            <p><strong>Zona:</strong> ${(p.zoneType === 'combat') ? 'Área de Combate' : 'Área Segura'}</p>
            ${p.guild ? `<p><strong>Guilda:</strong> ${this.escape(p.guild)}</p>` : ''}
            ${p.activeTitle ? `<p><strong>Título:</strong> ${this.escape(p.activeTitle)}</p>` : ''}
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
          ${p.appearance ? `<div class="menu-section"><h3>Aparência</h3><p style="line-height:1.45">${this.escape(p.appearance)}</p></div>` : ''}
          <div class="menu-section">
            <button class="btn-panel" id="menu-logout">Sair do Jogo</button>
          </div>
        </div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
    overlay.querySelector('#menu-logout').onclick = () => this.handleLogout();
  }

  rarityClass(r) {
    const v = (r || 'comum').toLowerCase();
    if (v === 'raro') return 'rarity-raro';
    if (v === 'unico' || v === 'único') return 'rarity-unico';
    return 'rarity-comum';
  }

  renderInventory(overlay) {
    const items = this.player.inventory || [];
    let html = items.length === 0
      ? `<div class="empty-inventory">Inventário vazio.<br>O mestre distribuirá itens nas cenas.</div>`
      : items.map(item => `
        <div class="inv-item ${this.rarityClass(item.rarity)}">
          <div>
            <div class="inv-item-name">
              ${this.escape(item.name || 'Item')}
              <span class="rarity-tag">${RARITY_LABELS[(item.rarity || 'comum').toLowerCase()] || 'Comum'}</span>
            </div>
            ${item.description ? `<div class="inv-desc">${this.escape(item.description)}</div>` : ''}
          </div>
          <div class="inv-item-qty">x${item.qty || 1}</div>
        </div>`).join('');

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Inventário</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body"><div class="inventory-grid">${html}</div></div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
  }

  renderSkills(overlay) {
    const skills = (this.player.skills && this.player.skills.length)
      ? this.player.skills
      : this.getDefaultSkills();
    const html = skills.map(s => `
      <div class="inv-item">
        <div>
          <div class="inv-item-name">${this.escape(s.name)}</div>
          <div class="inv-desc">${this.escape(s.description || '')}</div>
        </div>
        <div class="inv-item-qty">${this.escape(s.type || 'Ativa')}</div>
      </div>`).join('');

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Skills</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body">
          <div class="menu-section"><h3>Classe: ${this.escape(this.player.class || 'Aventureiro')}</h3></div>
          <div class="inventory-grid">${html}</div>
        </div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
  }

  getDefaultSkills() {
    const map = {
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
    return map[(this.player.classId || '').toLowerCase()] || [
      { name: 'Ataque Básico', description: 'Golpe simples.', type: 'Ativa' }
    ];
  }

  renderParty(overlay) {
    const party = this.player.party || [];
    let html = party.length === 0
      ? `<div class="empty-inventory">Você não está em nenhuma party.<br><br>Partys são formadas pelo mestre no Discord.</div>`
      : party.map(m => `
        <div class="inv-item">
          <div>
            <div class="inv-item-name">${this.escape(m.name)}</div>
            <div class="inv-desc">${this.escape(m.class || '')} · Lv.${m.level || '?'}</div>
          </div>
          <div class="inv-item-qty">${this.escape(m.role || 'Membro')}</div>
        </div>`).join('');

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Party</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body"><div class="inventory-grid">${html}</div></div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
  }

  renderEquipment(overlay) {
    const eq = this.player.equipment || {};
    const slots = [
      { key: 'cabeca', label: 'Cabeça' }, { key: 'peito', label: 'Peito' },
      { key: 'maos', label: 'Mãos' }, { key: 'pernas', label: 'Pernas' },
      { key: 'pes', label: 'Pés' }, { key: 'arma', label: 'Arma' },
      { key: 'acessorio1', label: 'Acessório 1' }, { key: 'acessorio2', label: 'Acessório 2' }
    ];
    const html = slots.map(s => {
      const item = eq[s.key];
      const rarity = item ? this.rarityClass(item.rarity) : '';
      return `
        <div class="inv-item ${rarity}">
          <div>
            <div class="inv-item-name">${s.label}</div>
            <div class="inv-desc">${item ? this.escape(item.name) : '— vazio —'}${item?.description ? ' · ' + this.escape(item.description) : ''}</div>
          </div>
          ${item?.rarity ? `<span class="rarity-tag">${RARITY_LABELS[(item.rarity || '').toLowerCase()] || ''}</span>` : ''}
        </div>`;
    }).join('');

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Equipamento</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body"><div class="inventory-grid">${html}</div></div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
  }

  renderTitles(overlay) {
    const titles = this.player.titles || [];
    const active = this.player.activeTitle || null;
    let html = titles.length === 0
      ? `<div class="empty-inventory">Nenhum título conquistado ainda.</div>`
      : titles.map(t => `
        <div class="inv-item ${active === t.name ? 'title-active' : ''}">
          <div>
            <div class="inv-item-name">${this.escape(t.name)}${active === t.name ? ' ★' : ''}</div>
            <div class="inv-desc">${this.escape(t.description || '')}${t.bonus ? ' · Bônus: ' + this.escape(t.bonus) : ''}</div>
          </div>
        </div>`).join('');

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Títulos</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body">
          ${active ? `<div class="menu-section"><h3>Título Ativo</h3><p>${this.escape(active)}</p></div>` : ''}
          <div class="inventory-grid">${html}</div>
        </div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
  }

  async renderAdmin(overlay) {
    overlay.innerHTML = `
      <div class="side-panel admin-panel">
        <div class="panel-header"><h2>Painel Admin</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body"><p style="color:#94a3b8;font-size:0.85rem">Carregando...</p></div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
    try {
      const players = await this.authService.getAllPlayers();
      this.renderAdminList(overlay, players);
    } catch {
      overlay.querySelector('.panel-body').innerHTML = `<p style="color:#fca5a5">Erro ao carregar jogadores.</p>`;
    }
  }

  renderAdminList(overlay, players) {
    const body = overlay.querySelector('.panel-body');
    body.innerHTML = `
      <div class="admin-section">
        <h3>Jogadores (${players.length})</h3>
        <div class="admin-player-list">
          ${players.map(p => `
            <div class="admin-player">
              <div>
                <strong>${this.escape(p.displayName || p.account)}</strong>
                <span style="opacity:0.6;font-size:0.8rem"> · Lv.${p.level || 1}</span>
              </div>
              <button class="btn-tiny edit-player" data-uid="${p.uid}">Editar</button>
            </div>`).join('')}
        </div>
      </div>
      <div id="admin-edit-area"></div>`;
    body.querySelectorAll('.edit-player').forEach(btn => {
      btn.onclick = () => {
        Sound.click();
        this.renderAdminEdit(players.find(p => p.uid === btn.dataset.uid));
      };
    });
  }

  renderAdminEdit(player) {
    const area = this.container.querySelector('#admin-edit-area');
    if (!area || !player) return;

    area.innerHTML = `
      <div class="admin-section admin-edit-block">
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
          <label>Guilda <input type="text" id="adm-guild" value="${this.escape(player.guild || '')}" placeholder="Nome da guilda" /></label>
          <label>Avatar URL <input type="text" id="adm-avatar" value="${this.escape(player.avatarUrl || '')}" placeholder="https://..." /></label>
          <label>Zona
            <select id="adm-zone">
              <option value="safe" ${(player.zoneType || 'safe') === 'safe' ? 'selected' : ''}>Área Segura</option>
              <option value="combat" ${player.zoneType === 'combat' ? 'selected' : ''}>Área de Combate</option>
            </select>
          </label>
          <label>Condição
            <select id="adm-condition">
              <option value="normal" ${(player.condition || 'normal') === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="ferido" ${player.condition === 'ferido' ? 'selected' : ''}>Ferido</option>
              <option value="exausto" ${player.condition === 'exausto' ? 'selected' : ''}>Exausto</option>
              <option value="critico" ${player.condition === 'critico' ? 'selected' : ''}>Crítico</option>
            </select>
          </label>
          <label>STR <input type="number" id="adm-str" value="${player.stats?.str ?? 10}" /></label>
          <label>AGI <input type="number" id="adm-agi" value="${player.stats?.agi ?? 10}" /></label>
          <label>VIT <input type="number" id="adm-vit" value="${player.stats?.vit ?? 10}" /></label>
          <label>INT <input type="number" id="adm-int" value="${player.stats?.int ?? 10}" /></label>
          <label>DEX <input type="number" id="adm-dex" value="${player.stats?.dex ?? 10}" /></label>
          <label>LUK <input type="number" id="adm-luk" value="${player.stats?.luk ?? 10}" /></label>
        </div>

        <label class="full-label">Aparência
          <textarea id="adm-appearance" rows="2" placeholder="Descrição visual do personagem...">${this.escape(player.appearance || '')}</textarea>
        </label>

        <div class="admin-tabs">
          <button class="adm-tab active" data-tab="inv">Inventário</button>
          <button class="adm-tab" data-tab="eq">Equipamento</button>
          <button class="adm-tab" data-tab="sk">Skills</button>
          <button class="adm-tab" data-tab="pt">Party</button>
          <button class="adm-tab" data-tab="ti">Títulos</button>
        </div>
        <div id="adm-tab-content"></div>

        <button class="btn-panel" id="adm-save">Salvar Alterações</button>
        <div id="adm-msg"></div>
      </div>`;

    this._editState = {
      inventory: [...(player.inventory || [])],
      skills: [...(player.skills || [])],
      party: [...(player.party || [])],
      titles: [...(player.titles || [])],
      equipment: { ...(player.equipment || {}) },
      activeTitle: player.activeTitle || null
    };

    const showTab = (tab) => {
      area.querySelectorAll('.adm-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      const content = area.querySelector('#adm-tab-content');
      if (tab === 'inv') this.renderAdminListEditor(content, 'inventory', ['name', 'qty', 'rarity', 'description']);
      if (tab === 'sk') this.renderAdminListEditor(content, 'skills', ['name', 'type', 'description']);
      if (tab === 'pt') this.renderAdminListEditor(content, 'party', ['name', 'class', 'level', 'role']);
      if (tab === 'ti') this.renderAdminListEditor(content, 'titles', ['name', 'bonus', 'description']);
      if (tab === 'eq') this.renderAdminEquipmentEditor(content);
    };

    area.querySelectorAll('.adm-tab').forEach(btn => {
      btn.onclick = () => { Sound.click(); showTab(btn.dataset.tab); };
    });
    showTab('inv');

    area.querySelector('#adm-save').onclick = async () => {
      const msg = area.querySelector('#adm-msg');
      msg.textContent = 'Salvando...';
      msg.className = 'adm-msg loading';

      const data = {
        displayName: area.querySelector('#adm-name').value.trim(),
        level: Number(area.querySelector('#adm-level').value),
        hp: Number(area.querySelector('#adm-hp').value),
        maxHp: Number(area.querySelector('#adm-maxhp').value),
        mp: Number(area.querySelector('#adm-mp').value),
        maxMp: Number(area.querySelector('#adm-maxmp').value),
        location: area.querySelector('#adm-location').value.trim(),
        region: area.querySelector('#adm-region').value.trim(),
        guild: area.querySelector('#adm-guild').value.trim(),
        avatarUrl: area.querySelector('#adm-avatar').value.trim(),
        zoneType: area.querySelector('#adm-zone').value,
        condition: area.querySelector('#adm-condition').value,
        appearance: area.querySelector('#adm-appearance').value.trim(),
        stats: {
          str: Number(area.querySelector('#adm-str').value),
          agi: Number(area.querySelector('#adm-agi').value),
          vit: Number(area.querySelector('#adm-vit').value),
          int: Number(area.querySelector('#adm-int').value),
          dex: Number(area.querySelector('#adm-dex').value),
          luk: Number(area.querySelector('#adm-luk').value)
        },
        inventory: this._editState.inventory,
        skills: this._editState.skills,
        party: this._editState.party,
        titles: this._editState.titles,
        equipment: this._editState.equipment,
        activeTitle: this._editState.activeTitle
      };

      try {
        await this.authService.updatePlayer(player.uid, data);
        Sound.success();
        msg.textContent = 'Salvo com sucesso!';
        msg.className = 'adm-msg success';
      } catch (err) {
        Sound.error();
        msg.textContent = 'Erro: ' + (err.message || 'falha');
        msg.className = 'adm-msg error';
      }
    };
  }

  renderAdminListEditor(container, key, fields) {
    const list = this._editState[key] || [];
    container.innerHTML = `
      <div class="adm-list">
        ${list.map((item, idx) => `
          <div class="adm-list-item ${item.rarity ? this.rarityClass(item.rarity) : ''}">
            <span>${this.escape(item.name || '—')}${item.rarity ? ` · ${RARITY_LABELS[item.rarity] || item.rarity}` : ''}</span>
            <div class="adm-list-actions">
              <button class="btn-tiny edit-item" data-idx="${idx}">Editar</button>
              <button class="btn-tiny danger del-item" data-idx="${idx}">✕</button>
            </div>
          </div>`).join('') || '<p class="adm-empty">Nenhum item ainda.</p>'}
      </div>
      <button class="btn-panel btn-add" id="adm-add-item">+ Adicionar</button>
    `;

    container.querySelectorAll('.edit-item').forEach(btn => {
      btn.onclick = () => { Sound.click(); this.openItemModal(key, fields, Number(btn.dataset.idx)); };
    });
    container.querySelectorAll('.del-item').forEach(btn => {
      btn.onclick = () => {
        Sound.click();
        this._editState[key].splice(Number(btn.dataset.idx), 1);
        this.renderAdminListEditor(container, key, fields);
      };
    });
    container.querySelector('#adm-add-item').onclick = () => {
      Sound.click();
      this.openItemModal(key, fields, -1);
    };
  }

  renderAdminEquipmentEditor(container) {
    const slots = [
      { key: 'cabeca', label: 'Cabeça' }, { key: 'peito', label: 'Peito' },
      { key: 'maos', label: 'Mãos' }, { key: 'pernas', label: 'Pernas' },
      { key: 'pes', label: 'Pés' }, { key: 'arma', label: 'Arma' },
      { key: 'acessorio1', label: 'Acessório 1' }, { key: 'acessorio2', label: 'Acessório 2' }
    ];
    const eq = this._editState.equipment || {};
    container.innerHTML = slots.map(s => {
      const item = eq[s.key];
      return `
        <div class="adm-list-item">
          <span><strong>${s.label}:</strong> ${item ? this.escape(item.name) : '— vazio —'}</span>
          <button class="btn-tiny edit-eq" data-slot="${s.key}">${item ? 'Editar' : 'Definir'}</button>
        </div>`;
    }).join('');
    container.querySelectorAll('.edit-eq').forEach(btn => {
      btn.onclick = () => {
        Sound.click();
        this.openItemModal('equipment', ['name', 'rarity', 'description'], btn.dataset.slot);
      };
    });
  }

  openItemModal(key, fields, indexOrSlot) {
    const modal = this.container.querySelector('#item-modal');
    const isNew = indexOrSlot === -1;
    const isEquip = key === 'equipment';
    let current = {};
    if (isEquip) current = this._editState.equipment?.[indexOrSlot] || {};
    else if (!isNew) current = this._editState[key][indexOrSlot] || {};

    const labels = {
      name: 'Nome',
      qty: 'Quantidade',
      description: 'Descrição',
      type: 'Tipo',
      class: 'Classe',
      level: 'Nível',
      role: 'Função',
      bonus: 'Bônus / Vantagem',
      rarity: 'Raridade'
    };

    const titles = {
      inventory: 'Item do Inventário',
      skills: 'Skill',
      party: 'Membro da Party',
      titles: 'Título',
      equipment: 'Equipamento'
    };

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>${isNew ? 'Adicionar' : 'Editar'} ${titles[key] || ''}</h3>
          <button class="btn-close" id="modal-x">✕</button>
        </div>
        <div class="modal-body">
          ${fields.map(f => {
            if (f === 'rarity') {
              const val = (current.rarity || 'comum').toLowerCase();
              return `
                <div class="field">
                  <label>Raridade</label>
                  <select id="modal-rarity">
                    <option value="comum" ${val === 'comum' ? 'selected' : ''}>Comum</option>
                    <option value="raro" ${val === 'raro' ? 'selected' : ''}>Raro</option>
                    <option value="unico" ${val === 'unico' || val === 'único' ? 'selected' : ''}>Único</option>
                  </select>
                </div>`;
            }
            if (f === 'description' || f === 'bonus') {
              return `
                <div class="field">
                  <label>${labels[f] || f}</label>
                  <textarea id="modal-${f}" rows="3" placeholder="${labels[f] || f}...">${this.escape(current[f] || '')}</textarea>
                </div>`;
            }
            return `
              <div class="field">
                <label>${labels[f] || f}</label>
                <input type="${f === 'qty' || f === 'level' ? 'number' : 'text'}"
                  id="modal-${f}"
                  value="${this.escape(String(current[f] ?? (f === 'qty' ? 1 : '')))}"
                  placeholder="${labels[f] || f}" />
              </div>`;
          }).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
          <button class="btn-modal-save" id="modal-save">Salvar</button>
        </div>
      </div>`;

    const close = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    modal.querySelector('#modal-cancel').onclick = close;
    modal.querySelector('#modal-x').onclick = close;

    modal.querySelector('#modal-save').onclick = () => {
      const obj = {};
      fields.forEach(f => {
        const el = modal.querySelector(`#modal-${f}`);
        if (!el) return;
        obj[f] = (f === 'qty' || f === 'level') ? Number(el.value) || 0 : el.value.trim();
      });

      if (isEquip) {
        this._editState.equipment = this._editState.equipment || {};
        this._editState.equipment[indexOrSlot] = obj.name ? obj : null;
      } else if (isNew) {
        this._editState[key].push(obj);
      } else {
        this._editState[key][indexOrSlot] = obj;
      }

      Sound.success();
      close();

      const content = this.container.querySelector('#adm-tab-content');
      if (!content) return;
      if (key === 'inventory') this.renderAdminListEditor(content, 'inventory', ['name', 'qty', 'rarity', 'description']);
      if (key === 'skills') this.renderAdminListEditor(content, 'skills', ['name', 'type', 'description']);
      if (key === 'party') this.renderAdminListEditor(content, 'party', ['name', 'class', 'level', 'role']);
      if (key === 'titles') this.renderAdminListEditor(content, 'titles', ['name', 'bonus', 'description']);
      if (key === 'equipment') this.renderAdminEquipmentEditor(content);
    };
  }

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  hide() {
    this.authService.stopPlayerListener();
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => this.container?.remove(), 800);
    }
  }
}
