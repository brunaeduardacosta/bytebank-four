import { initializeApp } from "firebase/app";

// Ignoramos o aviso do TypeScript, pois sabemos que a função funciona nativamente
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDB7I0nE7I9KQcZv9ZBQndBldgxwzW8STc",
  authDomain: "tech-challenge-fiap-77d29.firebaseapp.com",
  projectId: "tech-challenge-fiap-77d29",
  storageBucket: "tech-challenge-fiap-77d29.firebasestorage.app",
  messagingSenderId: "533590741058",
  appId: "1:533590741058:web:0261b1949de46e32999ddb",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

// --- CORREÇÃO AQUI ---
// Forçamos o Firebase a olhar para o bucket correto usando o protocolo gs://
export const storage = getStorage(app, "gs://tech-challenge-fiap-77d29.firebasestorage.app");