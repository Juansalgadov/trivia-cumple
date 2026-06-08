'use client';

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
 * Muestra cuántos jugadores eligieron cada opción (A, B, C, D)
 * y resalta cuál era la respuesta correcta.
 */
export default function ResultsChart({ question, questionNumber, players, questionIndex, onNext, isLastQuestion }) {
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

      {/* Destacamos la respuesta correcta */}
      <div className={styles.correctAnswer}>
        <span className={styles.correctIcon}>✅</span>
        <span className={styles.correctText}>
          Respuesta correcta: <strong>{question.correctAnswer}</strong> — {question.options[question.correctAnswer]}
        </span>
      </div>

      {/* Barra por cada opción mostrando cuántos la eligieron */}
      <div className={styles.barsContainer}>
        {Object.entries(question.options).map(([letter, text]) => {
          const count = counts[letter];
          const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
          const isCorrect = letter === question.correctAnswer;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={letter} className={`${styles.barRow} ${isCorrect ? styles.correctRow : ''}`}>
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

      {/* Botón para avanzar a la siguiente pregunta o a la pregunta abierta */}
      <button className={styles.nextButton} onClick={onNext}>
        {isLastQuestion ? '🎤 IR A PREGUNTA ABIERTA' : '➡️ SIGUIENTE PREGUNTA'}
      </button>
    </div>
  );
}
