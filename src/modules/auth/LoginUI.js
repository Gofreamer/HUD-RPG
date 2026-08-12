// src/modules/auth/LoginUI.js
// Tela de Login melhorada + responsiva + PT-BR

export class LoginUI {
  constructor({ onLogin, onRegister }) {
    this.onLogin = onLogin;
    this.onRegister = onRegister;
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
    this.container = document.createElement('div');
    this.container.id = 'login-screen';
    this.container.innerHTML = `
      <div class="login-box">
        <div class="login-title">Entrar_:</div>
        
        <div class="login-field">
          <label for="account">:conta</label>
          <input type="text" id="account" autocomplete="username" spellcheck="false" placeholder="sua conta" />
        </div>
        
        <div class="login-field">
          <label for="password">:senha</label>
          <input type="password" id="password" autocomplete="current-password" placeholder="sua senha" />
        </div>

        <div class="login-actions">
          <button id="btn-login" class="btn-primary">ENTRAR</button>
          <button id="btn-register" class="btn-secondary">REGISTRAR</button>
        </div>

        <div id="login-error" class="login-error"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #login-screen {
        position: fixed;
        inset: 0;
        background: radial-gradient(ellipse at center, #0f172a 0%, #020617 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.7s ease;
        z-index: 100;
        padding: 20px;
      }
      #login-screen.visible {
        opacity: 1;
      }
      .login-box {
        background: #1a73e8;
        border-radius: 10px;
        padding: 28px 28px 24px;
        width: 100%;
        max-width: 360px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.45);
        color: #fff;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .login-title {
        font-size: 1.4rem;
        font-weight: 500;
        margin-bottom: 24px;
        letter-spacing: 0.03em;
      }
      .login-field {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
      }
      .login-field label {
        font-size: 0.95rem;
        min-width: 70px;
        text-align: right;
        opacity: 0.95;
        flex-shrink: 0;
      }
      .login-field input {
        flex: 1;
        height: 36px;
        border: none;
        border-radius: 4px;
        padding: 0 12px;
        font-size: 0.95rem;
        background: #fff;
        color: #222;
        outline: none;
        min-width: 0;
      }
      .login-field input::placeholder {
        color: #999;
      }
      .login-field input:focus {
        box-shadow: 0 0 0 2px rgba(255,255,255,0.55);
      }
      .login-actions {
        display: flex;
        gap: 10px;
        margin-top: 24px;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      .btn-primary, .btn-secondary {
        border: none;
        border-radius: 5px;
        padding: 9px 18px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        letter-spacing: 0.04em;
        transition: all 0.15s ease;
      }
      .btn-primary {
        background: #fff;
        color: #1a73e8;
      }
      .btn-primary:hover {
        background: #f0f0f0;
      }
      .btn-secondary {
        background: transparent;
        color: #fff;
        border: 1px solid rgba(255,255,255,0.65);
      }
      .btn-secondary:hover {
        background: rgba(255,255,255,0.12);
      }
      .login-error {
        margin-top: 14px;
        font-size: 0.82rem;
        color: #fecaca;
        min-height: 18px;
        text-align: center;
      }

      /* Mobile */
      @media (max-width: 420px) {
        .login-box {
          padding: 24px 20px 20px;
        }
        .login-field {
          flex-direction: column;
          align-items: stretch;
          gap: 6px;
        }
        .login-field label {
          text-align: left;
          min-width: auto;
          font-size: 0.85rem;
        }
        .login-actions {
          justify-content: stretch;
        }
        .btn-primary, .btn-secondary {
          flex: 1;
          text-align: center;
        }
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

    const handleLogin = async () => {
      const account = accountInput.value.trim();
      const password = passwordInput.value;
      if (!account || !password) {
        errorEl.textContent = 'Preencha conta e senha.';
        return;
      }
      errorEl.textContent = 'Conectando...';
      try {
        await this.onLogin(account, password);
      } catch (err) {
        errorEl.textContent = this.translateError(err);
      }
    };

    const handleRegister = async () => {
      const account = accountInput.value.trim();
      const password = passwordInput.value;
      if (!account || !password) {
        errorEl.textContent = 'Preencha conta e senha.';
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
        return;
      }
      errorEl.textContent = 'Criando conta...';
      try {
        await this.onRegister(account, password);
      } catch (err) {
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

  translateError(err) {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('wrong-password')) {
      return 'Conta ou senha incorretos.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Essa conta já existe.';
    }
    if (code.includes('weak-password')) {
      return 'Senha muito fraca.';
    }
    if (code.includes('invalid-email')) {
      return 'Formato de conta inválido.';
    }
    if (code.includes('too-many-requests')) {
      return 'Muitas tentativas. Aguarde um pouco.';
    }
    return err.message || 'Erro desconhecido.';
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => {
        this.container?.remove();
      }, 700);
    }
  }
}
