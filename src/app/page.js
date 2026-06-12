'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const HOST_PASSWORD = 'yeye123?';

/* ─── Canvas de particulas flotantes ─── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Crear particulas
    const PARTICLE_COUNT = 55;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,
      r:    Math.random() * 1.8 + 0.4,
      vx:   (Math.random() - 0.5) * 0.25,
      vy:   (Math.random() - 0.5) * 0.22,
      // mezcla de dorado y cyan
      gold: Math.random() > 0.5,
      opacity: Math.random() * 0.35 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(245, 166, 35, ${p.opacity})`
          : `rgba(0, 212, 255, ${p.opacity * 0.75})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} aria-hidden="true" />;
}

/* ─── Pagina principal ─── */
export default function GatewayPage() {
  const [screen, setScreen]     = useState('choose');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
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
      <ParticleCanvas />

      {/* Barra superior */}
      <header className={styles.topBar}>
        <div className={styles.topBarBrand}>
          <span className={styles.topBarDot} />
          <span className={styles.topBarLabel}>Fiesta Interactiva</span>
        </div>
        <span className={styles.topBarMeta}>Trivia &mdash; Cumpleaños Juan</span>
      </header>

      {/* ── Pantalla: Seleccion de rol ── */}
      {screen === 'choose' && (
        <>
          {/* Hero */}
          <section className={styles.heroSection}>
            <div className={styles.tagline}>
              <span className={styles.taglineLine} />
              En tiempo real
              <span className={styles.taglineLine} />
            </div>
            <h1 className={styles.heroTitle}>
              ¿Cuánto conoces<br />a <em>Juan</em>?
            </h1>
            <p className={styles.heroSub}>Responde desde tu celular y compite con todos los invitados</p>
          </section>

          {/* Separador */}
          <div className={styles.dividerRow}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerLabel}>Elige tu rol para comenzar</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Split de roles */}
          <div className={styles.splitRow}>
            {/* Host */}
            <button
              className={`${styles.roleCard} ${styles.hostCard}`}
              onClick={handleHostSelect}
              aria-label="Acceder como Host"
            >
              <span className={styles.cardBigIcon} aria-hidden="true">🖥️</span>
              <span className={styles.cardNumber}>01 — Host</span>
              <span className={styles.cardTitle}>Soy el<br />Host</span>
              <span className={styles.cardDesc}>Controla el juego desde la TV.<br />Lanza preguntas y revela el ranking.</span>
              <span className={styles.cardCta}>
                Ingresar <span className={styles.ctaArrow}>→</span>
              </span>
            </button>

            {/* Jugador */}
            <button
              className={`${styles.roleCard} ${styles.joinCard}`}
              onClick={handlePlayerSelect}
              aria-label="Unirse como jugador"
            >
              <span className={styles.cardBigIcon} aria-hidden="true">📱</span>
              <span className={styles.cardNumber}>02 — Jugador</span>
              <span className={styles.cardTitle}>Soy<br />Jugador</span>
              <span className={styles.cardDesc}>Únete desde tu celular.<br />Ingresa tu nombre y juega.</span>
              <span className={styles.cardCta}>
                Unirme <span className={styles.ctaArrow}>→</span>
              </span>
            </button>
          </div>
        </>
      )}

      {/* ── Pantalla: Auth del host ── */}
      {screen === 'host_auth' && (
        <div className={styles.authOverlay}>
          <button
            className={styles.backButtonFloat}
            onClick={() => { setScreen('choose'); setError(null); setPassword(''); }}
          >
            ← Volver
          </button>

          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <div className={styles.lockIconWrap} aria-hidden="true">🔒</div>
              <h2 className={styles.authTitle}>Acceso de Host</h2>
              <p className={styles.authDesc}>Ingresa la contraseña para controlar el juego desde la TV</p>
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
                <div className={styles.errorBanner} role="alert">
                  {error}
                </div>
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
        </div>
      )}
    </div>
  );
}
