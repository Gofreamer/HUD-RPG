// src/main.js
// Ponto de entrada do GRPG

import './styles/global.css';
import { LinkStart } from './modules/intro/LinkStart.js';
import { LoginUI } from './modules/auth/LoginUI.js';
import { AuthService } from './modules/auth/AuthService.js';

const authService = new AuthService();

async function startApp() {
  // 1. Toca a animação Link Start
  const linkStart = new LinkStart(() => {
    // 2. Quando terminar, mostra a tela de login
    showLogin();
  });

  await linkStart.play();
}

function showLogin() {
  const loginUI = new LoginUI({
    onLogin: async (account, password) => {
      await authService.login(account, password);
      loginUI.hide();
      enterWorld();
    },
    onRegister: async (account, password) => {
      await authService.register(account, password);
      loginUI.hide();
      enterWorld();
    }
  });

  loginUI.show();
}

function enterWorld() {
  // Por enquanto só um placeholder
  // Depois vamos criar o módulo world/
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      height:100%;
      background:#0a0a12;
      color:#8ab4f8;
      font-family:system-ui;
      gap:1rem;
    ">
      <h1 style="font-weight:300;letter-spacing:0.2em;">GRPG</h1>
      <p>Link Start completo. Mundo em construção...</p>
      <p style="opacity:0.6;font-size:0.9rem;">Você está logado.</p>
    </div>
  `;
}

// Inicia tudo
startApp();
