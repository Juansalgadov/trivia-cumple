# 🎂 Trivia de Cumpleaños — Real-Time Quiz Game

> Aplicación web interactiva en tiempo real estilo **Kahoot!** para celebrar cumpleaños. El host controla el juego desde un PC/TV y los invitados responden desde sus celulares escaneando un código QR.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-orange?logo=firebase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Guía de Instalación Local](#-guía-de-instalación-local)
- [Configuración de Firebase](#-configuración-de-firebase)
- [Variables de Entorno](#-variables-de-entorno)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [Cómo Funciona el Juego](#-cómo-funciona-el-juego)
- [Sistema de Puntuación](#-sistema-de-puntuación)

---

## 🎯 Descripción

Trivia interactiva diseñada para eventos presenciales. La dinámica es simple:

1. **El Host** abre `/host` en su PC y duplica pantalla a una TV.
2. **Los invitados** escanean un QR con sus celulares y acceden a `/join`.
3. Se juegan **14 preguntas de selección múltiple** + **1 pregunta abierta**.
4. Al final se muestra un **ranking con notas** usando la escala chilena.

### Características principales:
- ⚡ Sincronización en **tiempo real** vía Firebase
- 📱 Interfaz móvil optimizada para invitados
- 🖥️ Vista de TV para el host con QR y controles
- 🎨 Diseño premium con glassmorphism y animaciones
- 📊 Sistema de puntuación con escala lineal chilena
- 🔒 Pregunta 15 con **censura** (barras negras) y revelado manual
- 🏆 Leaderboard final con animación para nota perfecta (8.0)

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Rol |
|---|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | Frontend + routing |
| **Base de datos** | [Firebase Realtime Database](https://firebase.google.com/docs/database) | Sincronización en tiempo real |
| **Estilos** | CSS Modules (Vanilla CSS) | Diseño modular sin dependencias |
| **QR Code** | [qrcode.react](https://github.com/zpao/qrcode.react) | Generación de QR estático |
| **Deploy** | [Vercel](https://vercel.com/) | Hosting y CI/CD automático |
| **Fuentes** | Google Fonts (Inter + Outfit) | Tipografía premium |

---

## 📁 Estructura del Proyecto

```
trivia-cumple/
├── .env.local.example       # Template de variables de entorno
├── .gitignore
├── README.md                # Este archivo
├── package.json
├── next.config.mjs
│
├── public/                  # Archivos estáticos
│   └── favicon.ico
│
└── src/
    ├── app/
    │   ├── globals.css      # 🎨 Design system global
    │   ├── layout.js        # Layout raíz (como @Configuration)
    │   ├── page.js          # Landing page "/"
    │   ├── page.module.css
    │   │
    │   ├── host/            # 🖥️ Vista del Host (PC/TV)
    │   │   ├── page.js      # Controlador principal del juego
    │   │   └── host.module.css
    │   │
    │   └── join/            # 📱 Vista del Jugador (Móvil)
    │       ├── page.js      # Controlador del jugador
    │       └── join.module.css
    │
    ├── lib/                 # 📦 Lógica de negocio (Servicios)
    │   ├── firebase.js      # Config Firebase (@Configuration)
    │   ├── questions.js     # Banco de preguntas (@Repository)
    │   ├── gameService.js   # Lógica del juego (@Service)
    │   └── scoreService.js  # Cálculo de notas (@Service)
    │
    └── components/          # 🧩 Componentes de UI (Fragmentos)
        ├── Lobby.js         # Sala de espera + QR
        ├── QuestionDisplay.js # Pregunta en TV
        ├── AnswerButtons.js # Botones de respuesta (móvil)
        ├── ResultsChart.js  # Gráfico de resultados
        ├── OpenQuestion.js  # Pregunta 15 con censura
        ├── Leaderboard.js   # Ranking final
        ├── QRDisplay.js     # Componente de QR
        └── *.module.css     # Estilos de cada componente
```

---

## 🚀 Guía de Instalación Local

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) (viene con Node.js)
- Una cuenta de [Firebase](https://firebase.google.com/) (gratis)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/trivia-cumple.git
cd trivia-cumple

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Firebase (ver sección siguiente)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en:
- **Landing:** http://localhost:3000
- **Host:** http://localhost:3000/host
- **Jugador:** http://localhost:3000/join

---

## 🔥 Configuración de Firebase

### Paso 1: Crear un proyecto de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en **"Agregar proyecto"**
3. Nombre: `trivia-cumple-juan` (o el que prefieras)
4. Puedes desactivar Google Analytics (no es necesario)
5. Click en **"Crear proyecto"**

### Paso 2: Crear Realtime Database

1. En el menú lateral, ve a **"Compilación" → "Realtime Database"**
2. Click en **"Crear base de datos"**
3. Ubicación: **United States (us-central1)** (recomendado)
4. Reglas de seguridad: selecciona **"Iniciar en modo de prueba"**
   - ⚠️ Las reglas de prueba expiran en 30 días — suficiente para tu evento
5. Click en **"Habilitar"**
6. **Copia la URL de tu base de datos** (ej: `https://trivia-cumple-juan-default-rtdb.firebaseio.com`)

### Paso 3: Registrar tu app web

1. En la página principal del proyecto, click en el ícono **"</>"** (Web)
2. Nickname: `trivia-web`
3. **NO** marques "Firebase Hosting"
4. Click en **"Registrar app"**
5. Te mostrará el código de configuración. **Copia estos valores:**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← Copia esto
  authDomain: "trivia-cumple-juan.firebaseapp.com",
  databaseURL: "https://trivia-cumple-juan-default-rtdb.firebaseio.com",
  projectId: "trivia-cumple-juan",
  storageBucket: "trivia-cumple-juan.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (puedes copiar `.env.local.example`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trivia-cumple-juan.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://trivia-cumple-juan-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=trivia-cumple-juan
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=trivia-cumple-juan.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Después de desplegar en Vercel, actualiza esta URL:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Nota:** Las variables `NEXT_PUBLIC_*` son accesibles desde el navegador. Firebase API keys son seguras de exponer públicamente — la seguridad se maneja con las Firebase Security Rules.

---

## 🌐 Despliegue en Vercel

### Paso 1: Subir a GitHub

```bash
# Inicializar git (si no lo has hecho)
git init
git add .
git commit -m "🎂 Trivia de cumpleaños - versión inicial"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/tu-usuario/trivia-cumple.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com/) e inicia sesión con GitHub
2. Click en **"New Project"**
3. Importa el repositorio `trivia-cumple`
4. **Framework Preset:** Next.js (se detecta automáticamente)
5. **Root Directory:** `./` (raíz del repo)
6. En **"Environment Variables"**, agrega TODAS las variables de tu `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = tu valor
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = tu valor
   - ... (todas las demás)
   - `NEXT_PUBLIC_APP_URL` = `https://tu-proyecto.vercel.app` (la URL que Vercel te asigne)
7. Click en **"Deploy"**

### Paso 3: Actualizar la URL del QR

Una vez desplegado, Vercel te dará una URL como `https://trivia-cumple-abc123.vercel.app`.

1. Ve a la configuración del proyecto en Vercel → **Environment Variables**
2. Actualiza `NEXT_PUBLIC_APP_URL` con tu URL de Vercel
3. Redespliega (Vercel lo hace automáticamente al guardar)

---

## 🎮 Cómo Funciona el Juego

### Fase 1: Lobby
- El host abre `/host` → se crea una partida automáticamente
- Los jugadores escanean el QR o abren `/join` → ingresan su nombre
- Los nombres aparecen en tiempo real en la TV
- El host presiona **"INICIAR JUEGO"** cuando todos estén listos

### Fase 2: Trivia (Preguntas 1-14)
- La TV muestra la pregunta con 4 opciones de colores
- Los jugadores ven las opciones en sus celulares y eligen una
- El host ve cuántos han respondido y cierra la votación
- Se muestran los resultados con la respuesta correcta resaltada
- El host avanza a la siguiente pregunta

### Fase 3: Pregunta 15 (Abierta)
- Los jugadores escriben su respuesta en un textarea
- En la TV, las respuestas aparecen como **barras negras** (censuradas)
- El host ingresa la contraseña `juan27` para revelar cada respuesta
- El host puede asignar un **punto bonus** a quien quiera

### Fase 4: Leaderboard Final
- Ranking ordenado por nota (de mayor a menor)
- Notas calculadas con la fórmula chilena
- Animación especial de confetti para quien obtenga **8.0**

---

## 📊 Sistema de Puntuación

### Fórmula (Escala Lineal Chilena)

```
Nota = 1.0 + (Puntaje × 6 / 14)
```

| Puntaje | Nota |
|---------|------|
| 0/14 | 1.0 |
| 4/14 | 2.7 |
| 7/14 | 4.0 |
| 10/14 | 5.3 |
| 14/14 | 7.0 |
| 14/14 + bonus | **8.0** ✨ |

### Regla especial — Pregunta 15
- La pregunta 15 es de **bonus manual** (+1 punto).
- Si un jugador tiene 14/14 + bonus → la nota se **fuerza a 8.0** (hardcoded).
- Si tiene menos de 14/14 + bonus → se suma 1 punto y se aplica la fórmula normal.

---

## 📝 Notas para el Desarrollador

- Todo el código JavaScript tiene comentarios exhaustivos con **analogías Java/Spring Boot**.
- Los archivos en `src/lib/` son equivalentes a `@Service` y `@Repository` de Spring.
- Los componentes en `src/components/` son como fragmentos de Thymeleaf.
- Las páginas en `src/app/` son como `@Controller` con `@GetMapping`.
- `useState` es como un campo `private` con getter/setter que re-renderiza la UI.
- `useEffect` es como `@PostConstruct` — se ejecuta al "crear" el componente.
- `onValue` de Firebase es como suscribirse a un WebSocket con STOMP.

---

## 📄 Licencia

MIT — Usa, modifica y comparte libremente.

---

Hecho con ❤️ para el cumpleaños de Juan 🎂
