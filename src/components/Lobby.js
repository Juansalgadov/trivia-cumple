'use client';

import { QRCodeSVG } from 'qrcode.react';
import styles from './Lobby.module.css';

export default function Lobby({ players, onStart, joinUrl, isHost, onRemovePlayer, onCloseLobby }) {
  const playerList = players ? Object.entries(players) : [];
  const playerCount = playerList.length;
  const qrUrl = joinUrl || 'https://trivia-cumple.vercel.app/join';

  return (
    <div className={styles.lobbyContainer}>

      {/* Titulo */}
      <div className={styles.titleSection}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Sala de espera
        </div>
        <h1 className={styles.mainTitle}>
          Trivia de <span className={styles.mainTitleAccent}>Cumpleaños</span>
        </h1>
        <p className={styles.subtitle}>¿Cuánto conoces a Juan?</p>
      </div>

      {/* Contenido: QR + Jugadores */}
      <div className={styles.lobbyContent}>

        {/* QR */}
        {isHost && (
          <div className={styles.qrSection}>
            <span className={styles.qrLabel}>Escanea para unirte</span>
            <div className={styles.qrWrapper}>
              <QRCodeSVG
                value={qrUrl}
                size={190}
                bgColor="#ffffff"
                fgColor="#08080f"
                level="M"
              />
            </div>
            <span className={styles.qrUrl}>{qrUrl}</span>
          </div>
        )}

        {/* Lista de jugadores */}
        <div className={styles.playersSection}>
          <div className={styles.playersHeader}>
            <h2 className={styles.playersTitle}>Jugadores conectados</h2>
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
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  <div className={styles.playerAvatar}>
                    {player.nickname.charAt(0)}
                  </div>
                  <span className={styles.playerName}>{player.nickname}</span>

                  {isHost && onRemovePlayer && (
                    <button
                      className={styles.kickButton}
                      onClick={() => onRemovePlayer(playerId, player.nickname)}
                      title={`Expulsar a ${player.nickname}`}
                    >
                      Expulsar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Botones de accion del host */}
      {isHost && (
        <div className={styles.actionsRow}>
          <button
            className={styles.startButton}
            onClick={onStart}
            disabled={playerCount === 0}
            title={playerCount === 0 ? 'Necesitas al menos 1 jugador' : ''}
          >
            {playerCount === 0 ? 'Esperando jugadores...' : `Iniciar juego (${playerCount})`}
          </button>

          {onCloseLobby && (
            <button className={styles.closeLobbyButton} onClick={onCloseLobby}>
              Cerrar lobby
            </button>
          )}
        </div>
      )}

    </div>
  );
}
