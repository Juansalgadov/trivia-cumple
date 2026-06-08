'use client';

import styles from './Lobby.module.css';

export default function Lobby({ players, onStart, joinUrl, isHost, onRemovePlayer, onCloseLobby }) {
  const playerList = players ? Object.entries(players) : [];
  const playerCount = playerList.length;

  return (
    <div className={styles.lobbyContainer}>
      {/* Título */}
      <div className={styles.titleSection}>
        <h1 className={styles.mainTitle}>🎂 Trivia de Cumpleaños</h1>
        <p className={styles.subtitle}>¿Cuánto conoces a Juan?</p>
      </div>

      <div className={styles.lobbyContent}>
        {/* Panel izquierdo: URL de acceso */}
        {isHost && (
          <div className={styles.qrSection}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              📎 URL para los jugadores
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              wordBreak: 'break-all',
              fontSize: '0.9rem',
              color: '#00d4ff',
              fontFamily: 'monospace',
            }}>
              {joinUrl || 'http://localhost:3000'}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '0.5rem', textAlign: 'center' }}>
              Apunta tu QR de Adobe a esta URL
            </p>
          </div>
        )}

        {/* Panel derecho: Lista de jugadores */}
        <div className={styles.playersSection}>
          <div className={styles.playersHeader}>
            <h2 className={styles.playersTitle}>Jugadores</h2>
            <span className={styles.playerCount}>{playerCount}</span>
          </div>

          <div className={styles.playersList}>
            {playerList.length === 0 ? (
              <p className={styles.waitingText}>Esperando jugadores...</p>
            ) : (
              playerList.map(([playerId, player], index) => (
                <div
                  key={playerId}
                  className={styles.playerCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className={styles.playerEmoji}>🎮</span>
                  <span className={styles.playerName}>{player.nickname}</span>

                  {/* Botón de kick — solo visible para el host */}
                  {isHost && onRemovePlayer && (
                    <button
                      onClick={() => onRemovePlayer(playerId, player.nickname)}
                      title={`Expulsar a ${player.nickname}`}
                      style={{
                        marginLeft: 'auto',
                        background: 'rgba(255, 80, 80, 0.15)',
                        border: '1px solid rgba(255, 80, 80, 0.3)',
                        borderRadius: '8px',
                        color: '#ff6b6b',
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.6rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(255, 80, 80, 0.35)';
                        e.currentTarget.style.borderColor = '#ff6b6b';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(255, 80, 80, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.3)';
                      }}
                    >
                      ✕ Expulsar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Botón de inicio — siempre visible para el host, deshabilitado sin jugadores */}
      {isHost && (
        <button
          className={styles.startButton}
          onClick={onStart}
          disabled={playerCount === 0}
          style={playerCount === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          title={playerCount === 0 ? 'Necesitas al menos 1 jugador para iniciar' : ''}
        >
          🚀 INICIAR JUEGO {playerCount === 0 ? '(sin jugadores)' : `(${playerCount})`}
        </button>
      )}

      {/* Botón de cerrar lobby — siempre visible para el host */}
      {isHost && onCloseLobby && (
        <button
          onClick={onCloseLobby}
          style={{
            marginTop: '0.75rem',
            padding: '0.65rem 2rem',
            background: 'rgba(255, 80, 80, 0.12)',
            border: '1px solid rgba(255, 80, 80, 0.3)',
            borderRadius: '12px',
            color: '#ff6b6b',
            fontSize: '0.95rem',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(255, 80, 80, 0.28)';
            e.currentTarget.style.borderColor = '#ff6b6b';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(255, 80, 80, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.3)';
          }}
        >
          ❌ Cerrar Lobby
        </button>
      )}
    </div>
  );
}
