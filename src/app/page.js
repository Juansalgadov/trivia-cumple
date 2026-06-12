'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import FloatingDecorations from '../components/FloatingDecorations';

const HOST_PASSWORD = 'yeye123?';

/* ─── Canvas de particulas ─── */
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

    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const gold = Math.random() > 0.42;
      return {
        x:       Math.random() * window.innerWidth,
        y:       Math.random() * window.innerHeight,
        r:       Math.random() * 2.4 + 0.4,
        vx:      (Math.random() - 0.5) * 0.28,
        vy:      (Math.random() - 0.5) * 0.24,
        gold,
        opacity: Math.random() * 0.45 + 0.1,
        pulse:   Math.random() * Math.PI * 2,
      };
    });

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.016;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;
        const alpha = p.opacity * (0.65 + 0.35 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(245,166,35,${alpha})`
          : `rgba(0,212,255,${alpha * 0.65})`;
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
  const [mounted, setMounted]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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
    <div className={`${styles.page} ${mounted ? styles.pageMounted : ''}`}>
      <ParticleCanvas />
      <FloatingDecorations count={12} />

      {/* Orbs atmosfericos de glow */}
      <div className={styles.orbGold} aria-hidden="true" />
      <div className={styles.orbCyan} aria-hidden="true" />
      <div className={styles.orbDeep} aria-hidden="true" />

      {/* Barra superior */}
      <header className={styles.topBar}>
        <div className={styles.topBarBrand}>
          <span className={styles.topBarPulse} aria-hidden="true" />
          <span className={styles.topBarLabel}>Fiesta Interactiva</span>
        </div>
        <span className={styles.topBarYear}>2025</span>
      </header>

      {/* ── Pantalla: Seleccion de rol ── */}
      {screen === 'choose' && (
        <main className={styles.main}>

          {/* Columna izquierda: hero texto */}
          <div className={styles.heroCol}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              Trivia en tiempo real
            </p>

            <h1 className={styles.heroTitle}>
              <span className={styles.line1}>¿Cuánto</span>
              <span className={styles.line2}>conoces</span>
              <span className={styles.line3}>
                a <em>Juan</em>?<span className={styles.partyIcon}>🎉</span>
              </span>
            </h1>

            <p className={styles.heroSub}>
              Responde desde tu celular y compite en vivo con todos los invitados.
            </p>

            <div className={styles.statRow}>
              <div className={styles.stat}>
                <span className={styles.statVal}>14</span>
                <span className={styles.statKey}>preguntas</span>
              </div>
              <span className={styles.statSep} aria-hidden="true" />
              <div className={styles.stat}>
                <span className={styles.statVal}>∞</span>
                <span className={styles.statKey}>jugadores</span>
              </div>
              <span className={styles.statSep} aria-hidden="true" />
              <div className={styles.stat}>
                <span className={styles.statVal}>1</span>
                <span className={styles.statKey}>ganador</span>
              </div>
            </div>
          </div>

          {/* Columna derecha: cards de rol */}
          <div className={styles.rolesCol}>

            <button
              className={`${styles.roleCard} ${styles.hostCard}`}
              onClick={handleHostSelect}
              aria-label="Acceder como Host"
            >
              <div className={styles.cardGlowFill} aria-hidden="true" />
              <div className={styles.cardTop}>
                <span className={styles.cardNum}>01</span>
                <div className={styles.cardIconWrap} aria-hidden="true">
                  {/* Monitor / TV icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
              </div>
              <h2 className={styles.cardTitle}>Soy el Host</h2>
              <p className={styles.cardDesc}>
                Controla el juego desde la TV — lanza preguntas y revela el ranking.
              </p>
              <div className={styles.cardCta}>
                <span>Ingresar</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            <button
              className={`${styles.roleCard} ${styles.joinCard}`}
              onClick={handlePlayerSelect}
              aria-label="Unirse como jugador"
            >
              <div className={styles.cardGlowFill} aria-hidden="true" />
              <div className={styles.cardTop}>
                <span className={styles.cardNum}>02</span>
                <div className={styles.cardIconWrap} aria-hidden="true">
                  {/* Smartphone icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                </div>
              </div>
              <h2 className={styles.cardTitle}>Soy Jugador</h2>
              <p className={styles.cardDesc}>
                {'Únete desde tu celular — ingresa tu nombre y responde en tiempo real.'}
              </p>
              <div className={styles.cardCta}>
                <span>Unirme</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

          </div>
        </main>
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
            <div className={styles.lockIconWrap} aria-hidden="true">🔒</div>
            <h2 className={styles.authTitle}>Acceso de Host</h2>
            <p className={styles.authDesc}>Ingresa la contraseña para controlar el juego desde la TV</p>

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
