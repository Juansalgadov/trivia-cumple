'use client';

import { useEffect } from 'react';
import styles from './ResultsChart.module.css';

// Colores para cada barra del gráfico
const OPTION_COLORS = {
  A: '#e74c3c',
  B: '#3498db',
  C: '#f1c40f',
  D: '#2ecc71',
};

/**
 * Gráfico de barras que aparece en la TV después de cerrar la votación.
 * NO muestra la respuesta correcta — el suspenso se mantiene hasta el final.
 * Solo muestra cuántos votaron cada opción.
 */
export default function ResultsChart({ question, questionNumber, players, questionIndex, onNext, isLastQuestion }) {
  // Avanzar rápido con la flecha derecha o Enter
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext]);

  if (!question) return null;

  // Contamos cuántos jugadores eligieron cada opción
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  const totalPlayers = players ? Object.keys(players).length : 0;

  if (players) {
    Object.values(players).forEach((player) => {
      const answer = player.answers && player.answers[String(questionIndex)];
      if (answer && counts.hasOwnProperty(answer)) {
        counts[answer]++;
      }
    });
  }

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultHeader}>
        <span className={styles.questionLabel}>Pregunta {questionNumber}</span>
        <h2 className={styles.questionText}>{question.text}</h2>
      </div>

      {/* Solo mostramos cuántos votaron cada opción, SIN revelar cuál es correcta */}
      <div className={styles.barsContainer}>
        {Object.entries(question.options).map(([letter, text]) => {
          const count = counts[letter];
          const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={letter} className={styles.barRow}>
              <div className={styles.barLabel}>
                <span
                  className={styles.barLetter}
                  style={{ background: OPTION_COLORS[letter] }}
                >
                  {letter}
                </span>
                <span className={styles.barText}>{text}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${barWidth}%`,
                    background: OPTION_COLORS[letter],
                  }}
                />
              </div>
              <span className={styles.barCount}>
                {count} <span className={styles.barPercent}>({Math.round(percentage)}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      <button className={styles.nextButton} onClick={onNext}>
        {isLastQuestion ? '🎤 IR A PREGUNTA ABIERTA' : '➡️ SIGUIENTE PREGUNTA'}
      </button>
    </div>
  );
}
