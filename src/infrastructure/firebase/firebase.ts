import { initializeApp } from "firebase/app";
import { Platform } from "react-native";

// @ts-ignore
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";

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

// --- CORREÇÃO AQUI ---
// Verifica a plataforma para usar a persistência correta
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

// Forçamos o Firebase a olhar para o bucket correto usando o protocolo gs://
export const storage = getStorage(app, "gs://tech-challenge-fiap-77d29.firebasestorage.app");