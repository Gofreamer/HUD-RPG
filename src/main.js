// src/main.js
// Ponto de entrada do GRPG

import './styles/global.css';
import { LinkStart } from './modules/intro/LinkStart.js';
import { LoginUI } from './modules/auth/LoginUI.js';
import { AuthService } from './modules/auth/AuthService.js';
import { WorldUI } from './modules/world/WorldUI.js';
import { CharacterCreation } from './modules/world/CharacterCreation.js';

const authService = new AuthService();
let currentWorld = null;
let isStarting = false;

async function startApp() {
  authService.onAuthChange(async (user) => {
    if (isStarting) return;

    if (user) {
      const playerData = await authService.getPlayerData(user.uid);
      if (!playerData) {
        // Dados não encontrados, força logout
        await authService.logout();
        return;
      }

      if (!playerData.characterCreated) {
        // Primeiro login → criação de personagem
        showCharacterCreation(user, playerData);
      } else {
        enterWorld(playerData, user.uid);
      }
      return;
    }

    // Não logado
    playIntro();
  });
}

function playIntro() {
  document.getElementById('world-screen')?.remove();
  document.getElementById('login-screen')?.remove();
  document.getElementById('char-creation')?.remove();

  const linkStart = new LinkStart(() => {
    showLogin();
  });
  linkStart.play();
}

function showLogin() {
  const loginUI = new LoginUI({
    onLogin: async (account, password) => {
      isStarting = true;
      try {
        const user = await authService.login(account, password);
        const playerData = await authService.getPlayerData(user.uid);
        loginUI.hide();

        if (!playerData.characterCreated) {
          showCharacterCreation(user, playerData);
        } else {
          enterWorld(playerData, user.uid);
        }
      } finally {
        isStarting = false;
      }
    },
    onRegister: async (account, password) => {
      isStarting = true;
      try {
        const user = await authService.register(account, password);
        const playerData = await authService.getPlayerData(user.uid);
        loginUI.hide();
        showCharacterCreation(user, playerData);
      } finally {
        isStarting = false;
      }
    }
  });

  loginUI.show();
}

function showCharacterCreation(user, playerData) {
  document.getElementById('char-creation')?.remove();

  const creation = new CharacterCreation({
    account: playerData.account,
    onComplete: async (characterData) => {
      // Se for conta admin, mantém a flag
      if (playerData.isAdmin) {
        characterData.isAdmin = true;
      }
      await authService.saveCharacter(user.uid, characterData);
      creation.hide();

      // Busca dados atualizados e entra no mundo
      const updated = await authService.getPlayerData(user.uid);
      enterWorld(updated, user.uid);
    }
  });

  creation.show();
}

function enterWorld(playerData, uid) {
  if (currentWorld) {
    currentWorld.hide();
  }

  currentWorld = new WorldUI({
    playerData,
    uid,
    authService,
    onLogout: async () => {
      await authService.logout();
      currentWorld.hide();
      currentWorld = null;
      setTimeout(() => playIntro(), 300);
    }
  });

  currentWorld.show();
}

// Inicia
startApp();
