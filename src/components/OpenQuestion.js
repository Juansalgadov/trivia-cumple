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
export default function OpenQuestion({ openAnswers, players, onReveal, onAwardBonus, onRemoveBonus, onFinish, onRemovePlayer }) {
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

  const bonusAlreadyAwarded = openAnswers
    ? Object.values(openAnswers).some((a) => a.bonusAwarded)
    : false;

  const pending = [];
  const answeredIds = new Set(Object.keys(openAnswers || {}));
  playerEntries.forEach(([playerId, player]) => {
    if (!answeredIds.has(playerId)) {
      pending.push({ id: playerId, nickname: player.nickname });
    }
  });

  return (
    <div className={styles.openContainer}>
      <div className={styles.header}>
        <span className={styles.questionLabel}>Pregunta 15 — Pregunta Abierta</span>
        <h2 className={styles.questionText}>¿Quién es Juan para ti y por qué lo elegiste como amigo?</h2>
      </div>

      {pending.length > 0 && (
        <div style={{
          background: 'rgba(255,165,0,0.1)',
          border: '1px solid rgba(255,165,0,0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '800px',
        }}>
          <h3 style={{ color: '#ffa500', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>⏳ Jugadores escribiendo ({pending.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {pending.map(p => (
              <span key={p.id} style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '0.3rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
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
                      padding: 0
                    }}
                    title="Expulsar jugador"
                  >
                    ❌
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

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

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button 
          className={styles.finishButton} 
          onClick={onFinish}
          disabled={pending.length > 0}
          style={{ opacity: pending.length > 0 ? 0.5 : 1, marginTop: 0 }}
        >
          {pending.length > 0 ? `Faltan ${pending.length} por escribir` : '🏆 VER RANKING FINAL'}
        </button>
        {pending.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('¿Seguro que quieres avanzar? Los que no respondieron se quedarán en blanco.')) {
                onFinish();
              }
            }}
            style={{
              padding: '0 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Forzar avance
          </button>
        )}
      </div>
    </div>
  );
}
