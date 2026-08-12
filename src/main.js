// src/main.js
// Ponto de entrada do GRPG

import './styles/global.css';
import { LinkStart } from './modules/intro/LinkStart.js';
import { LoginUI } from './modules/auth/LoginUI.js';
import { AuthService } from './modules/auth/AuthService.js';
import { WorldUI } from './modules/world/WorldUI.js';

const authService = new AuthService();
let currentWorld = null;

async function startApp() {
  // Verifica se o usuário já está logado (refresh da página)
  authService.onAuthChange(async (user) => {
    if (user) {
      // Já logado → vai direto pro mundo
      const playerData = await authService.getPlayerData(user.uid);
      if (playerData) {
        enterWorld(playerData);
        return;
      }
    }
    // Não logado → começa a animação
    playIntro();
  });
}

function playIntro() {
  // Remove qualquer tela antiga
  document.getElementById('world-screen')?.remove();
  document.getElementById('login-screen')?.remove();

  const linkStart = new LinkStart(() => {
    showLogin();
  });
  linkStart.play();
}

function showLogin() {
  const loginUI = new LoginUI({
    onLogin: async (account, password) => {
      const user = await authService.login(account, password);
      const playerData = await authService.getPlayerData(user.uid);
      loginUI.hide();
      enterWorld(playerData);
    },
    onRegister: async (account, password) => {
      const user = await authService.register(account, password);
      const playerData = await authService.getPlayerData(user.uid);
      loginUI.hide();
      enterWorld(playerData);
    }
  });

  loginUI.show();
}

function enterWorld(playerData) {
  // Se já existir uma tela de mundo, remove
  if (currentWorld) {
    currentWorld.hide();
  }

  currentWorld = new WorldUI({
    playerData,
    onLogout: async () => {
      await authService.logout();
      currentWorld.hide();
      currentWorld = null;
      // Volta pro Link Start
      setTimeout(() => playIntro(), 300);
    }
  });

  currentWorld.show();
}

// Inicia
startApp();
