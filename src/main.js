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
let activeLinkStart = null;

/** Remove imediatamente qualquer UI de entrada (login / link start / criação) */
function clearEntryUI() {
  document.getElementById('login-screen')?.remove();
  document.getElementById('char-creation')?.remove();
  const link = document.getElementById('link-start-container');
  if (link) link.remove();
  if (activeLinkStart) {
    try { activeLinkStart.destroy(); } catch (_) {}
    activeLinkStart = null;
  }
}

async function startApp() {
  authService.onAuthChange(async (user) => {
    if (isStarting) return;

    if (user) {
      const playerData = await authService.getPlayerData(user.uid);
      if (!playerData) {
        await authService.logout();
        return;
      }

      clearEntryUI();

      if (!playerData.characterCreated) {
        showCharacterCreation(user, playerData);
      } else {
        enterWorld(playerData, user.uid);
      }
      return;
    }

    // Não logado
    if (!document.getElementById('login-screen') && !document.getElementById('link-start-container')) {
      playIntro();
    }
  });
}

function playIntro() {
  clearEntryUI();
  document.getElementById('world-screen')?.remove();
  if (currentWorld) {
    currentWorld = null;
  }

  activeLinkStart = new LinkStart(() => {
    showLogin();
  });
  activeLinkStart.play();
}

function showLogin() {
  // Evita login duplicado
  if (document.getElementById('login-screen')) return;

  const loginUI = new LoginUI({
    onLogin: async (account, password) => {
      isStarting = true;
      try {
        const user = await authService.login(account, password);
        const playerData = await authService.getPlayerData(user.uid);

        // Remove login + HUD neural ANTES de entrar no mundo
        clearEntryUI();

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

        clearEntryUI();
        showCharacterCreation(user, playerData);
      } finally {
        isStarting = false;
      }
    }
  });

  loginUI.show();
}

function showCharacterCreation(user, playerData) {
  clearEntryUI();
  document.getElementById('char-creation')?.remove();

  const creation = new CharacterCreation({
    account: playerData.account,
    onComplete: async (characterData) => {
      if (playerData.isAdmin) {
        characterData.isAdmin = true;
      }
      await authService.saveCharacter(user.uid, characterData);
      creation.hide();

      const updated = await authService.getPlayerData(user.uid);
      enterWorld(updated, user.uid);
    }
  });

  creation.show();
}

function enterWorld(playerData, uid) {
  // Garante que nenhuma tela de entrada sobrou
  clearEntryUI();

  if (currentWorld) {
    currentWorld.hide();
    currentWorld = null;
  }

  // Remove world antigo do DOM se existir
  document.getElementById('world-screen')?.remove();

  currentWorld = new WorldUI({
    playerData,
    uid,
    authService,
    onLogout: async () => {
      await authService.logout();
      if (currentWorld) {
        currentWorld.hide();
        currentWorld = null;
      }
      document.getElementById('world-screen')?.remove();
      setTimeout(() => playIntro(), 350);
    }
  });

  currentWorld.show();
}

startApp();
