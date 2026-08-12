// src/modules/auth/AuthService.js
// Serviço de autenticação com Firebase

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "../../config/firebase.js";

export class AuthService {
  constructor() {
    this.currentUser = null;
  }

  // Converte "account" em email interno (Firebase exige email)
  // Ex: "kirito" → "kirito@grpg.local"
  toEmail(account) {
    return `${account.toLowerCase().trim()}@grpg.local`;
  }

  async register(account, password) {
    const email = this.toEmail(account);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Cria o perfil inicial do jogador no Realtime Database
    await set(ref(database, `players/${user.uid}`), {
      account: account.toLowerCase().trim(),
      displayName: account,
      createdAt: Date.now(),
      level: 1,
      hp: 100,
      maxHp: 100,
      location: "Town of Beginnings",
      inventory: [],
      stats: {
        str: 10,
        agi: 10,
        vit: 10,
        int: 10
      }
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

  // Observa mudanças de autenticação
  onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  // Busca dados do player no Realtime Database
  async getPlayerData(uid) {
    const snapshot = await get(ref(database, `players/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  }
}
