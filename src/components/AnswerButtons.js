'use client';

import { useState } from 'react';
import styles from './AnswerButtons.module.css';

// Colores de cada botón de respuesta (A=rojo, B=azul, C=amarillo, D=verde)
const OPTION_COLORS = {
  A: '#e74c3c',
  B: '#3498db',
  C: '#f1c40f',
  D: '#2ecc71',
};

/**
 * Muestra los 4 botones de respuesta (A, B, C, D) en el celular del jugador.
 * El jugador puede cambiar su respuesta o cancelarla mientras la pregunta esté activa.
 */
export default function AnswerButtons({ question, questionNumber, onAnswer, onCancelAnswer, selectedAnswer, revealedOptions }) {
  // Guardamos si el jugador ya está enviando la respuesta (para evitar dobles clics)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Guardamos si hubo un error al intentar enviar (por si falla la conexión)
  const [sendError, setSendError] = useState(false);

  if (!question) return null;

  // Esta función se ejecuta cuando el jugador toca un botón de respuesta
  const handleAnswer = async (letter) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSendError(false);
    try {
      await onAnswer(letter);
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
      setSendError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancela el voto actual (vuelve a null en Firebase)
  const handleCancel = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (onCancelAnswer) await onCancelAnswer();
    } catch (err) {
      console.error('Error al cancelar voto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = Object.entries(question.options);

  // Si hubo error de conexión, mostrar aviso para que intente de nuevo
  if (sendError) {
    return (
      <div className={styles.answeredContainer}>
        <div className={styles.answeredIcon}>⚠️</div>
        <h2 className={styles.answeredTitle}>Error al enviar</h2>
        <p className={styles.answeredText}>Hubo un problema de conexión. Toca un botón para intentar de nuevo.</p>
        <button className={styles.retryButton} onClick={() => setSendError(false)}>
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.buttonsContainer}>
      <div className={styles.questionInfo}>
        <span className={styles.questionNumber}>Pregunta {questionNumber}</span>
        <h2 className={styles.questionText}>{question.text}</h2>
      </div>

      {revealedOptions === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'rgba(255,255,255,0.7)',
          animation: 'pulse 2s infinite',
          marginTop: '2rem'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>👀</p>
          <p>Esperando a que el presentador revele las opciones...</p>
        </div>
      )}

      <div className={styles.buttonsGrid} style={{ display: revealedOptions === 0 ? 'none' : 'grid' }}>
        {options.map(([letter, text], index) => {
          const isRevealed = index < revealedOptions;
          return (
            <button
              key={letter}
              className={`${styles.answerButton} ${selectedAnswer === letter ? styles.selectedButton : ''}`}
              style={{
                '--btn-color': OPTION_COLORS[letter],
                opacity: isRevealed ? 1 : 0,
                pointerEvents: isRevealed ? 'auto' : 'none',
                transform: isRevealed ? 'scale(1)' : 'scale(0.9)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onClick={() => handleAnswer(letter)}
              disabled={isSubmitting || !isRevealed}
            >
              <span className={styles.buttonLetter}>{letter}</span>
              <span className={styles.buttonText}>{text}</span>
              {selectedAnswer === letter && <span className={styles.selectedBadge}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Botón de cancelar voto — solo visible si ya seleccionó algo */}
      {selectedAnswer && (
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          🔄 Cambiar respuesta
        </button>
      )}

      {selectedAnswer && (
        <p className={styles.selectedInfo}>
          Seleccionaste: <strong>{selectedAnswer}</strong> — Puedes cambiarla antes de que el host cierre la votación.
        </p>
      )}
    </div>
  );
}
