'use client';

import { useState, useEffect } from 'react';
import styles from './QuestionDisplay.module.css';

const OPTION_COLORS = {
  A: '#e74c3c',
  B: '#3498db',
  C: '#f1c40f',
  D: '#2ecc71',
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
  onShowResults,
  revealedOptions,
  onRevealOption,
  onRemovePlayer,
}) {
  // Temporizador informativo — solo muestra el tiempo transcurrido desde que apareció la pregunta
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Construimos listas separadas: quién ya respondió y quién aún no
  const answered = [];
  const pending = [];
  if (players) {
    Object.entries(players).forEach(([playerId, player]) => {
      const hasAnswered = player.answers && player.answers[String(questionIndex)] != null;
      if (hasAnswered) {
        answered.push({ id: playerId, nickname: player.nickname });
      } else {
        pending.push({ id: playerId, nickname: player.nickname });
      }
    });
  }

  // Avanzar rápido con la flecha derecha o Enter
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (revealedOptions < 4) {
          onRevealOption(revealedOptions + 1);
        } else if (pending.length === 0) {
          onShowResults();
        } else {
          console.log('Faltan jugadores por responder');
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onShowResults, revealedOptions, onRevealOption, pending.length]);

  if (!question) return null;

  const options = Object.entries(question.options);

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

      {revealedOptions < 4 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Presiona <strong>Enter</strong> o <strong>Flecha Derecha</strong> en tu teclado para revelar opciones.
          </p>
          <button 
            onClick={() => onRevealOption(revealedOptions + 1)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Revelar Siguiente Opción
          </button>
        </div>
      )}

      {/* Las 4 opciones de respuesta con sus colores */}
      <div className={styles.optionsGrid}>
        {options.map(([letter, text], index) => {
          const isRevealed = index < revealedOptions;
          return (
            <div
              key={letter}
              className={styles.optionCard}
              style={{
                '--option-color': OPTION_COLORS[letter],
                animationDelay: `${index * 0.15}s`,
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.4s ease-out',
              }}
            >
              <span className={styles.optionLetter}>{letter}</span>
              <span className={styles.optionText}>{text}</span>
            </div>
          );
        })}
      </div>

      {/* Lista de jugadores: quién respondió y quién no */}
      {totalPlayers > 0 && (
        <div className={styles.playerStatusGrid}>
          <div className={styles.playerStatusColumn}>
            <span className={styles.playerStatusLabel}>✅ Ya respondieron ({answered.length})</span>
            <div className={styles.playerStatusList}>
              {answered.length === 0
                ? <span className={styles.playerStatusEmpty}>Ninguno aún</span>
                : answered.map((p) => (
                    <span key={p.id} className={styles.playerStatusChip + ' ' + styles.chipAnswered}>
                      {p.nickname}
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
                : pending.map((p) => (
                    <span
                      key={p.id}
                      className={styles.playerStatusChip + ' ' + styles.chipPending}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {p.nickname}
                      {onRemovePlayer && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Expulsar a ${p.nickname} de la sala?`)) {
                              onRemovePlayer(p.id);
                            }
                          }}
                          style={{
                            background: 'rgba(255,80,80,0.2)',
                            border: '1px solid rgba(255,80,80,0.5)',
                            color: '#ff6b6b',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: 0,
                          }}
                          title="Expulsar jugador"
                        >
                          ❌
                        </button>
                      )}
                    </span>
                  ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Botón para cerrar la votación y ver quién respondió qué */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className={styles.resultsButton}
          onClick={onShowResults}
          disabled={pending.length > 0 || revealedOptions < 4}
          style={{ opacity: pending.length > 0 || revealedOptions < 4 ? 0.5 : 1 }}
        >
          {revealedOptions < 4
            ? 'Revelando opciones...'
            : pending.length > 0
              ? `Faltan ${pending.length} por responder`
              : '📊 CERRAR VOTACIÓN'}
        </button>
        {pending.length > 0 && revealedOptions >= 4 && (
          <button
            onClick={() => {
              if (confirm('¿Seguro que quieres avanzar? Los que no respondieron se quedarán en blanco.')) {
                onShowResults();
              }
            }}
            style={{
              padding: '0 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Forzar avance
          </button>
        )}
      </div>
    </div>
  );
}
