// src/modules/world/CharacterCreation.js
// Criação de personagem — Genesis (raças + classes iniciais)

const BASE_STATS = { str: 10, agi: 10, vit: 10, int: 10, dex: 10, luk: 10 };

const STAT_KEYS = ['str', 'agi', 'vit', 'int', 'dex', 'luk'];
const STAT_LABELS = { str: 'STR', agi: 'AGI', vit: 'VIT', int: 'INT', dex: 'DEX', luk: 'LUK' };

export class CharacterCreation {
  constructor({ account, onComplete }) {
    this.account = account;
    this.onComplete = onComplete;
    this.container = null;
    this.selectedRace = null;
    this.selectedClass = null;
    /** @type {[string, string]} atributos extras do Humano */
    this.humanBonus = [null, null];

    this.races = [
      {
        id: 'humano',
        name: 'Humano',
        icon: '🧑',
        tag: 'Adaptabilidade',
        desc: 'Versátil e adaptável. Recebe +1 em quaisquer dois atributos à escolha.',
        bonuses: {},
        flexible: true
      },
      {
        id: 'elfo',
        name: 'Elfo',
        icon: '🧝',
        tag: 'Precisão e magia',
        desc: 'Afinação natural com precisão e artes arcanas.',
        bonuses: { dex: 2, int: 1 }
      },
      {
        id: 'anao',
        name: 'Anão',
        icon: '⛏️',
        tag: 'Resistência e força',
        desc: 'Resistência excepcional e força de combate.',
        bonuses: { vit: 2, str: 1 }
      },
      {
        id: 'orc',
        name: 'Orc',
        icon: '👹',
        tag: 'Poder físico',
        desc: 'Poder físico bruto e presença intimidadora.',
        bonuses: { str: 2, vit: 1 }
      },
      {
        id: 'beastfolk',
        name: 'Beastfolk',
        icon: '🐺',
        tag: 'Mobilidade e sentidos',
        desc: 'Sentidos aguçados e mobilidade superior.',
        bonuses: { agi: 2, dex: 1 }
      },
      {
        id: 'draconiano',
        name: 'Draconiano',
        icon: '🐉',
        tag: 'Poder e resistência',
        desc: 'Herança dracônica: força e vigor elevados.',
        bonuses: { str: 2, vit: 1 }
      },
      {
        id: 'demonio',
        name: 'Demônio',
        icon: '😈',
        tag: 'Magia e poder',
        desc: 'Afinidade com poder mágico e força sombria.',
        bonuses: { int: 2, str: 1 }
      },
      {
        id: 'celestial',
        name: 'Celestial',
        icon: '👼',
        tag: 'Magia e suporte',
        desc: 'Linhagem celestial voltada a magia e proteção.',
        bonuses: { int: 2, vit: 1 }
      },
      {
        id: 'fada',
        name: 'Fada',
        icon: '🧚',
        tag: 'Mobilidade e magia',
        desc: 'Leveza, agilidade e conexão com o arcano.',
        bonuses: { agi: 2, int: 1 }
      },
      {
        id: 'morto-vivo',
        name: 'Morto-Vivo',
        icon: '💀',
        tag: 'Resistência e ocultismo',
        desc: 'Corpo endurecido e afinidade com o oculto.',
        bonuses: { vit: 2, int: 1 }
      }
    ];

    // Classes iniciais de Genesis — ponto de partida, não destino final
    this.classes = [
      {
        id: 'guerreiro',
        name: 'Guerreiro',
        icon: '⚔️',
        focus: ['STR', 'VIT'],
        desc: 'Especialista em combate corpo a corpo e utilização de diferentes tipos de armas.',
        focusStats: { str: 3, vit: 2 }
      },
      {
        id: 'guardiao',
        name: 'Guardião',
        icon: '🛡️',
        focus: ['VIT', 'STR'],
        desc: 'Especializado em resistência, defesa, escudos e proteção de aliados.',
        focusStats: { vit: 3, str: 2 }
      },
      {
        id: 'ladino',
        name: 'Ladino',
        icon: '🗡️',
        focus: ['DEX', 'AGI'],
        desc: 'Especialista em furtividade, mobilidade, infiltração e ataques precisos.',
        focusStats: { dex: 3, agi: 2 }
      },
      {
        id: 'arqueiro',
        name: 'Arqueiro',
        icon: '🏹',
        focus: ['DEX', 'AGI'],
        desc: 'Especialista em armas de longo alcance, precisão e combate à distância.',
        focusStats: { dex: 3, agi: 2 }
      },
      {
        id: 'lanceiro',
        name: 'Lanceiro',
        icon: '🔱',
        focus: ['STR', 'DEX'],
        desc: 'Especialista em lanças, alabardas e armas de haste — alcance e controle de distância.',
        focusStats: { str: 3, dex: 2 }
      },
      {
        id: 'lutador',
        name: 'Lutador',
        icon: '🥋',
        focus: ['STR', 'AGI'],
        desc: 'Especialista em combate desarmado e técnicas corporais. Artes marciais reais são vantagem.',
        focusStats: { str: 3, agi: 2 }
      },
      {
        id: 'mago',
        name: 'Mago',
        icon: '🔮',
        focus: ['INT'],
        desc: 'Especialista no estudo e utilização estruturada da magia.',
        focusStats: { int: 4 }
      },
      {
        id: 'feiticeiro',
        name: 'Feiticeiro',
        icon: '🔥',
        focus: ['INT', 'LUK'],
        desc: 'Maior afinidade com manifestações mágicas instintivas e poder mágico bruto.',
        focusStats: { int: 3, luk: 2 }
      },
      {
        id: 'bruxo',
        name: 'Bruxo',
        icon: '🌑',
        focus: ['INT', 'LUK'],
        desc: 'Conhecimentos arcanos menos convencionais, maldições, pactos e práticas incomuns.',
        focusStats: { int: 3, luk: 2 }
      },
      {
        id: 'acolito',
        name: 'Acólito',
        icon: '✨',
        focus: ['INT', 'VIT'],
        desc: 'Voltado para suporte, cura e desenvolvimento de conhecimentos espirituais.',
        focusStats: { int: 3, vit: 2 }
      },
      {
        id: 'sacerdote',
        name: 'Sacerdote',
        icon: '⛪',
        focus: ['INT', 'VIT'],
        desc: 'Poderes associados à fé, rituais, proteção, bênçãos e conhecimentos religiosos.',
        focusStats: { int: 3, vit: 2 }
      },
      {
        id: 'naturalista',
        name: 'Naturalista',
        icon: '🌿',
        focus: ['INT', 'LUK'],
        desc: 'Sobrevivência, coleta, alquimia e conhecimento sobre os ecossistemas de Genesis.',
        focusStats: { int: 3, luk: 2 }
      },
      {
        id: 'patrulheiro',
        name: 'Patrulheiro',
        icon: '🌲',
        focus: ['DEX', 'AGI'],
        desc: 'Exploração de regiões selvagens, rastreamento, sobrevivência e perseguição.',
        focusStats: { dex: 3, agi: 2 }
      },
      {
        id: 'artifice',
        name: 'Artífice',
        icon: '⚗️',
        focus: ['DEX', 'INT'],
        desc: 'Crafting, engenharia, construção, reparos e desenvolvimento de equipamentos.',
        focusStats: { dex: 3, int: 2 }
      },
      {
        id: 'profeta',
        name: 'Profeta',
        icon: '🔮',
        focus: ['INT', 'LUK'],
        desc: 'Afinidade com presságios, interpretações e fenômenos relacionados ao futuro.',
        focusStats: { int: 3, luk: 2 }
      },
      {
        id: 'oraculo',
        name: 'Oráculo',
        icon: '👁️',
        focus: ['INT', 'LUK'],
        desc: 'Percepção sobrenatural, leitura de fenômenos, informações ocultas e divinação.',
        focusStats: { int: 3, luk: 2 }
      },
      {
        id: 'estrategista',
        name: 'Estrategista',
        icon: '♟️',
        focus: ['INT', 'DEX'],
        desc: 'Análise, planejamento, comando e leitura do campo de batalha.',
        focusStats: { int: 3, dex: 2 }
      },
      {
        id: 'observador',
        name: 'Observador',
        icon: '👁️',
        focus: ['DEX', 'INT'],
        desc: 'Percepção, análise de detalhes, reconhecimento e obtenção de informações.',
        focusStats: { dex: 3, int: 2 }
      },
      {
        id: 'dancarino',
        name: 'Dançarino',
        icon: '💃',
        focus: ['AGI', 'DEX'],
        desc: 'Domínio corporal, ritmo, mobilidade e performance como fundamentos do estilo.',
        focusStats: { agi: 3, dex: 2 }
      },
      {
        id: 'marionetista',
        name: 'Marionetista',
        icon: '🪆',
        focus: ['DEX', 'INT'],
        desc: 'Controle preciso de marionetes e mecanismos ou entidades compatíveis com suas técnicas.',
        focusStats: { dex: 3, int: 2 }
      },
      {
        id: 'apostador',
        name: 'Apostador',
        icon: '🎲',
        focus: ['LUK', 'DEX'],
        desc: 'Classe de alto risco com forte interação com probabilidade, oportunidade e sorte.',
        focusStats: { luk: 3, dex: 2 }
      },
      {
        id: 'andarilho',
        name: 'Andarilho',
        icon: '🎭',
        focus: ['Variável'],
        desc: 'Sem especialização rígida — desenvolve o próprio caminho pelas experiências no mundo.',
        focusStats: { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 }
      }
    ];
  }

