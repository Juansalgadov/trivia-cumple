'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const HOST_PASSWORD = 'yeye123?';

export default function GatewayPage() {
  const [screen, setScreen] = useState('choose');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleHostSelect = () => {
    setScreen('host_auth');
    setError(null);
    setPassword('');
  };

  const handleHostLogin = (e) => {
    e.preventDefault();
    if (password === HOST_PASSWORD) {
      router.push('/host');
    } else {
      setError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handlePlayerSelect = () => {
    router.push('/join');
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* Hero — siempre visible */}
        <div className={styles.heroSection}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Fiesta interactiva
          </div>
          <span className={styles.cakeIcon}>🎂</span>
          <h1 className={styles.title}>
            ¿Cuánto conoces<br />a <span className={styles.titleAccent}>Juan</span>?
          </h1>
          <p className={styles.subtitle}>Trivia de cumpleaños en tiempo real</p>
        </div>

        {/* Pantalla 1: Seleccion de rol */}
        {screen === 'choose' && (
          <div className={styles.buttonGroup}>
            <button className={styles.hostButton} onClick={handleHostSelect}>
              <div className={styles.buttonIconWrap}>🖥️</div>
              <div className={styles.buttonContent}>
                <span className={styles.buttonLabel}>Soy el Host</span>
                <span className={styles.buttonDesc}>Controlar el juego desde la TV</span>
              </div>
              <span className={styles.buttonArrow}>→</span>
            </button>

            <button className={styles.joinButton} onClick={handlePlayerSelect}>
              <div className={styles.buttonIconWrap}>📱</div>
              <div className={styles.buttonContent}>
                <span className={styles.buttonLabel}>Soy Jugador</span>
                <span className={styles.buttonDesc}>Unirme desde mi celular</span>
              </div>
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        )}

        {/* Pantalla 2: Autenticacion del host */}
        {screen === 'host_auth' && (
          <>
            <button
              className={styles.backButtonFloat}
              onClick={() => { setScreen('choose'); setError(null); setPassword(''); }}
            >
              ← Volver
            </button>

            <div className={styles.authCard}>
              <div className={styles.authHeader}>
                <div className={styles.lockIconWrap}>🔒</div>
                <h2 className={styles.authTitle}>Acceso de Host</h2>
                <p className={styles.authDesc}>Ingresa la contraseña para controlar el juego</p>
              </div>

              <form onSubmit={handleHostLogin} className={styles.authForm}>
                <input
                  type="password"
                  className={`${styles.passwordInput} ${error ? styles.inputError : ''}`}
                  placeholder="Contraseña..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  autoFocus
                  autoComplete="off"
                />

                {error && (
                  <div className={styles.errorBanner}>{error}</div>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!password.trim()}
                >
                  Ingresar al panel
                </button>
              </form>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
