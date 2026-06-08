// ============================================================================
// layout.js — Estructura Base de Toda la App
// ============================================================================
//
// Este archivo es como el "marco" que envuelve todas las páginas.
// Piensa en él como una hoja de papel donde escribes el título y las fuentes
// una sola vez, y todas las páginas de la app (/, /host, /join) las heredan
// automáticamente. Si cambias algo aquí, cambia en toda la app.
// ============================================================================

import './globals.css';

// Metadatos de la app: el título que aparece en la pestaña del navegador
// y la descripción que Google usaría si indexara la página.
export const metadata = {
  title: '🎂 Trivia de Cumpleaños | ¿Cuánto conoces a Juan?',
  description:
    'Trivia interactiva en tiempo real para celebrar el cumpleaños de Juan. Responde preguntas desde tu celular y compite con tus amigos.',
};

// Configuración del viewport: le dice al navegador del celular
// que no haga zoom automático y que use el ancho real de la pantalla.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Componente raíz que envuelve todas las páginas de la app.
 * 'children' es el contenido de la página que el usuario está visitando.
 * Por ejemplo, si va a /host, children será el contenido de host/page.js.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Cargamos las fuentes de Google para que la app se vea bien */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      {/* Aquí se inyecta la página actual — cambia según la ruta visitada */}
      <body>
        {children}
      </body>
    </html>
  );
}