  show() {
    this.createDOM();
    this.bindEvents();
    requestAnimationFrame(() => this.container.classList.add('visible'));
  }

  /** Calcula stats finais a partir de raça + classe (+ bônus humano) */
  computeStats() {
    const stats = { ...BASE_STATS };

    if (this.selectedRace) {
      if (this.selectedRace.flexible) {
        this.humanBonus.forEach((key) => {
          if (key && stats[key] != null) stats[key] += 1;
        });
      } else {
        Object.entries(this.selectedRace.bonuses || {}).forEach(([k, v]) => {
          stats[k] = (stats[k] || 10) + v;
        });
      }
    }

    if (this.selectedClass) {
      Object.entries(this.selectedClass.focusStats || {}).forEach(([k, v]) => {
        stats[k] = (stats[k] || 10) + v;
      });
    }

    return stats;
  }

  computeHpMp(stats) {
    const vit = stats.vit || 10;
    const int = stats.int || 10;
    const hp = 80 + vit * 4;
    const mp = 30 + int * 5;
    return { hp, mp };
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'char-creation';
    this.container.innerHTML = `
      <div class="creation-panel">
        <div class="creation-header">
          <h1>Criação de Personagem</h1>
          <p class="subtitle">Genesis — escolha sua raça e classe inicial. O caminho à frente é seu.</p>
        </div>

        <div class="creation-body">
          <div class="form-group">
            <label for="char-name">Nome do Personagem</label>
            <input type="text" id="char-name" maxlength="16" placeholder="Ex: Kirito, Asuna, Leafa..." autocomplete="off" spellcheck="false" />
            <span class="hint">Máximo 16 caracteres. Este será seu nome no mundo.</span>
          </div>

          <div class="form-group">
            <label>Raça Inicial</label>
            <div class="select-grid race-grid" id="race-grid"></div>
            <div class="human-bonus-panel hidden" id="human-bonus-panel">
              <span class="hbp-label">Humano — escolha +1 em dois atributos:</span>
              <div class="hbp-picks">
                <select id="human-bonus-1" class="hbp-select">
                  <option value="">1º atributo</option>
                  ${STAT_KEYS.map((k) => `<option value="${k}">${STAT_LABELS[k]}</option>`).join('')}
                </select>
                <select id="human-bonus-2" class="hbp-select">
                  <option value="">2º atributo</option>
                  ${STAT_KEYS.map((k) => `<option value="${k}">${STAT_LABELS[k]}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Classe Inicial</label>
            <p class="class-note">As classes iniciais são apenas o ponto de partida. Elas podem evoluir, combinar-se (Multiclasse) e abrir caminhos distintos conforme atributos, treino, skills e feitos no mundo.</p>
            <div class="select-grid class-grid" id="class-grid"></div>
          </div>

          <div class="creation-preview" id="creation-preview">
            <p class="preview-placeholder">Selecione raça e classe para ver o resumo</p>
          </div>
        </div>

        <div class="creation-footer">
          <div id="creation-error" class="creation-error"></div>
          <button id="btn-create" class="btn-create" disabled>Confirmar e Entrar no Mundo</button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #char-creation {
        position: fixed; inset: 0;
        background: radial-gradient(ellipse at center, #0f172a 0%, #020617 100%);
        display: flex; align-items: center; justify-content: center;
        z-index: 200; opacity: 0; transition: opacity 0.6s ease;
        font-family: 'Segoe UI', system-ui, sans-serif; color: #e2e8f0;
        overflow-y: auto; padding: 24px 12px;
      }
      #char-creation.visible { opacity: 1; }
      .creation-panel {
        width: 100%; max-width: 860px;
        background: rgba(15, 23, 42, 0.94);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 12px;
        box-shadow: 0 0 60px rgba(59, 130, 246, 0.15);
        overflow: hidden;
        margin: auto;
      }
      .creation-header {
        padding: 24px 28px 16px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        text-align: center;
      }
      .creation-header h1 {
        font-size: 1.5rem; font-weight: 500; letter-spacing: 0.06em;
        margin: 0 0 6px; color: #f1f5f9;
      }
      .subtitle { font-size: 0.88rem; color: #94a3b8; margin: 0; }
      .creation-body {
        padding: 20px 28px;
        max-height: min(70vh, 640px);
        overflow-y: auto;
      }
      .form-group { margin-bottom: 20px; }
      .form-group label {
        display: block; font-size: 0.75rem; letter-spacing: 0.12em;
        text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;
      }
      #char-name {
        width: 100%; height: 42px; padding: 0 14px; box-sizing: border-box;
        background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 6px; color: #f1f5f9; font-size: 1rem; outline: none;
        transition: border-color 0.2s;
      }
      #char-name:focus { border-color: #3b82f6; }
      .hint { display: block; margin-top: 6px; font-size: 0.75rem; color: #64748b; }
      .class-note {
        font-size: 0.78rem; color: #64748b; line-height: 1.45;
        margin: -2px 0 10px; padding: 8px 10px;
        background: rgba(30, 41, 59, 0.4); border-radius: 6px;
        border-left: 2px solid rgba(59, 130, 246, 0.35);
      }

      .select-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 8px;
      }
      .select-card {
        padding: 12px 8px; text-align: center;
        background: rgba(30, 41, 59, 0.55);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 8px; cursor: pointer; transition: all 0.18s;
        user-select: none;
      }
      .select-card:hover {
        border-color: rgba(59, 130, 246, 0.55);
        background: rgba(59, 130, 246, 0.1);
      }
      .select-card.selected {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.18);
        box-shadow: 0 0 14px rgba(59, 130, 246, 0.22);
      }
      .select-card .sc-icon { font-size: 1.35rem; line-height: 1.2; margin-bottom: 4px; }
      .select-card .sc-name {
        font-weight: 600; font-size: 0.82rem; color: #e2e8f0;
        line-height: 1.25;
      }
      .select-card .sc-tag {
        display: block; margin-top: 3px;
        font-size: 0.62rem; color: #64748b; letter-spacing: 0.02em;
      }

