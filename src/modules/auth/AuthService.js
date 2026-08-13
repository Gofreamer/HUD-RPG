// src/modules/auth/AuthService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get, update, onValue, off, push, remove } from "firebase/database";
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

  defaultPlayer(account, isAdmin = false) {
    return {
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
      region: 'Genesis — Zona Inicial',
      zoneType: 'safe', // safe | combat
      condition: 'normal', // normal | ferido | exausto | critico
      guild: '',
      guildId: '',
      guildTag: '',
      guildRole: '',
      avatarUrl: '',
      inventory: [],
      skills: [],
      party: [],
      equipment: {
        cabeca: null, peito: null, maos: null, pernas: null,
        pes: null, arma: null, acessorio1: null, acessorio2: null
      },
      titles: [],
      activeTitle: null,
      notes: '',
      appearance: '',
      stats: { str: 10, agi: 10, vit: 10, int: 10, dex: 10, luk: 10 }
    };
  }

  async register(account, password) {
    const email = this.toEmail(account);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = this.isAdminAccount(account);
    await set(ref(database, `players/${user.uid}`), this.defaultPlayer(account, isAdmin));
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

  listenPlayer(uid, callback) {
    this.stopPlayerListener();
    const playerRef = ref(database, `players/${uid}`);
    const handler = (snapshot) => {
      if (snapshot.exists()) callback(snapshot.val());
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

  // ─── Guild system ───────────────────────────────────────────

  async getGuild(guildId) {
    if (!guildId) return null;
    const snapshot = await get(ref(database, `guilds/${guildId}`));
    return snapshot.exists() ? { id: guildId, ...snapshot.val() } : null;
  }

  async getAllGuilds() {
    const snapshot = await get(ref(database, 'guilds'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([id, g]) => ({ id, ...g }));
  }

  async getActiveGuilds() {
    const all = await this.getAllGuilds();
    return all.filter((g) => g.status === 'active');
  }

  async getPendingGuilds() {
    const all = await this.getAllGuilds();
    return all.filter((g) => g.status === 'pending');
  }

  normalizeTag(tag) {
    return String(tag || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5);
  }

  async createGuild(uid, player, { name, tag, description }) {
    const cleanName = String(name || '').trim();
    const cleanTag = this.normalizeTag(tag);
    const cleanDesc = String(description || '').trim();

    if (cleanName.length < 2) throw new Error('Nome da guilda precisa ter pelo menos 2 caracteres.');
    if (cleanTag.length < 2) throw new Error('Sigla precisa ter 2 a 5 caracteres (A-Z, 0-9).');
    if (player.guildId) throw new Error('Você já pertence a uma guilda.');

    const all = await this.getAllGuilds();
    const nameTaken = all.some(
      (g) => g.status !== 'rejected' && String(g.name).toLowerCase() === cleanName.toLowerCase()
    );
    if (nameTaken) throw new Error('Já existe uma guilda com esse nome.');
    const tagTaken = all.some(
      (g) => g.status !== 'rejected' && this.normalizeTag(g.tag) === cleanTag
    );
    if (tagTaken) throw new Error('Essa sigla já está em uso.');

    const guildRef = push(ref(database, 'guilds'));
    const guildId = guildRef.key;
    const guild = {
      name: cleanName,
      tag: cleanTag,
      description: cleanDesc,
      leaderUid: uid,
      leaderName: player.displayName || player.account || '—',
      status: 'pending',
      members: [
        {
          uid,
          name: player.displayName || player.account || '—',
          role: 'leader',
          fictional: false
        }
      ],
      joinRequests: [],
      createdAt: Date.now(),
      approvedAt: null,
      approvedBy: null
    };

    await set(guildRef, guild);
    await this.updatePlayer(uid, {
      guild: cleanName,
      guildId,
      guildTag: cleanTag,
      guildRole: 'leader'
    });

    return { id: guildId, ...guild };
  }

  async requestJoinGuild(uid, player, guildId) {
    if (player.guildId) throw new Error('Você já pertence a uma guilda.');
    const guild = await this.getGuild(guildId);
    if (!guild || guild.status !== 'active') throw new Error('Guilda indisponível.');

    const members = Array.isArray(guild.members) ? guild.members : [];
    if (members.some((m) => m.uid === uid)) throw new Error('Você já é membro.');

    const requests = Array.isArray(guild.joinRequests) ? [...guild.joinRequests] : [];
    if (requests.some((r) => r.uid === uid)) throw new Error('Pedido já enviado.');

    requests.push({
      uid,
      name: player.displayName || player.account || '—',
      requestedAt: Date.now()
    });
    await update(ref(database, `guilds/${guildId}`), { joinRequests: requests });
    return true;
  }

  async cancelJoinRequest(uid, guildId) {
    const guild = await this.getGuild(guildId);
    if (!guild) return;
    const requests = (Array.isArray(guild.joinRequests) ? guild.joinRequests : []).filter(
      (r) => r.uid !== uid
    );
    await update(ref(database, `guilds/${guildId}`), { joinRequests: requests });
  }

  async leaveGuild(uid, player) {
    const guildId = player.guildId;
    if (!guildId) throw new Error('Você não está em uma guilda.');

    const guild = await this.getGuild(guildId);
    if (guild) {
      const members = Array.isArray(guild.members) ? guild.members : [];
      const me = members.find((m) => m.uid === uid);
      if (me?.role === 'leader' && guild.status === 'active') {
        const realMembers = members.filter((m) => !m.fictional && m.uid !== uid);
        if (realMembers.length > 0) {
          throw new Error('Líder não pode sair enquanto houver outros membros. Transfira a liderança ou dissolva via Admin.');
        }
      }
      const nextMembers = members.filter((m) => m.uid !== uid);
      const nextRequests = (Array.isArray(guild.joinRequests) ? guild.joinRequests : []).filter(
        (r) => r.uid !== uid
      );
      if (nextMembers.filter((m) => !m.fictional).length === 0 && guild.status === 'pending') {
        await remove(ref(database, `guilds/${guildId}`));
      } else {
        await update(ref(database, `guilds/${guildId}`), {
          members: nextMembers,
          joinRequests: nextRequests
        });
      }
    }

    await this.updatePlayer(uid, {
      guild: '',
      guildId: '',
      guildTag: '',
      guildRole: ''
    });
  }

  async approveGuild(guildId, adminUid) {
    const guild = await this.getGuild(guildId);
    if (!guild) throw new Error('Guilda não encontrada.');
    if (guild.status === 'active') return guild;

    await update(ref(database, `guilds/${guildId}`), {
      status: 'active',
      approvedAt: Date.now(),
      approvedBy: adminUid || null
    });
    return { ...guild, status: 'active' };
  }

  async rejectGuild(guildId) {
    const guild = await this.getGuild(guildId);
    if (!guild) throw new Error('Guilda não encontrada.');

    const members = Array.isArray(guild.members) ? guild.members : [];
    for (const m of members) {
      if (m.fictional || !m.uid) continue;
      await this.updatePlayer(m.uid, {
        guild: '',
        guildId: '',
        guildTag: '',
        guildRole: ''
      });
    }
    await update(ref(database, `guilds/${guildId}`), {
      status: 'rejected',
      members: [],
      joinRequests: []
    });
  }

  async updateGuild(guildId, patch) {
    const guild = await this.getGuild(guildId);
    if (!guild) throw new Error('Guilda não encontrada.');

    const data = { ...patch };
    if (data.tag != null) data.tag = this.normalizeTag(data.tag);
    if (data.name != null) data.name = String(data.name).trim();

    await update(ref(database, `guilds/${guildId}`), data);

    // Sync display fields on real members if name/tag changed
    if (data.name != null || data.tag != null) {
      const members = Array.isArray(guild.members) ? guild.members : [];
      const name = data.name != null ? data.name : guild.name;
      const tag = data.tag != null ? data.tag : guild.tag;
      for (const m of members) {
        if (m.fictional || !m.uid) continue;
        await this.updatePlayer(m.uid, { guild: name, guildTag: tag });
      }
    }
  }

  async addGuildMember(guildId, member) {
    const guild = await this.getGuild(guildId);
    if (!guild) throw new Error('Guilda não encontrada.');

    const members = Array.isArray(guild.members) ? [...guild.members] : [];
    const entry = {
      uid: member.uid || `fic_${Date.now()}`,
      name: String(member.name || 'Membro').trim(),
      role: member.role || 'member',
      fictional: !!member.fictional
    };

    if (!entry.fictional && member.uid) {
      if (members.some((m) => m.uid === member.uid)) throw new Error('Já é membro.');
      members.push(entry);
      await update(ref(database, `guilds/${guildId}`), { members });
      await this.updatePlayer(member.uid, {
        guild: guild.name,
        guildId,
        guildTag: guild.tag,
        guildRole: entry.role
      });
    } else {
      members.push(entry);
      await update(ref(database, `guilds/${guildId}`), { members });
    }
    return entry;
  }

  async removeGuildMember(guildId, memberUid) {
    const guild = await this.getGuild(guildId);
    if (!guild) throw new Error('Guilda não encontrada.');

    const members = Array.isArray(guild.members) ? guild.members : [];
    const target = members.find((m) => m.uid === memberUid);
    const next = members.filter((m) => m.uid !== memberUid);
    await update(ref(database, `guilds/${guildId}`), { members: next });

    if (target && !target.fictional && target.uid && !String(target.uid).startsWith('fic_')) {
      await this.updatePlayer(target.uid, {
        guild: '',
        guildId: '',
        guildTag: '',
        guildRole: ''
      });
    }
  }

  async acceptJoinRequest(guildId, requestUid) {
    const guild = await this.getGuild(guildId);
    if (!guild) throw new Error('Guilda não encontrada.');

    const requests = Array.isArray(guild.joinRequests) ? guild.joinRequests : [];
    const req = requests.find((r) => r.uid === requestUid);
    if (!req) throw new Error('Pedido não encontrado.');

    const members = Array.isArray(guild.members) ? [...guild.members] : [];
    if (!members.some((m) => m.uid === requestUid)) {
      members.push({
        uid: requestUid,
        name: req.name,
        role: 'member',
        fictional: false
      });
    }
    const nextRequests = requests.filter((r) => r.uid !== requestUid);
    await update(ref(database, `guilds/${guildId}`), {
      members,
      joinRequests: nextRequests
    });
    await this.updatePlayer(requestUid, {
      guild: guild.name,
      guildId,
      guildTag: guild.tag,
      guildRole: 'member'
    });
  }

  async denyJoinRequest(guildId, requestUid) {
    const guild = await this.getGuild(guildId);
    if (!guild) return;
    const next = (Array.isArray(guild.joinRequests) ? guild.joinRequests : []).filter(
      (r) => r.uid !== requestUid
    );
    await update(ref(database, `guilds/${guildId}`), { joinRequests: next });
  }
}
