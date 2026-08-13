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
      <div class="world-bg" aria-hidden="true">
        <video
          class="world-bg-video"
          src="/assets/world/cidade-iniciantes.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>
        <div class="world-bg-overlay"></div>
      </div>

      <div class="hud-top">
        <div class="char-panel" id="char-panel">
          <div class="cp-corner tl"></div>
          <div class="cp-corner tr"></div>
          <div class="cp-corner bl"></div>
          <div class="cp-corner br"></div>
          <div class="cp-main">
            <div class="cp-avatar" id="hud-avatar">?</div>
            <div class="cp-info">
              <div class="cp-name" id="hud-name">—</div>
              <div class="cp-class" id="hud-level">LV. 01 · —</div>
              <div class="cp-bars">
                <div class="cp-bar-row">
                  <span class="cp-bar-label">HP</span>
                  <div class="cp-bar-track"><div class="cp-bar-fill hp" id="hud-hp-fill" style="width:100%"></div></div>
                  <span class="cp-bar-val" id="hud-hp-text">100 / 100</span>
                </div>
                <div class="cp-bar-row">
                  <span class="cp-bar-label">MP</span>
                  <div class="cp-bar-track"><div class="cp-bar-fill mp" id="hud-mp-fill" style="width:100%"></div></div>
                  <span class="cp-bar-val" id="hud-mp-text">50 / 50</span>
                </div>
              </div>
              <div class="cp-badges">
                <span class="condition-badge" id="hud-condition">Normal</span>
                <span class="zone-badge" id="hud-zone">Área Segura</span>
              </div>
            </div>
          </div>
          <div class="cp-divider"></div>
          <div class="cp-attrs-title">Atributos</div>
          <div class="cp-attrs" id="hud-stats"></div>
        </div>

        <div class="hud-compass" aria-hidden="true">
          <div class="hc-line"></div>
          <div class="hc-tick"></div>
          <div class="hc-n">N</div>
          <div class="hc-tick"></div>
          <div class="hc-line"></div>
        </div>

        <div class="hud-actions" id="hud-actions"></div>
      </div>

      <div class="world-center" id="world-center">
        <div class="wc-ring"></div>
        <div class="wc-conn">— World Connection Established —</div>
        <div class="wc-welcome">Bem-vindo ao GRPG</div>
        <div class="wc-guild" id="hud-guild" style="display:none"></div>
        <div class="wc-name" id="hud-name-large">—</div>
        <div class="wc-diamond"></div>
        <div class="wc-loc" id="hud-location-badge">—</div>
        <div class="wc-title" id="hud-title-badge" style="display:none"></div>
      </div>

      <div class="hud-location">
        <div class="cp-corner tl"></div>
        <div class="cp-corner br"></div>
        <div class="hl-label">Localização Atual // 01</div>
        <div class="hl-name" id="hud-location">—</div>
        <div class="hl-region" id="hud-region"></div>
        <div class="hl-line"></div>
      </div>

      <div class="hud-dock">
        <button class="dock-btn" data-panel="inventory" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h16v12H4z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>
          Inventário
        </button>
        <button class="dock-btn" data-panel="equipment" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l3 5h-6l3-5z"/><path d="M7 8l-2 13h14L17 8"/></svg>
          Equipamento
        </button>
        <button class="dock-btn" data-panel="skills" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/></svg>
          Skills
        </button>
        <button class="dock-btn" data-panel="party" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M14 20c0-2 1.5-3.5 4-3.5s3 1 3 3.5"/></svg>
          Party
        </button>
        <button class="dock-btn" data-panel="titles" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M8 14l-2 8 6-3 6 3-2-8"/></svg>
          Títulos
        </button>
      </div>

      <div id="panel-overlay" class="panel-overlay hidden"></div>
      <div id="item-modal" class="item-modal hidden"></div>
    `;
    document.body.appendChild(this.container);
    this.setupWorldBackground();
    this.updateHUD();
    this.startWelcomeSequence();
  }

  setupWorldBackground() {
    const video = this.container.querySelector('.world-bg-video');
    if (!video) return;

    const markReady = () => {
      video.classList.add('is-ready');
    };

    if (video.readyState >= 2) {
      markReady();
    } else {
      video.addEventListener('loadeddata', markReady, { once: true });
      video.addEventListener('canplay', markReady, { once: true });
    }

    // Garante autoplay em navegadores mais restritivos
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    tryPlay();
    video.addEventListener('canplay', tryPlay, { once: true });
  }

  updateHUD() {
    if (!this.container || !this.player) return;
    const p = this.player;
    const hpPercent = Math.max(0, Math.min(100, ((p.hp || 0) / (p.maxHp || 1)) * 100));
    const mpPercent = Math.max(0, Math.min(100, ((p.mp || 0) / (p.maxMp || 1)) * 100));
    const initial = (p.displayName || p.account || '?').charAt(0).toUpperCase();
    const level = String(p.level || 1).padStart(2, '0');

    const avatarEl = this.container.querySelector('#hud-avatar');
    if (avatarEl) {
      if (p.avatarUrl) {
        avatarEl.style.backgroundImage = `url(${p.avatarUrl})`;
        avatarEl.textContent = '';
      } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.textContent = initial;
      }
    }

    this.setText('hud-name', p.displayName || p.account || '—');
    {
      const racePart = p.race ? `${String(p.race).toUpperCase()} · ` : '';
      this.setText('hud-level', `LV. ${level} · ${racePart}${String(p.class || 'Aventureiro').toUpperCase()}`);
    }
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

    const cond = p.condition || 'normal';
    const condEl = this.container.querySelector('#hud-condition');
    if (condEl) {
      condEl.textContent = CONDITION_LABELS[cond] || 'Normal';
      condEl.className = `condition-badge cond-${cond}`;
    }

    const zone = p.zoneType || 'safe';
    const zoneEl = this.container.querySelector('#hud-zone');
    if (zoneEl) {
      zoneEl.textContent = zone === 'combat' ? 'Área de Combate' : 'Área Segura';
      zoneEl.className = `zone-badge zone-${zone}`;
    }

    const guildEl = this.container.querySelector('#hud-guild');
    if (guildEl) {
      if (p.guild || p.guildTag) {
        guildEl.style.display = 'block';
        const tag = p.guildTag ? `[${p.guildTag}]` : '';
        const name = p.guild || '';
        guildEl.textContent = tag && name ? `「 ${tag} ${name} 」` : `「 ${tag || name} 」`;
      } else {
        guildEl.style.display = 'none';
      }
    }

    const titleBadge = this.container.querySelector('#hud-title-badge');
    if (titleBadge) {
      if (p.activeTitle) {
        titleBadge.style.display = 'inline-block';
        titleBadge.textContent = p.activeTitle;
      } else {
        titleBadge.style.display = 'none';
      }
    }

    const statsEl = this.container.querySelector('#hud-stats');
    if (statsEl) {
      const s = p.stats || {};
      const fmt = (n) => String(n ?? 10).padStart(2, '0');
      statsEl.innerHTML = `
        <div>STR <span>${fmt(s.str)}</span></div>
        <div>INT <span>${fmt(s.int)}</span></div>
        <div>AGI <span>${fmt(s.agi)}</span></div>
        <div>DEX <span>${fmt(s.dex)}</span></div>
        <div>VIT <span>${fmt(s.vit)}</span></div>
        <div>LUK <span>${fmt(s.luk)}</span></div>
      `;
    }

    const actions = this.container.querySelector('#hud-actions');
    if (actions) {
      actions.innerHTML = `
        ${p.isAdmin ? `<button class="btn-hud admin" id="btn-admin" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>
          Admin
        </button>` : ''}
        <button class="btn-hud" id="btn-menu" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>
          Menu
        </button>
        <button class="btn-hud logout" id="btn-logout" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M16 12H8M13 8l4 4-4 4"/></svg>
          Disconnect
        </button>
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

  startWelcomeSequence() {
    const center = this.container?.querySelector('#world-center');
    if (!center) return;
    // Após ~3.2s a mensagem central some e libera o espaço
    setTimeout(() => {
      center.classList.add('fade-away');
      setTimeout(() => {
        center.style.display = 'none';
      }, 950);
    }, 3200);
  }

  bindEvents() {
    this.container.querySelectorAll('.dock-btn').forEach(btn => {
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
      guild: () => this.renderGuild(overlay),
      admin: () => this.renderAdmin(overlay)
    };
    map[this.currentPanel]?.();
  }

  async renderGuild(overlay) {
    const p = this.player;
    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Guilda</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body" id="guild-panel-body">
          <p style="color:#94a3b8;font-size:0.85rem">Carregando...</p>
        </div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
    const body = overlay.querySelector('#guild-panel-body');

    try {
      if (p.guildId) {
        const guild = await this.authService.getGuild(p.guildId);
        this.renderGuildMemberView(body, guild, p);
      } else {
        await this.renderGuildBrowseView(body, p);
      }
    } catch (err) {
      body.innerHTML = `<p style="color:#fca5a5">${this.escape(err.message || 'Erro ao carregar guildas.')}</p>`;
    }
  }

  renderGuildMemberView(body, guild, p) {
    if (!guild) {
      body.innerHTML = `
        <div class="menu-section">
          <p style="color:#fca5a5">Guilda não encontrada nos registros.</p>
          <button class="btn-panel" id="guild-clear-local">Limpar vínculo local</button>
        </div>`;
      body.querySelector('#guild-clear-local').onclick = async () => {
        try {
          await this.authService.updatePlayer(this.uid, {
            guild: '', guildId: '', guildTag: '', guildRole: ''
          });
          Sound.success();
          this.renderGuild(this.container.querySelector('#panel-overlay'));
        } catch (e) {
          Sound.error();
        }
      };
      return;
    }

    const members = Array.isArray(guild.members) ? guild.members : [];
    const statusLabel =
      guild.status === 'active' ? 'Ativa' :
      guild.status === 'pending' ? 'Aguardando aprovação' :
      guild.status === 'rejected' ? 'Recusada' : guild.status;

    body.innerHTML = `
      <div class="menu-section">
        <h3>${this.escape(guild.name)} <span style="opacity:0.7">[${this.escape(guild.tag || '')}]</span></h3>
        <p><strong>Status:</strong> ${this.escape(statusLabel)}</p>
        <p><strong>Líder:</strong> ${this.escape(guild.leaderName || '—')}</p>
        <p><strong>Seu cargo:</strong> ${this.escape(p.guildRole || 'member')}</p>
        ${guild.description ? `<p style="margin-top:8px;line-height:1.45;color:#94a3b8">${this.escape(guild.description)}</p>` : ''}
      </div>
      <div class="menu-section">
        <h3>Membros (${members.length})</h3>
        <div class="guild-member-list">
          ${members.map((m) => `
            <div class="guild-member-row">
              <span>${this.escape(m.name || '—')}${m.fictional ? ' <em style="opacity:0.55">(fictício)</em>' : ''}</span>
              <span class="guild-role-tag">${this.escape(m.role || 'member')}</span>
            </div>`).join('') || '<p class="adm-empty">Nenhum membro.</p>'}
        </div>
      </div>
      <div class="menu-section">
        <button class="btn-panel danger-outline" id="guild-leave">Sair da Guilda</button>
        <div id="guild-msg" class="creation-error" style="margin-top:8px"></div>
      </div>
      <button class="btn-panel" id="guild-back-menu" style="margin-top:8px">← Voltar ao Menu</button>
    `;

    body.querySelector('#guild-back-menu').onclick = () => {
      Sound.click();
      this.openPanel('menu');
    };
    body.querySelector('#guild-leave').onclick = async () => {
      const msg = body.querySelector('#guild-msg');
      msg.textContent = 'Saindo...';
      try {
        await this.authService.leaveGuild(this.uid, this.player);
        Sound.success();
        this.renderGuild(this.container.querySelector('#panel-overlay'));
      } catch (err) {
        Sound.error();
        msg.textContent = err.message || 'Não foi possível sair.';
      }
    };
  }

  async renderGuildBrowseView(body, p) {
    const active = await this.authService.getActiveGuilds();
    const all = await this.authService.getAllGuilds();
    const myPending = all.find(
      (g) => g.status === 'pending' && Array.isArray(g.members) && g.members.some((m) => m.uid === this.uid)
    );
    const myRequests = all.filter(
      (g) => Array.isArray(g.joinRequests) && g.joinRequests.some((r) => r.uid === this.uid)
    );

    body.innerHTML = `
      <div class="menu-section">
        <h3>Criar Guilda</h3>
        <p style="font-size:0.8rem;color:#64748b;margin-bottom:10px">
          A criação fica pendente até um Admin aprovar.
        </p>
        <div class="guild-form">
          <label>Nome <input type="text" id="gf-name" maxlength="24" placeholder="Nome da guilda" /></label>
          <label>Sigla <input type="text" id="gf-tag" maxlength="5" placeholder="Ex: KRT" /></label>
          <label>Descrição <textarea id="gf-desc" rows="2" maxlength="200" placeholder="Breve descrição..."></textarea></label>
          <button class="btn-panel" id="gf-create">Solicitar criação</button>
          <div id="gf-msg" class="creation-error" style="margin-top:6px"></div>
        </div>
      </div>

      ${myPending ? `
      <div class="menu-section">
        <h3>Sua solicitação</h3>
        <p><strong>${this.escape(myPending.name)}</strong> [${this.escape(myPending.tag || '')}] — aguardando aprovação.</p>
      </div>` : ''}

      ${myRequests.length ? `
      <div class="menu-section">
        <h3>Pedidos enviados</h3>
        ${myRequests.map((g) => `
          <div class="guild-member-row">
            <span>${this.escape(g.name)} [${this.escape(g.tag || '')}]</span>
            <button class="btn-tiny" data-cancel-join="${g.id}">Cancelar</button>
          </div>`).join('')}
      </div>` : ''}

      <div class="menu-section">
        <h3>Guildas ativas (${active.length})</h3>
        ${active.length === 0
          ? '<p class="adm-empty">Nenhuma guilda ativa no momento.</p>'
          : active.map((g) => `
            <div class="guild-browse-card">
              <div>
                <strong>${this.escape(g.name)}</strong>
                <span style="opacity:0.65"> [${this.escape(g.tag || '')}]</span>
                <div style="font-size:0.75rem;color:#64748b;margin-top:2px">
                  Líder: ${this.escape(g.leaderName || '—')} · ${(Array.isArray(g.members) ? g.members.length : 0)} membros
                </div>
              </div>
              <button class="btn-tiny" data-join="${g.id}">Entrar</button>
            </div>`).join('')}
      </div>
      <button class="btn-panel" id="guild-back-menu">← Voltar ao Menu</button>
    `;

    body.querySelector('#guild-back-menu').onclick = () => {
      Sound.click();
      this.openPanel('menu');
    };

    body.querySelector('#gf-create').onclick = async () => {
      const msg = body.querySelector('#gf-msg');
      msg.textContent = 'Enviando...';
      try {
        await this.authService.createGuild(this.uid, this.player, {
          name: body.querySelector('#gf-name').value,
          tag: body.querySelector('#gf-tag').value,
          description: body.querySelector('#gf-desc').value
        });
        Sound.success();
        this.renderGuild(this.container.querySelector('#panel-overlay'));
      } catch (err) {
        Sound.error();
        msg.textContent = err.message || 'Falha ao criar.';
      }
    };

    body.querySelectorAll('[data-join]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await this.authService.requestJoinGuild(this.uid, this.player, btn.dataset.join);
          Sound.success();
          this.renderGuild(this.container.querySelector('#panel-overlay'));
        } catch (err) {
          Sound.error();
          alert(err.message || 'Não foi possível solicitar entrada.');
        }
      };
    });

    body.querySelectorAll('[data-cancel-join]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await this.authService.cancelJoinRequest(this.uid, btn.dataset.cancelJoin);
          Sound.click();
          this.renderGuild(this.container.querySelector('#panel-overlay'));
        } catch {
          Sound.error();
        }
      };
    });
  }

  renderMenu(overlay) {
    const p = this.player;
    const guildLine = (p.guild || p.guildTag)
      ? `<p><strong>Guilda:</strong> ${p.guildTag ? `[${this.escape(p.guildTag)}] ` : ''}${this.escape(p.guild || '')}${p.guildRole ? ` · ${this.escape(p.guildRole)}` : ''}</p>`
      : '<p><strong>Guilda:</strong> —</p>';

    overlay.innerHTML = `
      <div class="side-panel">
        <div class="panel-header"><h2>Menu</h2><button class="btn-close" id="close-p">✕</button></div>
        <div class="panel-body">
          <div class="menu-section">
            <h3>Personagem</h3>
            <p><strong>Nome:</strong> ${this.escape(p.displayName)}</p>
            ${p.race ? `<p><strong>Raça:</strong> ${this.escape(p.race)}</p>` : ''}
            <p><strong>Classe:</strong> ${this.escape(p.class || 'Aventureiro')}</p>
            <p><strong>Nível:</strong> ${p.level || 1}</p>
            <p><strong>Condição:</strong> ${CONDITION_LABELS[p.condition] || 'Normal'}</p>
            <p><strong>Zona:</strong> ${(p.zoneType === 'combat') ? 'Área de Combate' : 'Área Segura'}</p>
            ${guildLine}
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
            <h3>Guilda</h3>
            <button class="btn-panel" id="menu-guild">Gerenciar Guilda</button>
          </div>
          <div class="menu-section">
            <button class="btn-panel" id="menu-logout">Sair do Jogo</button>
          </div>
        </div>
      </div>`;
    overlay.querySelector('#close-p').onclick = () => this.closePanel();
    overlay.querySelector('#menu-logout').onclick = () => this.handleLogout();
    overlay.querySelector('#menu-guild').onclick = () => {
      Sound.click();
      this.openPanel('guild');
    };
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
      let players = [];
      let guilds = [];
      let guildsError = null;

      try {
        players = await this.authService.getAllPlayers();
      } catch (err) {
        overlay.querySelector('.panel-body').innerHTML =
          `<p style="color:#fca5a5">Erro ao carregar jogadores: ${this.escape(err.message || String(err))}</p>
           <p style="color:#64748b;font-size:0.8rem;margin-top:8px">Verifique as regras do Firebase em <code>players</code>.</p>`;
        return;
      }

      try {
        guilds = await this.authService.getAllGuilds();
      } catch (err) {
        guildsError = err;
        guilds = [];
      }

      this.renderAdminList(overlay, players, guilds, guildsError);
    } catch (err) {
      overlay.querySelector('.panel-body').innerHTML =
        `<p style="color:#fca5a5">Erro ao carregar dados: ${this.escape(err.message || String(err))}</p>`;
    }
  }

  renderAdminList(overlay, players, guilds = [], guildsError = null) {
    const body = overlay.querySelector('.panel-body');
    const pending = guilds.filter((g) => g.status === 'pending');
    const active = guilds.filter((g) => g.status === 'active');

    body.innerHTML = `
      ${guildsError ? `
      <div class="admin-section">
        <p style="color:#fca5a5;font-size:0.85rem">Guildas indisponíveis: ${this.escape(guildsError.message || String(guildsError))}</p>
        <p style="color:#64748b;font-size:0.78rem;margin-top:4px">Atualize as regras do Firebase para liberar o nó <code>guilds</code>.</p>
      </div>` : ''}
      <div class="admin-section">
        <h3>Guildas pendentes (${pending.length})</h3>
        ${pending.length === 0
          ? '<p class="adm-empty">Nenhuma solicitação pendente.</p>'
          : pending.map((g) => `
            <div class="admin-player">
              <div>
                <strong>${this.escape(g.name)}</strong>
                <span style="opacity:0.6;font-size:0.8rem"> [${this.escape(g.tag || '')}] · ${this.escape(g.leaderName || '')}</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn-tiny" data-approve-guild="${g.id}">Aprovar</button>
                <button class="btn-tiny danger" data-reject-guild="${g.id}">Recusar</button>
                <button class="btn-tiny" data-edit-guild="${g.id}">Editar</button>
              </div>
            </div>`).join('')}
      </div>
      <div class="admin-section">
        <h3>Guildas ativas (${active.length})</h3>
        ${active.length === 0
          ? '<p class="adm-empty">Nenhuma guilda ativa.</p>'
          : active.map((g) => `
            <div class="admin-player">
              <div>
                <strong>${this.escape(g.name)}</strong>
                <span style="opacity:0.6;font-size:0.8rem"> [${this.escape(g.tag || '')}] · ${(Array.isArray(g.members) ? g.members.length : 0)} membros</span>
              </div>
              <button class="btn-tiny" data-edit-guild="${g.id}">Editar</button>
            </div>`).join('')}
      </div>
      <div class="admin-section">
        <h3>Jogadores (${players.length})</h3>
        <div class="admin-player-list">
          ${players.map(p => `
            <div class="admin-player">
              <div>
                <strong>${this.escape(p.displayName || p.account)}</strong>
                <span style="opacity:0.6;font-size:0.8rem"> · Lv.${p.level || 1}${p.guildTag ? ` · [${this.escape(p.guildTag)}]` : ''}</span>
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

    body.querySelectorAll('[data-approve-guild]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await this.authService.approveGuild(btn.dataset.approveGuild, this.uid);
          Sound.success();
          this.renderAdmin(overlay);
        } catch (err) {
          Sound.error();
          alert(err.message || 'Erro ao aprovar');
        }
      };
    });

    body.querySelectorAll('[data-reject-guild]').forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm('Recusar e limpar vínculos desta guilda?')) return;
        try {
          await this.authService.rejectGuild(btn.dataset.rejectGuild);
          Sound.success();
          this.renderAdmin(overlay);
        } catch (err) {
          Sound.error();
          alert(err.message || 'Erro ao recusar');
        }
      };
    });

    body.querySelectorAll('[data-edit-guild]').forEach((btn) => {
      btn.onclick = async () => {
        Sound.click();
        const guild = guilds.find((g) => g.id === btn.dataset.editGuild)
          || await this.authService.getGuild(btn.dataset.editGuild);
        this.renderAdminGuildEdit(guild, overlay);
      };
    });
  }

  renderAdminGuildEdit(guild, overlay) {
    const area = this.container.querySelector('#admin-edit-area');
    if (!area || !guild) return;

    const members = Array.isArray(guild.members) ? guild.members : [];
    const requests = Array.isArray(guild.joinRequests) ? guild.joinRequests : [];

    area.innerHTML = `
      <div class="admin-section admin-edit-block">
        <h3>Guilda: ${this.escape(guild.name)}</h3>
        <div class="admin-form">
          <label>Nome <input type="text" id="ag-name" value="${this.escape(guild.name || '')}" /></label>
          <label>Sigla <input type="text" id="ag-tag" maxlength="5" value="${this.escape(guild.tag || '')}" /></label>
          <label>Status
            <select id="ag-status">
              <option value="pending" ${guild.status === 'pending' ? 'selected' : ''}>Pendente</option>
              <option value="active" ${guild.status === 'active' ? 'selected' : ''}>Ativa</option>
              <option value="rejected" ${guild.status === 'rejected' ? 'selected' : ''}>Recusada</option>
            </select>
          </label>
        </div>
        <label class="full-label">Descrição
          <textarea id="ag-desc" rows="2">${this.escape(guild.description || '')}</textarea>
        </label>

        <h3 style="margin-top:14px">Membros</h3>
        <div class="adm-list" id="ag-members">
          ${members.map((m, idx) => `
            <div class="adm-list-item">
              <span>${this.escape(m.name)} · ${this.escape(m.role || 'member')}${m.fictional ? ' · fictício' : ''}</span>
              <button class="btn-tiny danger" data-rm-member="${this.escape(m.uid)}">✕</button>
            </div>`).join('') || '<p class="adm-empty">Sem membros.</p>'}
        </div>

        <div class="guild-form" style="margin-top:10px">
          <h3>Adicionar membro fictício</h3>
          <label>Nome <input type="text" id="ag-fic-name" placeholder="Nome do NPC/membro" /></label>
          <label>Cargo
            <select id="ag-fic-role">
              <option value="member">member</option>
              <option value="officer">officer</option>
              <option value="leader">leader</option>
            </select>
          </label>
          <button class="btn-panel btn-add" id="ag-add-fic">+ Adicionar fictício</button>
        </div>

        ${requests.length ? `
        <h3 style="margin-top:14px">Pedidos de entrada</h3>
        <div class="adm-list">
          ${requests.map((r) => `
            <div class="adm-list-item">
              <span>${this.escape(r.name)}</span>
              <div class="adm-list-actions">
                <button class="btn-tiny" data-accept-req="${r.uid}">Aceitar</button>
                <button class="btn-tiny danger" data-deny-req="${r.uid}">Recusar</button>
              </div>
            </div>`).join('')}
        </div>` : ''}

        <button class="btn-panel" id="ag-save" style="margin-top:14px">Salvar Guilda</button>
        <div id="ag-msg"></div>
      </div>`;

    area.querySelector('#ag-save').onclick = async () => {
      const msg = area.querySelector('#ag-msg');
      msg.textContent = 'Salvando...';
      msg.className = 'adm-msg loading';
      try {
        await this.authService.updateGuild(guild.id, {
          name: area.querySelector('#ag-name').value.trim(),
          tag: area.querySelector('#ag-tag').value.trim(),
          description: area.querySelector('#ag-desc').value.trim(),
          status: area.querySelector('#ag-status').value
        });
        Sound.success();
        msg.textContent = 'Guilda salva!';
        msg.className = 'adm-msg success';
        this.renderAdmin(overlay);
      } catch (err) {
        Sound.error();
        msg.textContent = err.message || 'Erro';
        msg.className = 'adm-msg error';
      }
    };

    area.querySelector('#ag-add-fic').onclick = async () => {
      const name = area.querySelector('#ag-fic-name').value.trim();
      if (!name) return;
      try {
        await this.authService.addGuildMember(guild.id, {
          name,
          role: area.querySelector('#ag-fic-role').value,
          fictional: true
        });
        Sound.success();
        const updated = await this.authService.getGuild(guild.id);
        this.renderAdminGuildEdit(updated, overlay);
      } catch (err) {
        Sound.error();
        alert(err.message || 'Erro ao adicionar');
      }
    };

    area.querySelectorAll('[data-rm-member]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await this.authService.removeGuildMember(guild.id, btn.dataset.rmMember);
          Sound.click();
          const updated = await this.authService.getGuild(guild.id);
          this.renderAdminGuildEdit(updated, overlay);
        } catch (err) {
          Sound.error();
          alert(err.message || 'Erro');
        }
      };
    });

    area.querySelectorAll('[data-accept-req]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await this.authService.acceptJoinRequest(guild.id, btn.dataset.acceptReq);
          Sound.success();
          const updated = await this.authService.getGuild(guild.id);
          this.renderAdminGuildEdit(updated, overlay);
        } catch (err) {
          Sound.error();
          alert(err.message || 'Erro');
        }
      };
    });

    area.querySelectorAll('[data-deny-req]').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await this.authService.denyJoinRequest(guild.id, btn.dataset.denyReq);
          Sound.click();
          const updated = await this.authService.getGuild(guild.id);
          this.renderAdminGuildEdit(updated, overlay);
        } catch {
          Sound.error();
        }
      };
    });
  }

  /** Normaliza listas vindas do Firebase (array ou objeto indexado). */
  toArray(val) {
    if (Array.isArray(val)) return val.filter(Boolean).map((x) => (x && typeof x === 'object' ? { ...x } : x));
    if (val && typeof val === 'object') {
      return Object.values(val)
        .filter(Boolean)
        .map((x) => (x && typeof x === 'object' ? { ...x } : x));
    }
    return [];
  }

  markAdminDirty(dirty = true) {
    this._adminDirty = dirty;
    const flag = this.container?.querySelector('#adm-dirty-flag');
    if (flag) flag.classList.toggle('hidden', !dirty);
  }

  renderAdminEdit(player) {
    const area = this.container.querySelector('#admin-edit-area');
    if (!area || !player) return;

    this._editingUid = player.uid;
    this._editState = {
      inventory: this.toArray(player.inventory),
      skills: this.toArray(player.skills),
      party: this.toArray(player.party),
      titles: this.toArray(player.titles),
      equipment: { ...(player.equipment || {}) },
      activeTitle: player.activeTitle || null
    };
    this._adminDirty = false;
    this._adminActiveTab = 'inv';

    area.innerHTML = `
      <div class="admin-section admin-edit-block">
        <div class="adm-edit-header">
          <h3>Editando: ${this.escape(player.displayName || player.account)}</h3>
          <span id="adm-dirty-flag" class="adm-dirty hidden">alterações não salvas</span>
        </div>

        <details class="adm-details" open>
          <summary>Dados básicos</summary>
          <div class="admin-form">
            <label>Nome <input type="text" id="adm-name" value="${this.escape(player.displayName || '')}" /></label>
            <label>Nível <input type="number" id="adm-level" value="${player.level || 1}" min="1" /></label>
            <label>HP <input type="number" id="adm-hp" value="${player.hp || 100}" /></label>
            <label>Max HP <input type="number" id="adm-maxhp" value="${player.maxHp || 100}" /></label>
            <label>MP <input type="number" id="adm-mp" value="${player.mp || 50}" /></label>
            <label>Max MP <input type="number" id="adm-maxmp" value="${player.maxMp || 50}" /></label>
            <label>Localização <input type="text" id="adm-location" value="${this.escape(player.location || '')}" /></label>
            <label>Região <input type="text" id="adm-region" value="${this.escape(player.region || '')}" /></label>
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
            <label>Avatar URL <input type="text" id="adm-avatar" value="${this.escape(player.avatarUrl || '')}" placeholder="https://..." /></label>
          </div>
        </details>

        <details class="adm-details">
          <summary>Guilda</summary>
          <div class="admin-form">
            <label>Nome <input type="text" id="adm-guild" value="${this.escape(player.guild || '')}" placeholder="Nome da guilda" /></label>
            <label>Sigla <input type="text" id="adm-guild-tag" maxlength="5" value="${this.escape(player.guildTag || '')}" placeholder="TAG" /></label>
            <label>Guild ID <input type="text" id="adm-guild-id" value="${this.escape(player.guildId || '')}" placeholder="id firebase" /></label>
            <label>Cargo <input type="text" id="adm-guild-role" value="${this.escape(player.guildRole || '')}" placeholder="leader / member" /></label>
          </div>
        </details>

        <details class="adm-details">
          <summary>Atributos</summary>
          <div class="admin-form">
            <label>STR <input type="number" id="adm-str" value="${player.stats?.str ?? 10}" /></label>
            <label>AGI <input type="number" id="adm-agi" value="${player.stats?.agi ?? 10}" /></label>
            <label>VIT <input type="number" id="adm-vit" value="${player.stats?.vit ?? 10}" /></label>
            <label>INT <input type="number" id="adm-int" value="${player.stats?.int ?? 10}" /></label>
            <label>DEX <input type="number" id="adm-dex" value="${player.stats?.dex ?? 10}" /></label>
            <label>LUK <input type="number" id="adm-luk" value="${player.stats?.luk ?? 10}" /></label>
          </div>
        </details>

        <details class="adm-details">
          <summary>Aparência</summary>
          <label class="full-label" style="margin-top:0">
            <textarea id="adm-appearance" rows="2" placeholder="Descrição visual do personagem...">${this.escape(player.appearance || '')}</textarea>
          </label>
        </details>

        <div class="admin-tabs">
          <button class="adm-tab active" data-tab="inv">Inventário (${this._editState.inventory.length})</button>
          <button class="adm-tab" data-tab="eq">Equipamento</button>
          <button class="adm-tab" data-tab="sk">Skills (${this._editState.skills.length})</button>
          <button class="adm-tab" data-tab="pt">Party (${this._editState.party.length})</button>
          <button class="adm-tab" data-tab="ti">Títulos (${this._editState.titles.length})</button>
        </div>
        <div id="adm-tab-content" class="adm-tab-content"></div>

        <div class="adm-save-bar">
          <button class="btn-panel" id="adm-save">Salvar Alterações</button>
          <div id="adm-msg" class="adm-msg"></div>
        </div>
      </div>`;

    const showTab = (tab) => {
      this._adminActiveTab = tab;
      area.querySelectorAll('.adm-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
      const content = area.querySelector('#adm-tab-content');
      if (tab === 'inv') this.renderAdminListEditor(content, 'inventory', ['name', 'qty', 'rarity', 'description']);
      if (tab === 'sk') this.renderAdminListEditor(content, 'skills', ['name', 'type', 'description']);
      if (tab === 'pt') this.renderAdminListEditor(content, 'party', ['name', 'class', 'level', 'role']);
      if (tab === 'ti') this.renderAdminListEditor(content, 'titles', ['name', 'bonus', 'description']);
      if (tab === 'eq') this.renderAdminEquipmentEditor(content);
      this.refreshAdminTabCounts(area);
    };

    area.querySelectorAll('.adm-tab').forEach((btn) => {
      btn.onclick = () => {
        Sound.click();
        showTab(btn.dataset.tab);
      };
    });
    showTab('inv');

    area.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('change', () => this.markAdminDirty(true));
      el.addEventListener('input', () => this.markAdminDirty(true));
    });

    area.querySelector('#adm-save').onclick = async () => {
      const msg = area.querySelector('#adm-msg');
      msg.textContent = 'Salvando...';
      msg.className = 'adm-msg loading';

      const inventory = this.toArray(this._editState.inventory).map((it) => ({
        name: String(it.name || '').trim(),
        qty: Number(it.qty) || 1,
        rarity: String(it.rarity || 'comum').toLowerCase(),
        description: String(it.description || '').trim()
      })).filter((it) => it.name);

      const skills = this.toArray(this._editState.skills).map((it) => ({
        name: String(it.name || '').trim(),
        type: String(it.type || '').trim(),
        description: String(it.description || '').trim()
      })).filter((it) => it.name);

      const party = this.toArray(this._editState.party).map((it) => ({
        name: String(it.name || '').trim(),
        class: String(it.class || '').trim(),
        level: Number(it.level) || 1,
        role: String(it.role || '').trim()
      })).filter((it) => it.name);

      const titles = this.toArray(this._editState.titles).map((it) => ({
        name: String(it.name || '').trim(),
        bonus: String(it.bonus || '').trim(),
        description: String(it.description || '').trim()
      })).filter((it) => it.name);

      const equipment = {};
      const slots = ['cabeca', 'peito', 'maos', 'pernas', 'pes', 'arma', 'acessorio1', 'acessorio2'];
      for (const slot of slots) {
        const item = this._editState.equipment?.[slot];
        if (item && item.name) {
          equipment[slot] = {
            name: String(item.name).trim(),
            rarity: String(item.rarity || 'comum').toLowerCase(),
            description: String(item.description || '').trim()
          };
        } else {
          equipment[slot] = null;
        }
      }

      const data = {
        displayName: area.querySelector('#adm-name').value.trim(),
        level: Number(area.querySelector('#adm-level').value) || 1,
        hp: Number(area.querySelector('#adm-hp').value) || 0,
        maxHp: Number(area.querySelector('#adm-maxhp').value) || 0,
        mp: Number(area.querySelector('#adm-mp').value) || 0,
        maxMp: Number(area.querySelector('#adm-maxmp').value) || 0,
        location: area.querySelector('#adm-location').value.trim(),
        region: area.querySelector('#adm-region').value.trim(),
        guild: area.querySelector('#adm-guild').value.trim(),
        guildTag: area.querySelector('#adm-guild-tag').value.trim().toUpperCase(),
        guildId: area.querySelector('#adm-guild-id').value.trim(),
        guildRole: area.querySelector('#adm-guild-role').value.trim(),
        avatarUrl: area.querySelector('#adm-avatar').value.trim(),
        zoneType: area.querySelector('#adm-zone').value,
        condition: area.querySelector('#adm-condition').value,
        appearance: area.querySelector('#adm-appearance').value.trim(),
        stats: {
          str: Number(area.querySelector('#adm-str').value) || 0,
          agi: Number(area.querySelector('#adm-agi').value) || 0,
          vit: Number(area.querySelector('#adm-vit').value) || 0,
          int: Number(area.querySelector('#adm-int').value) || 0,
          dex: Number(area.querySelector('#adm-dex').value) || 0,
          luk: Number(area.querySelector('#adm-luk').value) || 0
        },
        inventory,
        skills,
        party,
        titles,
        equipment,
        activeTitle: this._editState.activeTitle || null
      };

      try {
        await this.authService.updatePlayer(player.uid, data);
        this._editState.inventory = inventory;
        this._editState.skills = skills;
        this._editState.party = party;
        this._editState.titles = titles;
        this._editState.equipment = equipment;
        this.markAdminDirty(false);
        Sound.success();
        msg.textContent = `Salvo! Inventário: ${inventory.length} item(ns).`;
        msg.className = 'adm-msg success';
        this.refreshAdminTabCounts(area);
        showTab(this._adminActiveTab || 'inv');
      } catch (err) {
        Sound.error();
        msg.textContent = 'Erro: ' + (err.message || 'falha ao salvar');
        msg.className = 'adm-msg error';
      }
    };
  }

  refreshAdminTabCounts(area) {
    if (!area || !this._editState) return;
    const map = {
      inv: `Inventário (${this._editState.inventory.length})`,
      eq: 'Equipamento',
      sk: `Skills (${this._editState.skills.length})`,
      pt: `Party (${this._editState.party.length})`,
      ti: `Títulos (${this._editState.titles.length})`
    };
    area.querySelectorAll('.adm-tab').forEach((t) => {
      const label = map[t.dataset.tab];
      if (label) t.textContent = label;
    });
  }

  renderAdminListEditor(container, key, fields) {
    if (!container) return;
    const list = this.toArray(this._editState[key]);
    this._editState[key] = list;

    const isInv = key === 'inventory';
    const titleMap = {
      inventory: 'Itens',
      skills: 'Skills',
      party: 'Membros',
      titles: 'Títulos'
    };

    container.innerHTML = `
      <div class="adm-list-toolbar">
        <span class="adm-list-count">${list.length} ${titleMap[key] || 'itens'}</span>
        <button class="btn-tiny" id="adm-add-item">+ Adicionar</button>
      </div>

      ${isInv ? `
      <div class="adm-quick-add">
        <input type="text" id="qa-name" placeholder="Nome do item" />
        <input type="number" id="qa-qty" value="1" min="1" title="Qtd" />
        <select id="qa-rarity">
          <option value="comum">Comum</option>
          <option value="raro">Raro</option>
          <option value="unico">Único</option>
        </select>
        <button class="btn-tiny" id="qa-add">Dar item</button>
      </div>
      <input type="text" id="qa-desc" class="adm-quick-desc" placeholder="Descrição (opcional)" />
      ` : ''}

      <div class="adm-list">
        ${list.length === 0
          ? '<p class="adm-empty">Lista vazia. Use “Adicionar” ou o atalho acima.</p>'
          : list.map((item, idx) => {
              const rarity = item.rarity ? (RARITY_LABELS[item.rarity] || item.rarity) : '';
              const meta = [];
              if (isInv && item.qty != null) meta.push(`x${item.qty}`);
              if (item.type) meta.push(item.type);
              if (item.class) meta.push(item.class);
              if (item.level != null && key === 'party') meta.push(`Lv.${item.level}`);
              if (item.role) meta.push(item.role);
              if (item.bonus) meta.push(item.bonus);
              return `
                <div class="adm-list-item ${item.rarity ? this.rarityClass(item.rarity) : ''}">
                  <div class="adm-item-main">
                    <div class="adm-item-title">
                      <strong>${this.escape(item.name || '—')}</strong>
                      ${rarity ? `<span class="rarity-tag">${this.escape(rarity)}</span>` : ''}
                    </div>
                    <div class="adm-item-meta">${this.escape(meta.join(' · '))}</div>
                    ${item.description ? `<div class="adm-item-desc">${this.escape(item.description)}</div>` : ''}
                  </div>
                  <div class="adm-list-actions">
                    <button class="btn-tiny edit-item" data-idx="${idx}">Editar</button>
                    <button class="btn-tiny danger del-item" data-idx="${idx}">✕</button>
                  </div>
                </div>`;
            }).join('')}
      </div>
    `;

    container.querySelectorAll('.edit-item').forEach((btn) => {
      btn.onclick = () => {
        Sound.click();
        this.openItemModal(key, fields, Number(btn.dataset.idx));
      };
    });
    container.querySelectorAll('.del-item').forEach((btn) => {
      btn.onclick = () => {
        Sound.click();
        this._editState[key].splice(Number(btn.dataset.idx), 1);
        this.markAdminDirty(true);
        this.renderAdminListEditor(container, key, fields);
        this.refreshAdminTabCounts(this.container.querySelector('.admin-edit-block'));
      };
    });
    container.querySelector('#adm-add-item').onclick = () => {
      Sound.click();
      this.openItemModal(key, fields, -1);
    };

    if (isInv) {
      const quickAdd = () => {
        const name = container.querySelector('#qa-name')?.value.trim();
        if (!name) {
          container.querySelector('#qa-name')?.focus();
          return;
        }
        const qty = Number(container.querySelector('#qa-qty')?.value) || 1;
        const rarity = container.querySelector('#qa-rarity')?.value || 'comum';
        const description = container.querySelector('#qa-desc')?.value.trim() || '';
        this._editState.inventory.push({ name, qty, rarity, description });
        this.markAdminDirty(true);
        Sound.success();
        this.renderAdminListEditor(container, key, fields);
        this.refreshAdminTabCounts(this.container.querySelector('.admin-edit-block'));
      };
      container.querySelector('#qa-add').onclick = quickAdd;
      container.querySelector('#qa-name')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          quickAdd();
        }
      });
    }
  }

  renderAdminEquipmentEditor(container) {
    const slots = [
      { key: 'cabeca', label: 'Cabeça' }, { key: 'peito', label: 'Peito' },
      { key: 'maos', label: 'Mãos' }, { key: 'pernas', label: 'Pernas' },
      { key: 'pes', label: 'Pés' }, { key: 'arma', label: 'Arma' },
      { key: 'acessorio1', label: 'Acessório 1' }, { key: 'acessorio2', label: 'Acessório 2' }
    ];
    const eq = this._editState.equipment || {};
    container.innerHTML = `
      <div class="adm-list">
        ${slots.map((s) => {
          const item = eq[s.key];
          return `
            <div class="adm-list-item ${item?.rarity ? this.rarityClass(item.rarity) : ''}">
              <div class="adm-item-main">
                <div class="adm-item-title">
                  <span class="adm-slot-label">${s.label}</span>
                  <strong>${item ? this.escape(item.name) : '— vazio —'}</strong>
                  ${item?.rarity ? `<span class="rarity-tag">${this.escape(RARITY_LABELS[item.rarity] || item.rarity)}</span>` : ''}
                </div>
                ${item?.description ? `<div class="adm-item-desc">${this.escape(item.description)}</div>` : ''}
              </div>
              <div class="adm-list-actions">
                <button class="btn-tiny edit-eq" data-slot="${s.key}">${item ? 'Editar' : 'Definir'}</button>
                ${item ? `<button class="btn-tiny danger clear-eq" data-slot="${s.key}">✕</button>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>`;

    container.querySelectorAll('.edit-eq').forEach((btn) => {
      btn.onclick = () => {
        Sound.click();
        this.openItemModal('equipment', ['name', 'rarity', 'description'], btn.dataset.slot);
      };
    });
    container.querySelectorAll('.clear-eq').forEach((btn) => {
      btn.onclick = () => {
        Sound.click();
        this._editState.equipment[btn.dataset.slot] = null;
        this.markAdminDirty(true);
        this.renderAdminEquipmentEditor(container);
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
          ${fields.map((f) => {
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
          <button class="btn-modal-save" id="modal-save">Confirmar</button>
        </div>
      </div>`;

    const close = () => {
      modal.classList.add('hidden');
      modal.innerHTML = '';
    };
    modal.querySelector('#modal-cancel').onclick = close;
    modal.querySelector('#modal-x').onclick = close;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.querySelector('#modal-save').onclick = () => {
      const obj = {};
      fields.forEach((f) => {
        const el = modal.querySelector(`#modal-${f}`);
        if (!el) return;
        obj[f] = f === 'qty' || f === 'level' ? Number(el.value) || 0 : el.value.trim();
      });

      if (!obj.name) {
        modal.querySelector('#modal-name')?.focus();
        return;
      }

      if (isEquip) {
        this._editState.equipment = this._editState.equipment || {};
        this._editState.equipment[indexOrSlot] = obj;
      } else {
        if (!Array.isArray(this._editState[key])) this._editState[key] = [];
        if (isNew) this._editState[key].push(obj);
        else this._editState[key][indexOrSlot] = obj;
      }

      this.markAdminDirty(true);
      Sound.success();
      close();

      const content = this.container.querySelector('#adm-tab-content');
      if (!content) return;
      if (key === 'inventory') this.renderAdminListEditor(content, 'inventory', ['name', 'qty', 'rarity', 'description']);
      if (key === 'skills') this.renderAdminListEditor(content, 'skills', ['name', 'type', 'description']);
      if (key === 'party') this.renderAdminListEditor(content, 'party', ['name', 'class', 'level', 'role']);
      if (key === 'titles') this.renderAdminListEditor(content, 'titles', ['name', 'bonus', 'description']);
      if (key === 'equipment') this.renderAdminEquipmentEditor(content);
      this.refreshAdminTabCounts(this.container.querySelector('.admin-edit-block'));
    };

    setTimeout(() => modal.querySelector('#modal-name')?.focus(), 30);
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
