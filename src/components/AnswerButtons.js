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
 * Cuando el jugador toca un botón, guarda su respuesta y muestra confirmación.
 */
export default function AnswerButtons({ question, questionNumber, onAnswer, selectedAnswer }) {
  // Guardamos si el jugador ya está enviando la respuesta (para evitar dobles clics)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Guardamos si hubo un error al intentar enviar (por si falla la conexión)
  const [sendError, setSendError] = useState(false);

  if (!question) return null;

  // Esta función se ejecuta cuando el jugador toca un botón de respuesta
  const handleAnswer = async (letter) => {
    if (selectedAnswer || isSubmitting) return; // Evitar doble clic si ya respondió
    setIsSubmitting(true);
    setSendError(false);
    try {
      // Intentamos guardar la respuesta en Firebase
      await onAnswer(letter);
    } catch (err) {
      // Si hay un error de conexión, le avisamos al jugador y desbloqueamos el botón
      console.error('Error al enviar respuesta:', err);
      setSendError(true);
    } finally {
      // Esto se ejecuta SIEMPRE (haya error o no), para que el botón no quede bloqueado
      setIsSubmitting(false);
    }
  };

  const options = Object.entries(question.options);

  // Si ya respondió exitosamente, mostrar pantalla de confirmación
  if (selectedAnswer) {
    return (
      <div className={styles.answeredContainer}>
        <div className={styles.answeredIcon}>✅</div>
        <h2 className={styles.answeredTitle}>¡Respuesta enviada!</h2>
        <p className={styles.answeredText}>
          Seleccionaste: <strong>{selectedAnswer}</strong>
        </p>
        <p className={styles.waitingText}>Esperando al host...</p>
      </div>
    );
  }

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

      <div className={styles.buttonsGrid}>
        {options.map(([letter, text]) => (
          <button
            key={letter}
            className={styles.answerButton}
            style={{ '--btn-color': OPTION_COLORS[letter] }}
            onClick={() => handleAnswer(letter)}
            disabled={isSubmitting}
          >
            <span className={styles.buttonLetter}>{letter}</span>
            <span className={styles.buttonText}>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