      .human-bonus-panel {
        margin-top: 10px; padding: 10px 12px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
      }
      .human-bonus-panel.hidden { display: none; }
      .hbp-label {
        display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 8px;
      }
      .hbp-picks { display: flex; gap: 10px; flex-wrap: wrap; }
      .hbp-select {
        flex: 1; min-width: 120px; height: 36px; padding: 0 10px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 6px; color: #e2e8f0; font-size: 0.85rem;
        outline: none;
      }
      .hbp-select:focus { border-color: #3b82f6; }

      .creation-preview {
        margin-top: 8px; padding: 14px 16px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 8px; min-height: 100px;
      }
      .preview-placeholder {
        color: #64748b; font-size: 0.88rem; text-align: center;
        margin: 28px 0; 
      }
      .preview-content h3 {
        margin: 0 0 4px; color: #93c5fd; font-weight: 500; font-size: 1.05rem;
      }
      .preview-meta {
        font-size: 0.78rem; color: #64748b; margin-bottom: 8px;
      }
      .preview-content p {
        font-size: 0.84rem; color: #94a3b8; margin: 0 0 12px; line-height: 1.45;
      }
      .preview-stats {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px 12px;
        font-size: 0.8rem;
      }
      .preview-stats span { color: #cbd5e1; }
      .preview-stats strong { color: #93c5fd; float: right; }
      .preview-focus {
        display: inline-block; margin-top: 2px; margin-bottom: 8px;
        font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
        color: #60a5fa; background: rgba(59, 130, 246, 0.12);
        padding: 2px 8px; border-radius: 4px;
      }

      .creation-footer {
        padding: 14px 28px 22px; display: flex; flex-direction: column;
        align-items: center; gap: 8px;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
      }
      .btn-create {
        width: 100%; max-width: 340px; height: 46px;
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
      .creation-error {
        font-size: 0.85rem; color: #fca5a5; min-height: 20px; text-align: center;
      }

      @media (max-width: 600px) {
        .creation-header { padding: 18px 14px 12px; }
        .creation-header h1 { font-size: 1.25rem; }
        .creation-body { padding: 14px; max-height: none; }
        .creation-footer { padding: 12px 14px 18px; }
        .select-grid { grid-template-columns: repeat(2, 1fr); }
        .preview-stats { grid-template-columns: 1fr 1fr; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);

    this.renderRaceGrid();
    this.renderClassGrid();
  }

  renderRaceGrid() {
    const grid = this.container.querySelector('#race-grid');
    grid.innerHTML = '';
    this.races.forEach((race) => {
      const card = document.createElement('div');
      card.className = 'select-card';
      card.dataset.id = race.id;
      card.innerHTML = `
        <div class="sc-icon">${race.icon}</div>
        <div class="sc-name">${race.name}</div>
        <span class="sc-tag">${race.tag}</span>
      `;
      grid.appendChild(card);
    });
  }

  renderClassGrid() {
    const grid = this.container.querySelector('#class-grid');
    grid.innerHTML = '';
    this.classes.forEach((cls) => {
      const card = document.createElement('div');
      card.className = 'select-card';
      card.dataset.id = cls.id;
      card.innerHTML = `
        <div class="sc-icon">${cls.icon}</div>
        <div class="sc-name">${cls.name}</div>
        <span class="sc-tag">${cls.focus.join(' / ')}</span>
      `;
      grid.appendChild(card);
    });
  }

  bindEvents() {
    const nameInput = this.container.querySelector('#char-name');
    const btnCreate = this.container.querySelector('#btn-create');
    const errorEl = this.container.querySelector('#creation-error');
    const humanPanel = this.container.querySelector('#human-bonus-panel');
    const hb1 = this.container.querySelector('#human-bonus-1');
    const hb2 = this.container.querySelector('#human-bonus-2');

    this.container.querySelectorAll('#race-grid .select-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('#race-grid .select-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedRace = this.races.find((r) => r.id === card.dataset.id);

        if (this.selectedRace?.flexible) {
          humanPanel.classList.remove('hidden');
          this.humanBonus = [hb1.value || null, hb2.value || null];
        } else {
          humanPanel.classList.add('hidden');
          this.humanBonus = [null, null];
          hb1.value = '';
          hb2.value = '';
        }

        this.renderPreview();
        this.updateButton(nameInput, btnCreate);
      });
    });

    this.container.querySelectorAll('#class-grid .select-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('#class-grid .select-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedClass = this.classes.find((c) => c.id === card.dataset.id);
        this.renderPreview();
        this.updateButton(nameInput, btnCreate);
      });
    });

    const onHumanBonusChange = () => {
      this.humanBonus = [hb1.value || null, hb2.value || null];
      this.renderPreview();
      this.updateButton(nameInput, btnCreate);
    };
    hb1.addEventListener('change', onHumanBonusChange);
    hb2.addEventListener('change', onHumanBonusChange);

    nameInput.addEventListener('input', () => this.updateButton(nameInput, btnCreate));

    btnCreate.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      if (!name || !this.selectedClass || !this.selectedRace) return;

      if (name.length < 2) {
        errorEl.textContent = 'O nome precisa ter pelo menos 2 caracteres.';
        return;
      }

      if (this.selectedRace.flexible) {
        const [a, b] = this.humanBonus;
        if (!a || !b) {
          errorEl.textContent = 'Humano: escolha os dois atributos de bônus.';
          return;
        }
        if (a === b) {
          errorEl.textContent = 'Humano: escolha dois atributos diferentes.';
          return;
        }
      }

      btnCreate.disabled = true;
      btnCreate.textContent = 'Criando personagem...';
      errorEl.textContent = '';

      try {
        const stats = this.computeStats();
        const { hp, mp } = this.computeHpMp(stats);

        const characterData = {
          displayName: name,
          race: this.selectedRace.name,
          raceId: this.selectedRace.id,
          class: this.selectedClass.name,
          classId: this.selectedClass.id,
          level: 1,
          hp,
          maxHp: hp,
          mp,
          maxMp: mp,
          location: 'Cidade dos Iniciantes',
          region: 'Genesis — Zona Inicial',
          zoneType: 'safe',
          condition: 'normal',
          stats: { ...stats },
          inventory: [],
          skills: [],
          party: [],
          equipment: {
            cabeca: null,
            peito: null,
            maos: null,
            pernas: null,
            pes: null,
            arma: null,
            acessorio1: null,
            acessorio2: null
          },
          titles: [],
          activeTitle: null,
          notes: '',
          characterCreated: true,
          createdAt: Date.now()
        };

        if (this.selectedRace.flexible) {
          characterData.humanBonus = [...this.humanBonus];
        }

        await this.onComplete(characterData);
      } catch (err) {
        errorEl.textContent = err.message || 'Erro ao criar personagem.';
        btnCreate.disabled = false;
        btnCreate.textContent = 'Confirmar e Entrar no Mundo';
      }
    });
  }

  renderPreview() {
    const el = this.container.querySelector('#creation-preview');
    if (!this.selectedRace && !this.selectedClass) {
      el.innerHTML = `<p class="preview-placeholder">Selecione raça e classe para ver o resumo</p>`;
      return;
    }

    const race = this.selectedRace;
    const cls = this.selectedClass;
    const stats = this.computeStats();
    const { hp, mp } = this.computeHpMp(stats);

    const titleParts = [];
    if (race) titleParts.push(`${race.icon} ${race.name}`);
    if (cls) titleParts.push(`${cls.icon} ${cls.name}`);

    let desc = '';
    if (cls) desc = cls.desc;
    else if (race) desc = race.desc;

    const focusHtml = cls
      ? `<span class="preview-focus">Foco: ${cls.focus.join(' / ')}</span>`
      : '';

    el.innerHTML = `
      <div class="preview-content">
        <h3>${titleParts.join(' · ')}</h3>
        <div class="preview-meta">
          ${race ? race.tag : ''}
          ${race && cls ? ' · ' : ''}
          ${cls ? `Classe inicial` : ''}
        </div>
        ${focusHtml}
        <p>${desc}</p>
        <div class="preview-stats">
          <span>HP <strong>${hp}</strong></span>
          <span>MP <strong>${mp}</strong></span>
          ${STAT_KEYS.map((k) => `<span>${STAT_LABELS[k]} <strong>${stats[k]}</strong></span>`).join('')}
        </div>
      </div>
    `;
  }

  updateButton(nameInput, btn) {
    const name = nameInput.value.trim();
    let ok = name.length >= 2 && this.selectedClass && this.selectedRace;

    if (ok && this.selectedRace?.flexible) {
      const [a, b] = this.humanBonus;
      ok = !!(a && b && a !== b);
    }

    btn.disabled = !ok;
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => this.container?.remove(), 600);
    }
  }
}
