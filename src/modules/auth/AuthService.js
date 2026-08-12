// src/modules/auth/AuthService.js
// Serviço de autenticação + dados do jogador

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { auth, database } from "../../config/firebase.js";

// Contas que têm poder de administrador do mundo
const ADMIN_ACCOUNTS = ['admin', 'gm', 'gameMaster', 'mestre'];

export class AuthService {
  constructor() {
    this.currentUser = null;
  }

  toEmail(account) {
    return `${account.toLowerCase().trim()}@grpg.local`;
  }

  isAdminAccount(account) {
    return ADMIN_ACCOUNTS.includes(account.toLowerCase().trim());
  }

  async register(account, password) {
    const email = this.toEmail(account);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = this.isAdminAccount(account);

    // Perfil inicial (ainda sem personagem criado)
    await set(ref(database, `players/${user.uid}`), {
      account: account.toLowerCase().trim(),
      displayName: account,
      characterCreated: false,
      isAdmin,
      createdAt: Date.now(),
      level: 1,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      location: 'Cidade dos Iniciantes',
      region: 'Aincrad — Andar 1',
      inventory: [],
      stats: { str: 10, agi: 10, vit: 10, int: 10, dex: 10, luk: 10 }
    });

    this.currentUser = user;
    return user;
  }

  async login(account, password) {
    const email = this.toEmail(account);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    this.currentUser = userCredential.user;
    return userCredential.user;
  }

  async logout() {
    await signOut(auth);
    this.currentUser = null;
  }

  onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  async getPlayerData(uid) {
    const snapshot = await get(ref(database, `players/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  }

  // Salva os dados da criação de personagem
  async saveCharacter(uid, characterData) {
    await update(ref(database, `players/${uid}`), {
      ...characterData,
      characterCreated: true
    });
  }

  // Atualiza qualquer campo do player (usado pelo admin também)
  async updatePlayer(uid, data) {
    await update(ref(database, `players/${uid}`), data);
  }

  // Lista todos os jogadores (apenas admin)
  async getAllPlayers() {
    const snapshot = await get(ref(database, 'players'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([uid, player]) => ({ uid, ...player }));
  }
}
