'use client';

import { useState } from 'react';
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
 * La respuesta correcta está OCULTA hasta que el host presiona "Revelar Respuesta".
 * Solo entonces aparece el botón de "Siguiente Pregunta".
 */
export default function ResultsChart({ question, questionNumber, players, questionIndex, onNext, isLastQuestion }) {
  const [revealed, setRevealed] = useState(false);

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

  // El valor más alto nos sirve para escalar las barras correctamente
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultHeader}>
        <span className={styles.questionLabel}>Pregunta {questionNumber}</span>
        <h2 className={styles.questionText}>{question.text}</h2>
      </div>

      {/* Respuesta correcta — oculta hasta que el host la revele */}
      {revealed ? (
        <div className={styles.correctAnswer} style={{ animation: 'fadeInDown 0.5s ease' }}>
          <span className={styles.correctIcon}>✅</span>
          <span className={styles.correctText}>
            Respuesta correcta: <strong>{question.correctAnswer}</strong> — {question.options[question.correctAnswer]}
          </span>
        </div>
      ) : (
        <button
          className={styles.revealButton}
          onClick={() => setRevealed(true)}
        >
          👁️ REVELAR RESPUESTA
        </button>
      )}

      {/* Barra por cada opción mostrando cuántos la eligieron */}
      <div className={styles.barsContainer}>
        {Object.entries(question.options).map(([letter, text]) => {
          const count = counts[letter];
          const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
          const isCorrect = letter === question.correctAnswer;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          // Cuando se reveló la respuesta: la correcta brilla, las incorrectas se atenúan
          const rowStyle = revealed
            ? { opacity: isCorrect ? 1 : 0.35, transform: isCorrect ? 'scale(1.02)' : 'none', transition: 'all 0.4s ease' }
            : { transition: 'all 0.4s ease' };

          return (
            <div
              key={letter}
              className={`${styles.barRow} ${revealed && isCorrect ? styles.correctRow : ''}`}
              style={rowStyle}
            >
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

      {/* Botón para avanzar — solo aparece DESPUÉS de revelar */}
      {revealed && (
        <button className={styles.nextButton} onClick={onNext} style={{ animation: 'fadeInUp 0.4s ease' }}>
          {isLastQuestion ? '🎤 IR A PREGUNTA ABIERTA' : '➡️ SIGUIENTE PREGUNTA'}
        </button>
      )}
    </div>
  );
}
