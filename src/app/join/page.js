'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './join.module.css';

import {
  getActiveGameId,
  getGamePhase,
  joinGame,
  submitAnswer,
  cancelAnswer,
  submitOpenAnswer,
  onGameStateChanged,
  onPlayersChanged,
} from '../../lib/gameService';

import { questions } from '../../lib/questions';
import { calculateScore, calculateGrade, generateRanking } from '../../lib/scoreService';

import AnswerButtons from '../../components/AnswerButtons';
import Leaderboard from '../../components/Leaderboard';

// Cada cuántos segundos revisamos si el host ya creó la sala (mientras esperamos)
const POLL_INTERVAL_MS = 3000;

export default function JoinPage() {

  // ── Lo que sabe la app del jugador ──
  const [nickname, setNickname] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [gameId, setGameId] = useState(null);

  const router = useRouter();

  // ── Estado del juego en tiempo real ──
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState(null);
  const [playersLoaded, setPlayersLoaded] = useState(false);

  // ── Pregunta 15 ──
  const [openAnswer, setOpenAnswer] = useState('');
  const [openSubmitted, setOpenSubmitted] = useState(false);

  // ── Pantallas de la UI ──
  // 'name'          → formulario para escribir el nombre
  // 'waiting'       → el jugador escribió su nombre pero el host aún no creó la sala
  // 'joining'       → está intentando unirse (cargando)
  // 'playing'       → ya está dentro del juego
  // 'kicked'        → el host sacó al jugador del lobby
  // 'lobby_closed'  → el host cerró el lobby mientras el jugador estaba dentro
  const [screen, setScreen] = useState('name');
  const [error, setError] = useState(null);

  // Guardamos el nombre ingresado para usarlo después de que aparezca el lobby
  const pendingNickname = useRef('');
  // Referencia al interval de polling para poder cancelarlo
  const pollRef = useRef(null);
  // Bloqueo anti-doble-click: evita que el jugador se una dos veces
  const isSubmittingRef = useRef(false);

  // Bloqueo definitivo para que no haya clones si el intervalo se cruza con un clic
  const isJoiningRef = useRef(false);

  // ──────────────────────────────────────────────────────────────────────────
  // Función principal: intenta encontrar un juego y unirse
  // Si no hay juego, inicia el polling automático
  // ──────────────────────────────────────────────────────────────────────────
  const tryJoinGame = useCallback(async (nameToUse) => {
    if (isJoiningRef.current) return false;
    isJoiningRef.current = true;

    try {
      const activeId = await getActiveGameId();

      if (activeId) {
        // Verificar si la partida ya empezó — si no está en lobby, bloquear entrada
        const currentPhase = await getGamePhase(activeId);
        if (currentPhase && currentPhase !== 'lobby') {
          isJoiningRef.current = false;
          clearInterval(pollRef.current);
          pollRef.current = null;
          setScreen('name');
          setError('⛔ El juego ya comenzó. No puedes unirte en este momento.');
          return false;
        }

        // ✅ Hay un juego activo en lobby → unirse
        clearInterval(pollRef.current);
        pollRef.current = null;
        setScreen('joining');

        const newPlayerId = await joinGame(activeId, nameToUse);
        setGameId(activeId);
        setPlayerId(newPlayerId);
        setScreen('playing');
        return true;
      } else {
        isJoiningRef.current = false;
        setScreen('waiting');
        return false;
      }
    } catch (err) {
      isJoiningRef.current = false;
      console.error('Error al unirse:', err);
      setError('Error de conexión. Intenta de nuevo.');
      setScreen('name');
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Cuando el jugador envía su nombre
  // ──────────────────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async (e) => {
    e.preventDefault();

    // Bloqueo anti-doble-click: si ya estamos procesando, ignoramos el click extra
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const name = nickname.trim();
    if (!name) {
      setError('Escribe un nombre para continuar');
      isSubmittingRef.current = false;
      return;
    }

    setError(null);
    pendingNickname.current = name;

    const joined = await tryJoinGame(name);

    // Si no pudimos unirnos (porque no había juego), iniciamos el polling
    if (!joined && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        await tryJoinGame(pendingNickname.current);
      }, POLL_INTERVAL_MS);
    }

    // Liberamos el bloqueo en caso de que vuelva a la pantalla de nombre por error
    isSubmittingRef.current = false;
  }, [nickname, tryJoinGame]);

  // ──────────────────────────────────────────────────────────────────────────
  // Cuando ya tenemos gameId → conectamos los vigilantes de Firebase
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return;

    const unsubGame = onGameStateChanged(gameId, (state) => {
      setGameState(state);
      // Si el host cerró el lobby mientras estábamos dentro, mostramos aviso
      if (state && state.phase === 'closed') {
        clearInterval(pollRef.current);
        pollRef.current = null; // ✅ Fix: resetear la ref para que el polling pueda reiniciarse si vuelve a la pantalla inicial
        setScreen('lobby_closed');
      }
    });

    const unsubPlayers = onPlayersChanged(gameId, (data) => {
      setPlayers(data);
      setPlayersLoaded(true);
    });

    // Al salir de la página, apagamos los vigilantes y el polling
    return () => {
      unsubGame();
      unsubPlayers();
      clearInterval(pollRef.current);
    };
  }, [gameId]);

  // Limpiar el polling si el componente se desmonta
  useEffect(() => {
    return () => clearInterval(pollRef.current);
  }, []);

  // Fix bug P15: resetear openSubmitted cada vez que el juego entra en fase open_question
  // Evita que un estado stale de una sesión anterior marque la pregunta como ya respondida
  useEffect(() => {
    if (gameState?.phase === 'open_question') {
      setOpenSubmitted(false);
    }
  }, [gameState?.phase]);

  // Detectar si el host nos sacó del lobby:
  // Fix race condition: solo marcar 'kicked' si ya han pasado al menos 2s desde que nos unimos.
  // Esto evita que un snapshot lento de players llegue antes que el nuestro y nos marque como expulsados por error.
  const joinedAtRef = useRef(null);
  useEffect(() => {
    if (screen === 'playing' && !joinedAtRef.current) {
      joinedAtRef.current = Date.now();
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'playing' && playerId && playersLoaded) {
      const elapsed = joinedAtRef.current ? Date.now() - joinedAtRef.current : 0;
      if (elapsed < 2000) return; // Esperar al menos 2s antes de verificar kick
      if (!players || !players[playerId]) {
        clearInterval(pollRef.current);
        pollRef.current = null; // ✅ Fix: resetear ref
        setScreen('kicked');
      }
    }
  }, [players, playerId, screen, playersLoaded]);

  // ──────────────────────────────────────────────────────────────────────────
  // Enviar respuesta a pregunta de selección múltiple
  // ──────────────────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (letter) => {
    if (!gameId || !playerId || !gameState) return;
    try {
      await submitAnswer(gameId, playerId, gameState.currentQuestion, letter);
    } catch (err) {
      console.error('Error enviando respuesta:', err);
      setError('No se pudo enviar tu respuesta. Inténtalo de nuevo.'); // ✅ Fix: mostrar error en pantalla
    }
  }, [gameId, playerId, gameState]);

  // Cancela el voto actual del jugador para la pregunta en curso
  const handleCancelAnswer = useCallback(async () => {
    if (!gameId || !playerId || !gameState) return;
    try {
      await cancelAnswer(gameId, playerId, gameState.currentQuestion);
    } catch (err) {
      console.error('Error cancelando voto:', err);
    }
  }, [gameId, playerId, gameState]);

  // ──────────────────────────────────────────────────────────────────────────
  // Enviar respuesta abierta (pregunta 15)
  // ──────────────────────────────────────────────────────────────────────────
  const handleOpenSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!gameId || !playerId || !openAnswer.trim()) return;
    try {
      await submitOpenAnswer(gameId, playerId, openAnswer.trim());
      setOpenSubmitted(true);
    } catch (err) {
      console.error('Error enviando respuesta abierta:', err);
    }
  }, [gameId, playerId, openAnswer]);

  // ──────────────────────────────────────────────────────────────────────────
  // Datos derivados del estado
  // ──────────────────────────────────────────────────────────────────────────
  const phase = gameState ? gameState.phase : 'lobby';
  const currentQuestionIndex = gameState ? gameState.currentQuestion : 0;
  const currentQuestion = questions[currentQuestionIndex] || null;

  const myPlayerData = players && playerId ? players[playerId] : null;
  const selectedAnswer = myPlayerData?.answers?.[String(currentQuestionIndex)] ?? null;

  const myScore = myPlayerData ? calculateScore(myPlayerData.answers, questions) : 0;
  const myBonus = myPlayerData?.bonusPoint === true;
  const myGrade = calculateGrade(myScore, myBonus);
  const ranking = generateRanking(players, questions);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDERIZADO
  // ──────────────────────────────────────────────────────────────────────────

  // Botón de volver reutilizable — aparece en todas las pantallas
  const BackButton = (
    <button
      onClick={() => router.push('/')}
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        zIndex: 100,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
      }}
    >
      Volver
    </button>
  );

  // ── PANTALLA: Lobby cerrado por el host ──
  if (screen === 'lobby_closed') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>🚪</div>
          <h2 className={styles.waitingTitle}>Lobby cerrado</h2>
          <p className={styles.waitingText}>
            El host cerró la sala.<br />
            Espera a que cree una nueva partida.
          </p>
          <button
            onClick={() => {
              isJoiningRef.current = false;
              isSubmittingRef.current = false;
              setScreen('name');
              setNickname('');
              setGameId(null);
              setGameState(null);
              setPlayers(null);
              setPlayersLoaded(false);
            }}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            🔄 Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── PANTALLA: Kickeado ──
  if (screen === 'kicked') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>🚫</div>
          <h2 className={styles.waitingTitle}>Fuiste removido</h2>
          <p className={styles.waitingText}>
            El host te sacó del lobby.<br />
            Si crees que fue un error, vuelve a intentarlo.
          </p>
          <button
            onClick={() => {
              isJoiningRef.current = false;
              isSubmittingRef.current = false;
              setScreen('name');
              setNickname('');
              setGameId(null);
              setGameState(null);
              setPlayers(null);
              setPlayersLoaded(false);
            }}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            🔄 Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  // ── PANTALLA 1: Formulario de nombre ──
  if (screen === 'name') {
    return (
      <div className={styles.joinContainer}>
        {BackButton}
        <div className={styles.joinCard}>
          <div className={styles.joinHeader}>
            <h1 className={styles.joinTitle}>🎂</h1>
            <h2 className={styles.joinSubtitle}>Trivia de Cumpleaños</h2>
            <p className={styles.joinDescription}>¿Cómo te llamas?</p>
          </div>

          <form onSubmit={handleJoin} className={styles.joinForm}>
            <input
              type="text"
              className={styles.nicknameInput}
              placeholder="Tu nombre o apodo..."
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setError(null); }}
              maxLength={20}
              autoFocus
              autoComplete="off"
            />

            {error && <p className={styles.errorText}>{error}</p>}

            <button
              type="submit"
              className={styles.joinButton}
              disabled={!nickname.trim()}
            >
              🚀 UNIRSE
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── PANTALLA 2: Lista de espera — el host aún no creó la sala ──
  if (screen === 'waiting') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>⏳</div>
          <h2 className={styles.waitingTitle}>¡Hola, {pendingNickname.current}!</h2>
          <p className={styles.waitingText}>
            El host aún no ha abierto la sala.<br />
            Te unirás automáticamente cuando esté lista.
          </p>
          <div className={styles.waitingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Revisando cada {POLL_INTERVAL_MS / 1000} segundos...
          </p>
        </div>
      </div>
    );
  }

  // ── PANTALLA 3: Uniéndose (cargando) ──
  if (screen === 'joining') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>🎮</div>
          <h2 className={styles.waitingTitle}>Entrando al juego...</h2>
          <div className={styles.waitingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    );
  }

  // ── PANTALLAS DE JUEGO (screen === 'playing') ──

  // Lobby: esperando que el host arranque
  if (phase === 'lobby') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>🎉</div>
          <h2 className={styles.waitingTitle}>¡Ya estás dentro, {myPlayerData?.nickname}!</h2>
          <p className={styles.waitingText}>Esperando a que el host inicie el juego...</p>
          <div className={styles.waitingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          {players && (
            <p className={styles.playerCountText}>
              {Object.keys(players).length} jugador(es) conectados
            </p>
          )}
        </div>
      </div>
    );
  }

  // Preguntas 1-14
  if (phase === 'question' && currentQuestion?.type === 'multiple') {
    return (
      <>
        {BackButton}
        <AnswerButtons
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          onAnswer={handleAnswer}
          onCancelAnswer={handleCancelAnswer}
          selectedAnswer={selectedAnswer}
        />
      </>
    );
  }

  // Resultados (esperando que el host avance) — MODO SUSPENSO: no revelar nada
  if (phase === 'results') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>⏳</div>
          <h2 className={styles.waitingTitle}>Votación cerrada</h2>
          <p className={styles.waitingText}>
            El host está revisando los resultados.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Las respuestas correctas se revelarán al final del juego.
          </p>
          <div className={styles.waitingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    );
  }

  // Pregunta 15 abierta
  if (phase === 'open_question') {
    if (openSubmitted) {
      return (
        <div className={styles.waitingContainer}>
          {BackButton}
          <div className={styles.waitingCard}>
            <div className={styles.waitingIcon}>💌</div>
            <h2 className={styles.waitingTitle}>¡Respuesta enviada!</h2>
            <p className={styles.waitingText}>Gracias por tu mensaje. Esperando al host...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.openContainer}>
        {BackButton}
        <div className={styles.openCard}>
          <span className={styles.openLabel}>Pregunta 15 — Pregunta Abierta</span>
          <h2 className={styles.openQuestion}>
            ¿Quién es Juan para ti y por qué lo elegiste como amigo?
          </h2>
          <form onSubmit={handleOpenSubmit} className={styles.openForm}>
            <textarea
              className={styles.openTextarea}
              placeholder="Escribe tu respuesta aquí..."
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              rows={5}
              maxLength={500}
              autoFocus
            />
            <span className={styles.charCount}>{openAnswer.length}/500</span>
            <button
              type="submit"
              className={styles.openSubmitButton}
              disabled={!openAnswer.trim()}
            >
              📤 ENVIAR RESPUESTA
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Leaderboard final — el jugador espera mientras el host revela el ranking en la TV
  if (phase === 'final') {
    return (
      <div className={styles.waitingContainer}>
        {BackButton}
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>🏆</div>
          <h2 className={styles.waitingTitle}>¡Juego terminado!</h2>
          <p className={styles.waitingText}>
            El host está revelando el ranking en la pantalla grande.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Tu resultado: <strong style={{ color: '#00d4ff' }}>{myGrade.toFixed(1)}</strong> ({myScore}/14{myBonus ? ' + ⭐' : ''})
          </p>
          <div className={styles.waitingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    );
  }

  // Fallback mientras sincroniza
  return (
    <div className={styles.waitingContainer}>
      {BackButton}
      <div className={styles.waitingCard}>
        <div className={styles.waitingIcon}>⏳</div>
        <h2 className={styles.waitingTitle}>Sincronizando...</h2>
        <p className={styles.waitingText}>Conectando con el juego...</p>
      </div>
    </div>
  );
}
