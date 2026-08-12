# GRPG — Link Start RPG

RPG imersivo estilo Sword Art Online.

## Stack
- Frontend: Vite + Vanilla JS (modular)
- Auth + DB: Firebase (Auth + Realtime Database)
- Hosting: Cloudflare Pages
- IA: Gemini 3.6 Flash (quando necessário)

## Estrutura modular

```
src/
├── config/firebase.js      → Configuração Firebase
├── modules/
│   ├── intro/LinkStart.js  → Animação Link Start
│   ├── auth/
│   │   ├── AuthService.js  → Lógica de login/registro
│   │   └── LoginUI.js      → Tela de login
│   └── world/              → Mundo in-game (em construção)
└── styles/global.css
```

## Como rodar localmente

```bash
npm install
npm run dev
```

## Deploy (Cloudflare Pages)

1. Suba o repositório no GitHub
2. Conecte no Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `dist`
