// src/modules/world/CharacterCreation.js
// Criação de personagem - experiência completa em PT-BR

export class CharacterCreation {
  constructor({ account, onComplete }) {
    this.account = account;
    this.onComplete = onComplete;
    this.container = null;
    this.selectedClass = null;

    this.classes = [
      {
        id: 'espadachim',
        name: 'Espadachim',
        desc: 'Equilíbrio entre ataque e defesa. Ideal para quem gosta de combate direto.',
        stats: { str: 14, agi: 11, vit: 13, int: 8, dex: 10, luk: 9 },
        hp: 120,
        mp: 40
      },
      {
        id: 'mago',
        name: 'Mago',
        desc: 'Mestre das artes arcanas. Alto poder mágico, mas frágil fisicamente.',
        stats: { str: 7, agi: 9, vit: 8, int: 16, dex: 11, luk: 10 },
        hp: 80,
        mp: 110
      },
      {
        id: 'assassino',
        name: 'Assassino',
        desc: 'Velocidade e precisão letais. Especialista em ataques críticos.',
        stats: { str: 11, agi: 16, vit: 9, int: 8, dex: 14, luk: 12 },
        hp: 95,
        mp: 50
      },
      {
        id: 'curandeiro',
        name: 'Curandeiro',
        desc: 'Suporte vital do grupo. Cura e proteção com boa resistência.',
        stats: { str: 8, agi: 10, vit: 14, int: 13, dex: 9, luk: 11 },
        hp: 110,
        mp: 90
      },
      {
        id: 'arqueiro',
        name: 'Arqueiro',
        desc: 'Ataques à distância precisos. Excelente agilidade e destreza.',
        stats: { str: 10, agi: 14, vit: 10, int: 9, dex: 15, luk: 11 },
        hp: 100,
        mp: 55
      }
    ];
  }

