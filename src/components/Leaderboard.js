'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './Leaderboard.module.css';

// Emojis para el podio (1°, 2°, 3° lugar)
const POSITION_EMOJIS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const seededRandom = (seed) => {
  const value = Math.sin(seed + 1) * 10000;
  return value - Math.floor(value);
};

/**
 * Pantalla del Ranking Final.
 *
 * HOST: controla la revelación uno por uno presionando la tecla → (flecha derecha).
 *       El orden es ASCENDENTE: la nota más baja primero, la más alta al final.
 *       Después de revelar a todos, aparece el botón para ver las respuestas correctas.
 *
 * JUGADORES: ven una pantalla de espera mientras el host revela el ranking en la TV.
 */
export default function Leaderboard({ ranking, isHost, onShowAnswers }) {
  // El ranking llega ordenado de mayor a menor (pos 1, 2, 3...).
  // Para el host lo invertimos: peor nota primero, mejor nota al final.
  const orderedRanking = useMemo(
    () => (isHost ? [...(ranking || [])].reverse() : (ranking || [])),
    [isHost, ranking]
  );

  // Cuántos se han revelado (el host los va desbloqueando de a uno)
  const [revealedCount, setRevealedCount] = useState(0);

  // Revelar el siguiente jugador (también funciona con el botón en pantalla)
  const revealNext = useCallback(() => {
    if (revealedCount < orderedRanking.length) {
      setRevealedCount((prev) => prev + 1);
    }
  }, [revealedCount, orderedRanking.length]);

  // Escuchar la tecla → del teclado (solo el host)
  useEffect(() => {
    if (!isHost) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') revealNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isHost, revealNext]);

  const allRevealed = revealedCount >= orderedRanking.length;
  const shouldShowConfetti = isHost && allRevealed && orderedRanking.some((r) => r.grade >= 8.0);

  const confettiPieces = useMemo(() => {
    if (!shouldShowConfetti) return [];
    const colors = ['#00d4ff', '#ff6b6b', '#f1c40f', '#2ecc71', '#00ff88'];
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: `${seededRandom(i) * 100}vw`,
      delay: `${seededRandom(i + 100) * 2}s`,
      duration: `${2 + seededRandom(i + 200) * 3}s`,
      color: colors[Math.floor(seededRandom(i + 300) * colors.length)],
    }));
  }, [shouldShowConfetti]);

  // ————————— Pantalla para JUGADORES: esperar a que el host revele en la TV —————————
  if (!isHost) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>🏆 ¡Juego terminado!</h1>
          <p className={styles.subtitle}>El host está revelando el ranking en la pantalla grande.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '1rem' }}>
            ¡Mira la TV para descubrir tu posición!
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={styles.dot} style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ————————— Pantalla para el HOST —————————
  const remaining = orderedRanking.length - revealedCount;

  return (
    <div className={styles.leaderboardContainer}>
      {/* Confetti */}
      {shouldShowConfetti && (
        <div className={styles.confettiContainer}>
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className={styles.confetti}
              style={{
                '--x': piece.x,
                '--delay': piece.delay,
                '--duration': piece.duration,
                '--color': piece.color,
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>🏆 Ranking Final</h1>
        <p className={styles.subtitle}>Trivia de Cumpleaños de Juan</p>
        {!allRevealed && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Presiona <kbd style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              padding: '0.1rem 0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}>→</kbd> o el botón para revelar el siguiente puesto
          </p>
        )}
      </div>

      <div className={styles.rankingList}>
        {orderedRanking.map((entry, index) => {
          if (index >= revealedCount) return null;

          // La posición real en el ranking (1 = mejor)
          const isPerfect = entry.grade >= 8.0;
          const isTop3 = entry.position <= 3;

          return (
            <div
              key={entry.playerId}
              className={`${styles.rankingRow} ${isPerfect ? styles.perfectRow : ''} ${isTop3 ? styles.topRow : ''}`}
              style={{ animationDelay: '0s' }}
            >
              <div className={styles.position}>
                {POSITION_EMOJIS[entry.position] || (
                  <span className={styles.positionNumber}>{entry.position}</span>
                )}
              </div>
              <div className={styles.playerInfo}>
                <span className={styles.nickname}>{entry.nickname}</span>
                {entry.bonus && <span className={styles.bonusTag}>+⭐</span>}
              </div>
              <div className={styles.scoreSection}>
                <span className={styles.score}>{entry.score}/14</span>
              </div>
              <div className={`${styles.gradeSection} ${isPerfect ? styles.perfectGrade : ''}`}>
                <span className={styles.grade}>{entry.grade.toFixed(1)}</span>
                {isPerfect && <span className={styles.perfectBadge}>🔥 PERFECTO</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de revelar — desaparece cuando todos han sido revelados */}
      {!allRevealed && (
        <button className={styles.revealNextButton} onClick={revealNext}>
          {remaining > 1 ? `REVELAR SIGUIENTE (${remaining} restantes)` : 'REVELAR ÚLTIMO'}
        </button>
      )}

      {/* Botón para mostrar respuestas correctas al final */}
      {allRevealed && onShowAnswers && (
        <button className={styles.showAnswersButton} onClick={onShowAnswers}>
          VER RESPUESTAS CORRECTAS
        </button>
      )}
    </div>
  );
}
