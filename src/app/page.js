// ============================================================================
// page.js — Puerta de Entrada Principal
// ============================================================================
//
// Primera pantalla que ven todos al escanear el QR.
// Solo pregunta si eres Host o Jugador.
// - Host → pide contraseña → panel de control
// - Jugador → va directo a escribir su nombre
// ============================================================================

'use client'; // Esto indica que el archivo funciona directamente en el navegador del usuario

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Contraseña para que solo tú puedas controlar la pantalla grande
const HOST_PASSWORD = 'yeye123?';

export default function GatewayPage() {
  // ══════════════════════════════════════════════════════════════════════════
  // ESTADO DE LA PANTALLA
  // ══════════════════════════════════════════════════════════════════════════
  // Guardamos en memoria qué pantalla estamos mostrando actualmente.

  const [screen, setScreen] = useState('choose');
  // 'choose'   → botones de selección
  // 'host_auth' → pantalla de contraseña

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const router = useRouter(); // Herramienta para navegar entre páginas

  // ══════════════════════════════════════════════════════════════════════════
  // ACCIONES DE LOS BOTONES
  // ══════════════════════════════════════════════════════════════════════════

  // Cuando tocan el botón "Soy el Host"
  const handleHostSelect = () => {
    setScreen('host_auth');  // Cambiamos a la pantalla de la contraseña
    setError(null);
    setPassword('');
  };

  // Cuando el presentador escribe la contraseña y da click a "Ingresar"
  const handleHostLogin = (e) => {
    e.preventDefault(); // Evita que la página web recargue la pantalla

    if (password === HOST_PASSWORD) {
      // Contraseña correcta -> lo mandamos a su panel de control
      router.push('/host');
    } else {
      // Contraseña incorrecta -> le mostramos un mensaje de error
      setError('🚫 Acceso denegado. Contraseña incorrecta.');
    }
  };

  // Cuando tocan el botón "Soy Jugador" → ir directo a escribir el nombre
  const handlePlayerSelect = () => {
    router.push('/join');
  };

  // Botón genérico para volver atrás en cualquier pantalla
  const handleBack = () => {
    setScreen('choose');
    setError(null);
    setPassword('');
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DISEÑO VISUAL
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        
        {/* Título y dibujo que se ven siempre en la parte de arriba */}
        <div className={styles.heroSection}>
          <span className={styles.emoji}>🎂</span>
          <h1 className={styles.title}>Trivia de Cumpleaños</h1>
          <p className={styles.subtitle}>¿Cuánto conoces a Juan?</p>
        </div>

        {/* --- PANTALLA 1: Botones Iniciales --- */}
        {screen === 'choose' && (
          <div className={styles.buttonGroup}>
            <button
              className={styles.hostButton}
              onClick={handleHostSelect}
            >
              <span className={styles.buttonIcon}>🖥️</span>
              <span className={styles.buttonLabel}>Soy el Host</span>
              <span className={styles.buttonDesc}>Controlar el juego desde la TV</span>
            </button>

            <button
              className={styles.joinButton}
              onClick={handlePlayerSelect}
            >
              <span className={styles.buttonIcon}>📱</span>
              <span className={styles.buttonLabel}>Soy Jugador</span>
              <span className={styles.buttonDesc}>Unirme desde mi celular</span>
            </button>
          </div>
        )}

        {/* --- PANTALLA 2: Contraseña Oculta --- */}
        {screen === 'host_auth' && (
          <>
            <button
              onClick={() => setScreen('choose')}
              style={{
                position: 'fixed',
                top: '1rem',
                left: '1rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                zIndex: 100,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              Volver
            </button>
            <div className={styles.authCard}>
              <div className={styles.authHeader}>
                <span className={styles.lockIcon}>🔒</span>
                <h2 className={styles.authTitle}>Acceso de Host</h2>
              <p className={styles.authDesc}>Ingresa la contraseña para controlar el juego</p>
            </div>

            <form onSubmit={handleHostLogin} className={styles.authForm}>
              <input
                type="password"
                className={`${styles.passwordInput} ${error ? styles.inputError : ''}`}
                placeholder="Contraseña..."
                value={password}
                onChange={(e) => {
                  // Cada vez que se escribe una letra, actualiza la memoria secreta
                  setPassword(e.target.value);
                  setError(null); // Quita la advertencia roja al intentar de nuevo
                }}
                autoFocus
                autoComplete="off"
              />

              {error && (
                <div className={styles.errorBanner}>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={!password.trim()}
              >
                🔓 INGRESAR
              </button>
            </form>
          </div>
          </>
        )}

      </main>
    </div>
  );
}