  show() {
    this.createDOM();
    this.bindEvents();
    requestAnimationFrame(() => this.container.classList.add('visible'));
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'char-creation';
    this.container.innerHTML = `
      <div class="creation-panel">
        <div class="creation-header">
          <h1>Criação de Personagem</h1>
          <p class="subtitle">Bem-vindo ao GRPG. Defina quem você será neste mundo.</p>
        </div>

        <div class="creation-body">
          <div class="form-group">
            <label for="char-name">Nome do Personagem</label>
            <input type="text" id="char-name" maxlength="16" placeholder="Ex: Kirito, Asuna, Leafa..." autocomplete="off" spellcheck="false" />
            <span class="hint">Máximo 16 caracteres. Este será seu nome no mundo.</span>
          </div>

          <div class="form-group">
            <label>Classe Inicial</label>
            <div class="class-grid" id="class-grid"></div>
          </div>

          <div class="class-preview" id="class-preview">
            <p class="preview-placeholder">Selecione uma classe para ver os detalhes</p>
          </div>
        </div>

        <div class="creation-footer">
          <div id="creation-error" class="creation-error"></div>
          <button id="btn-create" class="btn-create" disabled>Confirmar e Entrar no Mundo</button>
        </div>
      </div>
    `;

    // Estilos
    const style = document.createElement('style');
    style.textContent = `
      #char-creation {
        position: fixed; inset: 0;
        background: radial-gradient(ellipse at center, #0f172a 0%, #020617 100%);
        display: flex; align-items: center; justify-content: center;
        z-index: 200; opacity: 0; transition: opacity 0.6s ease;
        font-family: 'Segoe UI', system-ui, sans-serif; color: #e2e8f0;
      }
      #char-creation.visible { opacity: 1; }
      .creation-panel {
        width: 92%; max-width: 720px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 12px;
        box-shadow: 0 0 60px rgba(59, 130, 246, 0.15);
        overflow: hidden;
      }
      .creation-header {
        padding: 28px 32px 18px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        text-align: center;
      }
      .creation-header h1 {
        font-size: 1.6rem; font-weight: 500; letter-spacing: 0.06em;
        margin-bottom: 6px; color: #f1f5f9;
      }
      .subtitle { font-size: 0.9rem; color: #94a3b8; }
      .creation-body { padding: 24px 32px; }
      .form-group { margin-bottom: 22px; }
      .form-group label {
        display: block; font-size: 0.8rem; letter-spacing: 0.1em;
        text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;
      }
      #char-name {
        width: 100%; height: 42px; padding: 0 14px;
        background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 6px; color: #f1f5f9; font-size: 1rem; outline: none;
        transition: border-color 0.2s;
      }
      #char-name:focus { border-color: #3b82f6; }
      .hint { display: block; margin-top: 6px; font-size: 0.75rem; color: #64748b; }
      .class-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
      }
      .class-card {
        padding: 14px 10px; text-align: center;
        background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px; cursor: pointer; transition: all 0.2s;
      }
      .class-card:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
      .class-card.selected {
        border-color: #3b82f6; background: rgba(59, 130, 246, 0.18);
        box-shadow: 0 0 16px rgba(59, 130, 246, 0.25);
      }
      .class-card .class-name { font-weight: 600; font-size: 0.95rem; color: #e2e8f0; }
      .class-preview {
        margin-top: 18px; padding: 16px;
        background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 8px; min-height: 90px;
      }
      .preview-placeholder { color: #64748b; font-size: 0.9rem; text-align: center; margin-top: 20px; }
      .preview-content h3 { margin-bottom: 6px; color: #93c5fd; font-weight: 500; }
      .preview-content p { font-size: 0.88rem; color: #94a3b8; margin-bottom: 12px; line-height: 1.45; }
      .preview-stats {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px;
        font-size: 0.82rem;
      }
      .preview-stats span { color: #cbd5e1; }
      .preview-stats strong { color: #93c5fd; float: right; }
      .creation-footer {
        padding: 16px 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
      }
      .btn-create {
        width: 100%; max-width: 320px; height: 46px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        border: none; border-radius: 6px; color: #fff;
        font-size: 0.95rem; font-weight: 600; letter-spacing: 0.04em;
        cursor: pointer; transition: all 0.2s;
      }
      .btn-create:hover:not(:disabled) {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
      }
      .btn-create:disabled { opacity: 0.45; cursor: not-allowed; }

      @media (max-width: 520px) {
        .creation-header { padding: 20px 16px 14px; }
        .creation-header h1 { font-size: 1.3rem; }
        .creation-body { padding: 16px; }
        .creation-footer { padding: 12px 16px 20px; }
        .class-grid { grid-template-columns: repeat(2, 1fr); }
        .preview-stats { grid-template-columns: 1fr 1fr; }
      }
      .creation-error { font-size: 0.85rem; color: #fca5a5; min-height: 20px; text-align: center; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);

    // Render classes
    const grid = this.container.querySelector('#class-grid');
    this.classes.forEach(cls => {
      const card = document.createElement('div');
      card.className = 'class-card';
      card.dataset.id = cls.id;
      card.innerHTML = `<div class="class-name">${cls.name}</div>`;
      grid.appendChild(card);
    });
  }

  bindEvents() {
    const nameInput = this.container.querySelector('#char-name');
    const btnCreate = this.container.querySelector('#btn-create');
    const errorEl = this.container.querySelector('#creation-error');
    const preview = this.container.querySelector('#class-preview');

    // Seleção de classe
    this.container.querySelectorAll('.class-card').forEach(card => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedClass = this.classes.find(c => c.id === card.dataset.id);
        this.renderPreview(preview);
        this.updateButton(nameInput, btnCreate);
      });
    });

    nameInput.addEventListener('input', () => this.updateButton(nameInput, btnCreate));

    btnCreate.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      if (!name || !this.selectedClass) return;

      if (name.length < 2) {
        errorEl.textContent = 'O nome precisa ter pelo menos 2 caracteres.';
        return;
      }

      btnCreate.disabled = true;
      btnCreate.textContent = 'Criando personagem...';
      errorEl.textContent = '';

      try {
        const characterData = {
          displayName: name,
          class: this.selectedClass.name,
          classId: this.selectedClass.id,
          level: 1,
          hp: this.selectedClass.hp,
          maxHp: this.selectedClass.hp,
          mp: this.selectedClass.mp,
          maxMp: this.selectedClass.mp,
          location: 'Cidade dos Iniciantes',
          region: 'Aincrad — Andar 1',
          stats: { ...this.selectedClass.stats },
          inventory: [],
          characterCreated: true,
          createdAt: Date.now()
        };
        await this.onComplete(characterData);
      } catch (err) {
        errorEl.textContent = err.message || 'Erro ao criar personagem.';
        btnCreate.disabled = false;
        btnCreate.textContent = 'Confirmar e Entrar no Mundo';
      }
    });
  }

  renderPreview(el) {
    const c = this.selectedClass;
    el.innerHTML = `
      <div class="preview-content">
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        <div class="preview-stats">
          <span>HP <strong>${c.hp}</strong></span>
          <span>MP <strong>${c.mp}</strong></span>
          <span>STR <strong>${c.stats.str}</strong></span>
          <span>AGI <strong>${c.stats.agi}</strong></span>
          <span>VIT <strong>${c.stats.vit}</strong></span>
          <span>INT <strong>${c.stats.int}</strong></span>
          <span>DEX <strong>${c.stats.dex}</strong></span>
          <span>LUK <strong>${c.stats.luk}</strong></span>
        </div>
      </div>
    `;
  }

  updateButton(nameInput, btn) {
    const name = nameInput.value.trim();
    btn.disabled = !(name.length >= 2 && this.selectedClass);
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => this.container?.remove(), 600);
    }
  }
}
