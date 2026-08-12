// src/modules/auth/LoginUI.js
// Tela de Login idêntica à imagem enviada

export class LoginUI {
  constructor({ onLogin, onRegister }) {
    this.onLogin = onLogin;
    this.onRegister = onRegister;
    this.container = null;
  }

  show() {
    this.createDOM();
    this.bindEvents();
    // Pequeno delay para a animação de entrada
    requestAnimationFrame(() => {
      this.container.classList.add('visible');
    });
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'login-screen';
    this.container.innerHTML = `
      <div class="login-box">
        <div class="login-title">Log in_:</div>
        
        <div class="login-field">
          <label for="account">:account</label>
          <input type="text" id="account" autocomplete="username" spellcheck="false" />
        </div>
        
        <div class="login-field">
          <label for="password">:password</label>
          <input type="password" id="password" autocomplete="current-password" />
        </div>

        <div class="login-actions">
          <button id="btn-login" class="btn-primary">ENTER</button>
          <button id="btn-register" class="btn-secondary">REGISTER</button>
        </div>

        <div id="login-error" class="login-error"></div>
      </div>
    `;

    // Estilos injetados (para manter modular)
    const style = document.createElement('style');
    style.textContent = `
      #login-screen {
        position: fixed;
        inset: 0;
        background: #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.7s ease;
        z-index: 100;
      }
      #login-screen.visible {
        opacity: 1;
      }
      .login-box {
        background: #1a73e8;
        border-radius: 8px;
        padding: 28px 32px 24px;
        width: 340px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        color: #fff;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .login-title {
        font-size: 1.35rem;
        font-weight: 500;
        margin-bottom: 22px;
        letter-spacing: 0.02em;
      }
      .login-field {
        display: flex;
        align-items: center;
        margin-bottom: 14px;
        gap: 10px;
      }
      .login-field label {
        font-size: 0.95rem;
        min-width: 78px;
        text-align: right;
        opacity: 0.95;
      }
      .login-field input {
        flex: 1;
        height: 28px;
        border: none;
        border-radius: 3px;
        padding: 0 10px;
        font-size: 0.95rem;
        background: #fff;
        color: #222;
        outline: none;
      }
      .login-field input:focus {
        box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
      }
      .login-actions {
        display: flex;
        gap: 10px;
        margin-top: 22px;
        justify-content: flex-end;
      }
      .btn-primary, .btn-secondary {
        border: none;
        border-radius: 4px;
        padding: 7px 16px;
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
        border: 1px solid rgba(255,255,255,0.6);
      }
      .btn-secondary:hover {
        background: rgba(255,255,255,0.12);
      }
      .login-error {
        margin-top: 14px;
        font-size: 0.8rem;
        color: #ffcccc;
        min-height: 18px;
        text-align: center;
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
        errorEl.textContent = 'Preencha account e password.';
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
        errorEl.textContent = 'Preencha account e password.';
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'Password precisa ter pelo menos 6 caracteres.';
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

    // Enter no password também loga
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  translateError(err) {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('invalid-credential')) {
      return 'Account ou password incorretos.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Essa account já existe.';
    }
    if (code.includes('weak-password')) {
      return 'Password muito fraca.';
    }
    if (code.includes('invalid-email')) {
      return 'Formato de account inválido.';
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
