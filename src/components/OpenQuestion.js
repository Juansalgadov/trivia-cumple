'use client';

import { useState } from 'react';
import styles from './OpenQuestion.module.css';

/**
 * Pantalla de la Pregunta 15 — solo la ve el Host en la TV.
 *
 * Las respuestas de los jugadores aparecen tapadas (censuradas con una barra negra).
 * El host debe escribir una contraseña para revelar cada una.
 * Después de leer la respuesta, puede darle o quitarle el punto extra a ese jugador.
 */
export default function OpenQuestion({ openAnswers, players, onReveal, onAwardBonus, onRemoveBonus, onFinish }) {
  // Guardamos la contraseña que el host va escribiendo para cada jugador por separado
  const [passwords, setPasswords] = useState({});
  // Guardamos errores de contraseña por jugador
  const [passwordErrors, setPasswordErrors] = useState({});

  // Contraseña secreta para poder revelar respuestas — solo la sabe el host
  const MASTER_PASSWORD = 'yeye123?';

  // Actualiza la contraseña escrita para un jugador específico
  const handlePasswordChange = (playerId, value) => {
    setPasswords((prev) => ({ ...prev, [playerId]: value }));
    // Limpiar el error mientras escribe
    if (passwordErrors[playerId]) {
      setPasswordErrors((prev) => ({ ...prev, [playerId]: false }));
    }
  };

  // Compara la contraseña ingresada con la secreta y revela si es correcta
  const handleReveal = (playerId) => {
    if (passwords[playerId] === MASTER_PASSWORD) {
      setPasswordErrors((prev) => ({ ...prev, [playerId]: false }));
      onReveal(playerId);
    } else {
      // Contraseña incorrecta — mostrar error en esa tarjeta
      setPasswordErrors((prev) => ({ ...prev, [playerId]: true }));
      // Limpiar el campo para que vuelva a escribir
      setPasswords((prev) => ({ ...prev, [playerId]: '' }));
    }
  };

  // Convertimos el mapa de jugadores en una lista para poder recorrerla
  const playerEntries = players ? Object.entries(players) : [];

  // Verificar si YA se asignó el punto a alguien — solo puede haber UN ganador del bonus
  const bonusAlreadyAwarded = openAnswers
    ? Object.values(openAnswers).some((a) => a.bonusAwarded)
    : false;

  return (
    <div className={styles.openContainer}>
      <div className={styles.header}>
        <span className={styles.questionLabel}>Pregunta 15 — Pregunta Abierta</span>
        <h2 className={styles.questionText}>¿Quién es Juan para ti y por qué lo elegiste como amigo?</h2>
      </div>

      <div className={styles.answersGrid}>
        {playerEntries.map(([playerId, playerData]) => {
          const openAnswer = openAnswers && openAnswers[playerId];
          const isRevealed = openAnswer && openAnswer.revealed;
          const bonusAwarded = openAnswer && openAnswer.bonusAwarded;
          const hasSubmitted = !!openAnswer;
          const hasError = passwordErrors[playerId];

          return (
            <div key={playerId} className={styles.answerCard}>
              {/* Nombre del jugador */}
              <div className={styles.playerHeader}>
                <span className={styles.playerName}>🎮 {playerData.nickname}</span>
                {bonusAwarded && <span className={styles.bonusBadge}>⭐ +1</span>}
              </div>

              {!hasSubmitted ? (
                <p className={styles.noAnswer}>Aún no ha respondido...</p>
              ) : isRevealed ? (
                /* Respuesta ya revelada — se puede dar o quitar el punto */
                <div className={styles.revealedSection}>
                  <p className={styles.revealedText}>{openAnswer.text}</p>
                  <div className={styles.bonusControls}>
                    {bonusAwarded ? (
                      <button
                        className={styles.removeBonusButton}
                        onClick={() => onRemoveBonus(playerId)}
                      >
                        ❌ Quitar Punto
                      </button>
                    ) : bonusAlreadyAwarded ? (
                      /* Ya hay otro jugador con el bonus — botón bloqueado */
                      <button
                        className={styles.bonusButton}
                        disabled
                        style={{ opacity: 0.3, cursor: 'not-allowed' }}
                        title="Ya se asignó el punto a otro jugador. Quítaselo primero."
                      >
                        ⭐ Asignar Punto
                      </button>
                    ) : (
                      <button
                        className={styles.bonusButton}
                        onClick={() => onAwardBonus(playerId)}
                      >
                        ⭐ Asignar Punto
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Respuesta censurada — el host debe ingresar la contraseña para verla */
                <div className={styles.censoredSection}>
                  <div className={styles.censoredBar}>
                    <span className={styles.censoredLabel}>CENSURADO</span>
                  </div>
                  <div className={styles.revealControls}>
                    <input
                      type="password"
                      className={`${styles.passwordInput} ${hasError ? styles.passwordInputError : ''}`}
                      placeholder={hasError ? '❌ Contraseña incorrecta...' : 'Contraseña...'}
                      value={passwords[playerId] || ''}
                      onChange={(e) => handlePasswordChange(playerId, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReveal(playerId)}
                    />
                    <button
                      className={styles.revealButton}
                      onClick={() => handleReveal(playerId)}
                    >
                      👁️ Revelar
                    </button>
                  </div>
                  {hasError && (
                    <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '0.4rem', textAlign: 'center' }}>
                      Contraseña incorrecta. Inténtalo de nuevo.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className={styles.finishButton} onClick={onFinish}>
        🏆 VER RANKING FINAL
      </button>
    </div>
  );
}
