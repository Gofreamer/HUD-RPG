// src/config/firebase.js
// Configuração central do Firebase - GRPG

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyACR3nu93-Ps-secKlWd8DXKcKezRw-deQ",
  authDomain: "grpg-335ce.firebaseapp.com",
  databaseURL: "https://grpg-335ce-default-rtdb.firebaseio.com",
  projectId: "grpg-335ce",
  storageBucket: "grpg-335ce.firebasestorage.app",
  messagingSenderId: "1026920310514",
  appId: "1:1026920310514:web:653ee8dff83d3b5fb6126b"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
