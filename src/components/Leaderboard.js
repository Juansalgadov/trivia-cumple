'use client';

import { useEffect, useState } from 'react';
import styles from './Leaderboard.module.css';

// Emojis para el podio (1°, 2°, 3° lugar)
const POSITION_EMOJIS = { 1: '🥇', 2: '🥈', 3: '🥉' };

/**
 * Pantalla del Ranking Final.
 * Muestra a todos los jugadores ordenados de mayor a menor nota,
 * apare ciéndolos uno por uno con un efecto dramático.
 * Si alguien sacó nota 8.0 (perfecto + bonus), lanza confetti.
 */
export default function Leaderboard({ ranking, isHost }) {
  // Controla cuántos jugadores se han revelado hasta el momento (van apareciendo de a uno)
  const [visibleCount, setVisibleCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Cuando llega el ranking, empezamos a mostrar jugadores uno por uno cada 0.6 segundos
  useEffect(() => {
    if (!ranking || ranking.length === 0) return;

    setVisibleCount(0);
    setShowConfetti(false);
    setConfettiPieces([]);

    // Revelar jugadores uno por uno con delay (efecto dramático)
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= ranking.length) {
          clearInterval(timer);
          // Si alguien sacó 8.0 (todo perfecto + bonus), celebramos con confetti
          if (ranking.some((r) => r.grade === 8.0)) {
            const colors = ['#00d4ff', '#ff6b6b', '#f1c40f', '#2ecc71', '#00ff88'];
            setConfettiPieces(Array.from({ length: 50 }).map((_, i) => ({
              id: i,
              x: `${Math.random() * 100}vw`,
              delay: `${Math.random() * 3}s`,
              duration: `${2 + Math.random() * 3}s`,
              color: colors[Math.floor(Math.random() * colors.length)],
            })));
            setShowConfetti(true);
          }
        }
        return next;
      });
    }, 600);

    // Al desmontar el componente, cancelamos el timer para no desperdiciar recursos
    return () => clearInterval(timer);
  }, [ranking]);

  if (!ranking || ranking.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay resultados disponibles</p>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      {/* Confetti para el 8.0 */}
      {showConfetti && (
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
      </div>

      <div className={styles.rankingList}>
        {ranking.map((entry, index) => {
          if (index >= visibleCount) return null;

          const isPerfect = entry.grade === 8.0;
          const isTop3 = entry.position <= 3;

          return (
            <div
              key={entry.playerId}
              className={`${styles.rankingRow} ${isPerfect ? styles.perfectRow : ''} ${isTop3 ? styles.topRow : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Posición */}
              <div className={styles.position}>
                {POSITION_EMOJIS[entry.position] || (
                  <span className={styles.positionNumber}>{entry.position}</span>
                )}
              </div>

              {/* Nickname */}
              <div className={styles.playerInfo}>
                <span className={styles.nickname}>{entry.nickname}</span>
                {entry.bonus && <span className={styles.bonusTag}>+⭐</span>}
              </div>

              {/* Puntaje */}
              <div className={styles.scoreSection}>
                <span className={styles.score}>{entry.score}/14</span>
              </div>

              {/* Nota */}
              <div className={`${styles.gradeSection} ${isPerfect ? styles.perfectGrade : ''}`}>
                <span className={styles.grade}>{entry.grade.toFixed(1)}</span>
                {isPerfect && <span className={styles.perfectBadge}>🔥 PERFECTO</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
