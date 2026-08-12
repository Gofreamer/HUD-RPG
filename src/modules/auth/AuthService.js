// src/modules/auth/AuthService.js
// Serviço de autenticação + dados do jogador + tempo real

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get, update, onValue, off } from "firebase/database";
import { auth, database } from "../../config/firebase.js";

const ADMIN_ACCOUNTS = ['admin', 'gm', 'gameMaster', 'mestre'];

export class AuthService {
  constructor() {
    this.currentUser = null;
    this._playerUnsub = null;
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
    this.stopPlayerListener();
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

  async saveCharacter(uid, characterData) {
    await update(ref(database, `players/${uid}`), {
      ...characterData,
      characterCreated: true
    });
  }

  async updatePlayer(uid, data) {
    await update(ref(database, `players/${uid}`), data);
  }

  async getAllPlayers() {
    const snapshot = await get(ref(database, 'players'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([uid, player]) => ({ uid, ...player }));
  }

  // Listener em tempo real do player
  listenPlayer(uid, callback) {
    this.stopPlayerListener();
    const playerRef = ref(database, `players/${uid}`);
    const handler = (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    };
    onValue(playerRef, handler);
    this._playerUnsub = () => off(playerRef, 'value', handler);
  }

  stopPlayerListener() {
    if (this._playerUnsub) {
      this._playerUnsub();
      this._playerUnsub = null;
    }
  }
}
