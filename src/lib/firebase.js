// ============================================================================
// firebase.js — Configuración e inicialización de la Base de Datos
// ============================================================================
//
// Este archivo conecta nuestra aplicación con Firebase, que es una
// base de datos en la nube. Piensa en Firebase como un documento
// de Excel compartido en tiempo real donde todos los jugadores pueden
// leer y escribir datos al mismo tiempo. Aquí le decimos a la app
// "conéctate a ESTE documento específico" usando unas credenciales secretas
// (como un usuario y contraseña).
// ============================================================================

// Importamos las herramientas necesarias de Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Estas son las "credenciales" de tu base de datos.
// Son como la dirección, usuario y contraseña que necesitas para conectarte
// a un WiFi específico. Se leen de un archivo secreto (.env.local) que
// NO se sube a internet por seguridad.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Aquí nos aseguramos de conectarnos a Firebase UNA SOLA VEZ.
// Si ya estamos conectados, simplemente reutilizamos esa conexión.
// Es como abrir una app de mensajería: si ya está abierta, no la abres de nuevo.
let app = null;
let database = null;

// Solo intentamos conectarnos si tenemos las credenciales configuradas
if (firebaseConfig.databaseURL) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // 'database' es el objeto principal que usaremos para LEER y ESCRIBIR datos
  // a lo largo de todo el juego. Es nuestra puerta de entrada.
  database = getDatabase(app);
}

// Exportamos la base de datos para que otras partes del juego puedan usarla
export { database };
export default app;
