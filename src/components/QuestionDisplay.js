'use client';

import { useState, useEffect } from 'react';
import styles from './QuestionDisplay.module.css';

const OPTION_COLORS = {
  A: '#e74c3c',
  B: '#3498db',
  C: '#f1c40f',
  D: '#2ecc71',
};

const OPTION_ICONS = {
  A: '🔴',
  B: '🔵',
  C: '🟡',
  D: '🟢',
};

/**
 * Pantalla que muestra la pregunta activa en la TV del Host.
 * Incluye temporizador informativo, las 4 opciones con colores,
 * la lista de quién ya respondió y un contador de respuestas.
 */
export default function QuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions, 
  answeredCount, 
  totalPlayers,
  players,
  questionIndex,
  onShowResults 
}) {
  // Temporizador informativo — solo muestra el tiempo transcurrido desde que apareció la pregunta
  const [elapsed, setElapsed] = useState(0);

  // Reiniciar el timer cada vez que cambia la pregunta
  useEffect(() => {
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [questionNumber]);

  if (!question) return null;

  const options = Object.entries(question.options);

  // Construimos listas separadas: quién ya respondió y quién aún no
  const answered = [];
  const pending = [];
  if (players) {
    Object.values(players).forEach((player) => {
      const hasAnswered = player.answers && player.answers[String(questionIndex)] != null;
      if (hasAnswered) {
        answered.push(player.nickname);
      } else {
        pending.push(player.nickname);
      }
    });
  }

  // Formatear el tiempo transcurrido como M:SS
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={styles.questionContainer}>
      {/* Barra de progreso — muestra en qué pregunta vamos */}
      <div className={styles.progressBar}>
        <div className={styles.progressHeader}>
          <span className={styles.questionCounter}>
            Pregunta {questionNumber} / {totalQuestions}
          </span>
          <span className={styles.answerCounter}>
            {answeredCount} / {totalPlayers} respondieron
          </span>
          {/* Temporizador informativo */}
          <span className={styles.timer}>⏱ {timeStr}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Texto de la pregunta */}
      <div className={styles.questionCard}>
        <h2 className={styles.questionText}>{question.text}</h2>
      </div>

      {/* Las 4 opciones de respuesta con sus colores */}
      <div className={styles.optionsGrid}>
        {options.map(([letter, text], index) => (
          <div
            key={letter}
            className={styles.optionCard}
            style={{
              '--option-color': OPTION_COLORS[letter],
              animationDelay: `${index * 0.15}s`,
            }}
          >
            <span className={styles.optionLetter}>{letter}</span>
            <span className={styles.optionText}>{text}</span>
          </div>
        ))}
      </div>

      {/* Lista de jugadores: quién respondió y quién no */}
      {totalPlayers > 0 && (
        <div className={styles.playerStatusGrid}>
          <div className={styles.playerStatusColumn}>
            <span className={styles.playerStatusLabel}>✅ Ya respondieron ({answered.length})</span>
            <div className={styles.playerStatusList}>
              {answered.length === 0
                ? <span className={styles.playerStatusEmpty}>Ninguno aún</span>
                : answered.map((name) => (
                    <span key={name} className={styles.playerStatusChip + ' ' + styles.chipAnswered}>
                      {name}
                    </span>
                  ))
              }
            </div>
          </div>
          <div className={styles.playerStatusColumn}>
            <span className={styles.playerStatusLabel}>⏳ Pendientes ({pending.length})</span>
            <div className={styles.playerStatusList}>
              {pending.length === 0
                ? <span className={styles.playerStatusEmpty}>¡Todos respondieron!</span>
                : pending.map((name) => (
                    <span key={name} className={styles.playerStatusChip + ' ' + styles.chipPending}>
                      {name}
                    </span>
                  ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Botón para cerrar la votación y ver quién respondió qué */}
      <button className={styles.resultsButton} onClick={onShowResults}>
        📊 CERRAR VOTACIÓN
      </button>
    </div>
  );
}
