// src/modules/auth/LoginUI.js
// Tela de login neural — continuação visual do LINK START
// Lógica de autenticação preservada (onLogin / onRegister)

export class LoginUI {
  constructor({ onLogin, onRegister }) {
    this.onLogin = onLogin;
    this.onRegister = onRegister;
    this.container = null;
    this._busy = false;
  }

  show() {
    this.createDOM();
    this.bindEvents();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.container.classList.add('visible');
      });
    });
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'login-screen';
    this.container.innerHTML = `
      <div class="neural-frame">
        <!-- Header -->
        <div class="neural-header">
          <div class="nh-title">LINK START</div>
          <div class="nh-sub">NEURAL LINK // ONLINE</div>
        </div>

        <!-- Side status -->
        <div class="neural-side left">■ SYS. OK</div>
        <div class="neural-side right">LINK STABLE ■</div>

        <!-- Auth panel -->
        <div class="neural-panel">
          <div class="np-corner tl"></div>
          <div class="np-corner tr"></div>
          <div class="np-corner bl"></div>
          <div class="np-corner br"></div>

          <div class="np-heading">WELCOME BACK</div>
          <div class="np-status">NEURAL ID AUTHENTICATION</div>

          <div class="np-field">
            <label for="account">PLAYER ID</label>
            <div class="np-input-wrap">
              <input type="text" id="account" autocomplete="username" spellcheck="false" placeholder="digite seu player id" />
              <span class="np-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </span>
            </div>
          </div>

          <div class="np-field">
            <label for="password">ACCESS KEY</label>
            <div class="np-input-wrap">
              <input type="password" id="password" autocomplete="current-password" placeholder="digite sua access key" />
              <span class="np-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
              </span>
            </div>
          </div>

          <button id="btn-login" class="np-connect" type="button">
            <span class="np-connect-text">CONNECT</span>
            <span class="np-connect-arrow">»</span>
          </button>

          <button id="btn-register" class="np-register" type="button">NEW USER // CREATE ID</button>

          <div id="login-error" class="np-error"></div>
          <div id="login-status" class="np-auth-status"></div>
        </div>

        <!-- Footer -->
        <div class="neural-footer">
          <div class="nf-glyph">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,180,255,0.45)" stroke-width="1.2">
              <path d="M12 2 L22 20 H2 Z"/>
              <path d="M12 8 L17 18 H7 Z"/>
            </svg>
          </div>
          <div class="nf-text">PREPARE TO ENTER<br>THE WORLD</div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #login-screen {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        opacity: 0;
        transition: opacity 0.9s ease;
        padding: 20px;
        pointer-events: none;
      }
      #login-screen.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .neural-frame {
        position: relative;
        width: 100%;
        max-width: 480px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
      }

      /* Header */
      .neural-header {
        text-align: center;
        margin-bottom: 28px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.7s ease 0.15s;
      }
      #login-screen.visible .neural-header {
        opacity: 1;
        transform: none;
      }
      .nh-title {
        font-size: 1.55rem;
        font-weight: 300;
        letter-spacing: 0.55em;
        color: #e8f1ff;
        text-shadow: 0 0 28px rgba(100, 180, 255, 0.45);
        padding-left: 0.55em;
      }
      .nh-sub {
        margin-top: 6px;
        font-size: 0.68rem;
        letter-spacing: 0.28em;
        color: #5b8fd4;
        font-weight: 500;
      }

      /* Side labels */
      .neural-side {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.62rem;
        letter-spacing: 0.18em;
        color: rgba(100, 180, 255, 0.4);
        font-weight: 500;
        pointer-events: none;
        opacity: 0;
        transition: opacity 1s ease 0.5s;
      }
      #login-screen.visible .neural-side { opacity: 1; }
      .neural-side.left { left: 18px; }
      .neural-side.right { right: 18px; }

      /* Panel */
      .neural-panel {
        position: relative;
        width: 100%;
        background: rgba(6, 14, 28, 0.72);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(80, 160, 255, 0.28);
        border-radius: 4px;
        padding: 32px 36px 28px;
        box-shadow:
          0 0 40px rgba(40, 120, 255, 0.08),
          inset 0 0 40px rgba(40, 100, 200, 0.04);
        opacity: 0;
        transform: scale(0.96);
        transition: all 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s;
      }
      #login-screen.visible .neural-panel {
        opacity: 1;
        transform: scale(1);
      }

      /* Corner cuts */
      .np-corner {
        position: absolute;
        width: 12px;
        height: 12px;
        border-color: rgba(100, 190, 255, 0.55);
        border-style: solid;
      }
      .np-corner.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
      .np-corner.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
      .np-corner.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
      .np-corner.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

      .np-heading {
        text-align: center;
        font-size: 1.05rem;
        font-weight: 400;
        letter-spacing: 0.42em;
        color: #f0f6ff;
        padding-left: 0.42em;
        margin-bottom: 6px;
      }
      .np-status {
        text-align: center;
        font-size: 0.62rem;
        letter-spacing: 0.22em;
        color: #4a7ab8;
        margin-bottom: 26px;
        font-weight: 500;
      }

      .np-field {
        margin-bottom: 16px;
      }
      .np-field label {
        display: block;
        font-size: 0.62rem;
        letter-spacing: 0.2em;
        color: #6a9ad4;
        margin-bottom: 7px;
        font-weight: 600;
      }
      .np-input-wrap {
        position: relative;
      }
      .np-input-wrap input {
        width: 100%;
        height: 42px;
        background: rgba(2, 8, 20, 0.85);
        border: 1px solid rgba(70, 140, 220, 0.3);
        border-radius: 2px;
        color: #e2eaf8;
        font-size: 0.9rem;
        padding: 0 40px 0 14px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
      }
      .np-input-wrap input::placeholder {
        color: rgba(140, 170, 200, 0.35);
      }
      .np-input-wrap input:focus {
        border-color: rgba(100, 180, 255, 0.65);
        box-shadow: 0 0 0 3px rgba(60, 140, 255, 0.12), 0 0 16px rgba(60, 140, 255, 0.1);
      }
      .np-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(100, 170, 230, 0.45);
        display: flex;
        pointer-events: none;
      }

      /* Connect button */
      .np-connect {
        width: 100%;
        height: 46px;
        margin-top: 10px;
        background: rgba(8, 24, 48, 0.9);
        border: 1px solid rgba(80, 170, 255, 0.5);
        border-radius: 2px;
        color: #c8e0ff;
        font-size: 0.88rem;
        font-weight: 500;
        letter-spacing: 0.35em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        position: relative;
        transition: all 0.2s ease;
        padding-left: 0.35em;
        opacity: 0;
        transition: opacity 0.5s ease 0.55s, background 0.2s, box-shadow 0.2s, border-color 0.2s;
      }
      #login-screen.visible .np-connect { opacity: 1; }
      .np-connect::before,
      .np-connect::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        border: 1px solid rgba(100, 180, 255, 0.4);
        transform: translateY(-50%) rotate(45deg);
      }
      .np-connect::before { left: 14px; border-right: none; border-top: none; }
      .np-connect::after { right: 14px; border-left: none; border-bottom: none; }
      .np-connect:hover:not(:disabled) {
        background: rgba(20, 50, 100, 0.85);
        border-color: rgba(120, 200, 255, 0.75);
        box-shadow: 0 0 22px rgba(60, 150, 255, 0.2);
        color: #fff;
      }
      .np-connect:disabled {
        opacity: 0.6;
        cursor: wait;
      }
      .np-connect-arrow {
        letter-spacing: 0;
        font-size: 1.1rem;
        opacity: 0.7;
      }

      /* Register secondary */
      .np-register {
        display: block;
        width: 100%;
        margin-top: 16px;
        background: none;
        border: none;
        color: rgba(100, 160, 220, 0.55);
        font-size: 0.68rem;
        letter-spacing: 0.2em;
        cursor: pointer;
        text-align: center;
        padding: 8px;
        transition: color 0.2s;
        font-family: inherit;
      }
      .np-register:hover {
        color: rgba(140, 200, 255, 0.9);
      }

      .np-error {
        margin-top: 12px;
        min-height: 18px;
        text-align: center;
        font-size: 0.78rem;
        color: #fca5a5;
        letter-spacing: 0.04em;
      }

      .np-auth-status {
        margin-top: 8px;
        min-height: 18px;
        text-align: center;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        color: #7dd3fc;
        font-weight: 500;
      }

      /* Footer */
      .neural-footer {
        margin-top: 32px;
        text-align: center;
        opacity: 0;
        transition: opacity 1s ease 0.7s;
      }
      #login-screen.visible .neural-footer { opacity: 1; }
      .nf-glyph { margin-bottom: 8px; opacity: 0.7; }
      .nf-text {
        font-size: 0.6rem;
        letter-spacing: 0.28em;
        color: rgba(100, 150, 200, 0.4);
        line-height: 1.6;
      }

      /* Mobile */
      @media (max-width: 560px) {
        #login-screen { padding: 16px 12px; }
        .nh-title { font-size: 1.1rem; letter-spacing: 0.32em; }
        .nh-sub { font-size: 0.6rem; letter-spacing: 0.18em; }
        .neural-header { margin-bottom: 18px; }
        .neural-panel { padding: 22px 16px 18px; }
        .np-heading { font-size: 0.85rem; letter-spacing: 0.24em; }
        .np-status { font-size: 0.58rem; margin-bottom: 18px; }
        .np-field { margin-bottom: 12px; }
        .np-input-wrap input { height: 40px; font-size: 0.88rem; }
        .neural-side { display: none; }
        .np-connect { letter-spacing: 0.2em; height: 44px; font-size: 0.82rem; }
        .np-connect::before, .np-connect::after { display: none; }
        .np-register { font-size: 0.62rem; letter-spacing: 0.12em; }
        .neural-footer { margin-top: 22px; }
        .nf-text { font-size: 0.55rem; letter-spacing: 0.18em; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  bindEvents() {
    const accountInput = this.container.querySelector('#account');
    const passwordInput = this.container.querySelector('#password');
    const btnLogin = this.container.querySelector('#btn-login');
    const btnRegister = this.container.querySelector('#btn-register');
    const errorEl = this.container.querySelector('#login-error');
    const statusEl = this.container.querySelector('#login-status');

    const setBusy = (busy, statusText = '') => {
      this._busy = busy;
      btnLogin.disabled = busy;
      btnRegister.disabled = busy;
      statusEl.textContent = statusText;
    };

    const handleLogin = async () => {
      if (this._busy) return;
      const account = accountInput.value.trim();
      const password = passwordInput.value;
      if (!account || !password) {
        errorEl.textContent = 'Preencha Player ID e Access Key.';
        return;
      }
      errorEl.textContent = '';
      setBusy(true, 'AUTHENTICATING...');
      await this.wait(320);
      try {
        await this.onLogin(account, password);
        // Sucesso: main.js chama hide() e navega
        statusEl.textContent = 'IDENTITY CONFIRMED';
      } catch (err) {
        setBusy(false, '');
        errorEl.textContent = this.translateError(err);
      }
    };

    const handleRegister = async () => {
      if (this._busy) return;
      const account = accountInput.value.trim();
      const password = passwordInput.value;
      if (!account || !password) {
        errorEl.textContent = 'Preencha Player ID e Access Key.';
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'A Access Key precisa ter pelo menos 6 caracteres.';
        return;
      }
      errorEl.textContent = '';
      setBusy(true, 'CREATING NEURAL ID...');
      try {
        await this.onRegister(account, password);
        statusEl.textContent = 'IDENTITY CREATED';
        await this.wait(400);
      } catch (err) {
        setBusy(false, '');
        errorEl.textContent = this.translateError(err);
      }
    };

    btnLogin.addEventListener('click', handleLogin);
    btnRegister.addEventListener('click', handleRegister);
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    accountInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') passwordInput.focus();
    });
  }

  wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  translateError(err) {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('wrong-password')) {
      return 'Player ID ou Access Key incorretos.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Este Player ID já existe.';
    }
    if (code.includes('weak-password')) {
      return 'Access Key muito fraca.';
    }
    if (code.includes('invalid-email')) {
      return 'Formato de Player ID inválido.';
    }
    if (code.includes('too-many-requests')) {
      return 'Muitas tentativas. Aguarde um momento.';
    }
    return err.message || 'Erro de autenticação.';
  }

  hide() {
    // Remoção imediata — evita login sobreposto ao mundo
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    document.getElementById('link-start-container')?.remove();
  }
}
