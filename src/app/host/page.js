// ============================================================================
// host/page.js — Panel de Control del Presentador
// ============================================================================
//
// Esta es la pantalla que maneja el Host (presentador) desde la TV o PC.
// Muestra una pantalla diferente según la etapa del juego:
//   - Lobby: sala de espera con lista de jugadores
//   - Pregunta: la pregunta activa con contador de respuestas
//   - Resultados: gráfico con quién respondió qué
//   - Pregunta 15: respuestas abiertas de los jugadores
//   - Final: ranking con notas de todos
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './host.module.css';

// Importamos las funciones que necesitamos para controlar el juego
import {
  createGame,
  closeLobby,
  setCurrentQuestion,
  showResults,
  setPhase,
  setRevealedOptions,
  revealOpenAnswer,
  awardBonusPoint,
  removeBonusPoint,
  removePlayer,
  onGameStateChanged,
  onPlayersChanged,
  onOpenAnswersChanged,
} from '../../lib/gameService';

import { questions, TOTAL_SCORED_QUESTIONS } from '../../lib/questions';
import { generateRanking } from '../../lib/scoreService';

// Importamos las pantallas/componentes visuales que se muestran en cada fase
import Lobby from '../../components/Lobby';
import QuestionDisplay from '../../components/QuestionDisplay';
import ResultsChart from '../../components/ResultsChart';
import OpenQuestion from '../../components/OpenQuestion';
import Leaderboard from '../../components/Leaderboard';

/**
 * Página del Host — Controla todo el juego desde la PC/TV.
 *
 * Flujo completo:
 * lobby → pregunta → resultados → pregunta → ... → pregunta 15 → ranking final
 */
export default function HostPage() {
  // ==========================================================================
  // MEMORIA DE LA PANTALLA
  // ==========================================================================
  // Cada useState guarda un dato. Cuando ese dato cambia, la pantalla
  // se actualiza automáticamente para mostrar la información nueva.

  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState(null);
  const [openAnswers, setOpenAnswers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createError, setCreateError] = useState(null);
  // Estado local para mostrar las respuestas correctas DESPUÉS del ranking
  const [showAnswers, setShowAnswers] = useState(false);

  const router = useRouter();

  const unsubsRef = useRef({ game: null, players: null, open: null });

  // ==========================================================================
  // AL CARGAR LA PÁGINA
  // ==========================================================================
  // Este bloque se ejecuta UNA SOLA VEZ cuando el host abre la página.
  // Busca si ya hay una partida activa para retomar, o espera a que se cree una.
  useEffect(() => {
    let isMounted = true;
    let unsubGame = null;
    let unsubPlayers = null;
    let unsubOpen = null;

    // Al abrir la página, buscamos primero si ya existe una partida activa.
    // Si existe, la retomamos. Si no, mostramos el botón para crear una nueva.
    // Esto evita crear partidas duplicadas si el host recarga la página por error.
    async function checkAndConnect(existingGameId) {
      try {
        // Conectar los "vigilantes" a la partida que ya tenemos
        unsubGame = onGameStateChanged(existingGameId, (state) => {
          if (!isMounted) return;
          setGameState(state);
          setIsLoading(false);
        });

        unsubPlayers = onPlayersChanged(existingGameId, (playersData) => {
          if (!isMounted) return;
          setPlayers(playersData);
        });

        unsubOpen = onOpenAnswersChanged(existingGameId, (openData) => {
          if (!isMounted) return;
          setOpenAnswers(openData);
        });
      } catch (error) {
        console.error('Error conectando al juego:', error);
        if (isMounted) setIsLoading(false);
      }
    }

    async function initializeGame() {
      try {
        // Importamos la función que busca si hay un juego activo en Firebase
        const { getActiveGameId } = await import('../../lib/gameService');
        const existingId = await getActiveGameId();

        if (!isMounted) return;

        if (existingId) {
          // Hay una partida en curso → la retomamos sin crear una nueva
          setGameId(existingId);
          await checkAndConnect(existingId);
        } else {
          // No hay partida → mostramos el botón para crearla
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error inicializando:', error);
        if (isMounted) setIsLoading(false);
      }
    }

    initializeGame();

    return () => {
      isMounted = false;
      if (unsubGame) unsubGame();
      if (unsubPlayers) unsubPlayers();
      if (unsubOpen) unsubOpen();
    };
  }, []);

  // ==========================================================================
  // ACCIONES DE LOS BOTONES
  // ==========================================================================

  // Crea una nueva partida en Firebase cuando el host presiona el botón
  const handleCreateGame = useCallback(async () => {
    setIsLoading(true);
    setCreateError(null);
    try {
      const newGameId = await createGame();
      setGameId(newGameId);

      // Conectamos los vigilantes y guardamos la función para apagarlos después
      unsubsRef.current.game = onGameStateChanged(newGameId, (state) => {
        setGameState(state);
        setIsLoading(false);
      });
      unsubsRef.current.players = onPlayersChanged(newGameId, (data) => {
        setPlayers(data);
      });
      unsubsRef.current.open = onOpenAnswersChanged(newGameId, (data) => {
        setOpenAnswers(data);
      });
    } catch (err) {
      console.error('Error al crear partida:', err);
      setCreateError('No se pudo crear la partida. ¿Está Firebase configurado?');
      setIsLoading(false);
    }
  }, []);

  // Arranca el juego: pasa de la sala de espera a la primera pregunta
  const handleStartGame = useCallback(async () => {
    if (!gameId) return;
    await setCurrentQuestion(gameId, 0);
  }, [gameId]);

  // Cierra la votación y muestra el gráfico de resultados en la TV
  const handleShowResults = useCallback(async () => {
    if (!gameId) return;
    await showResults(gameId);
  }, [gameId]);

  const handleRevealOption = useCallback(async (count) => {
    if (!gameId) return;
    await setRevealedOptions(gameId, count);
  }, [gameId]);

  // Avanza a la siguiente pregunta. Si ya se acabaron todas, va al ranking final.
  const handleNextQuestion = useCallback(async () => {
    if (!gameId || !gameState) return;
    const nextIndex = gameState.currentQuestion + 1;

    if (nextIndex >= questions.length) {
      await setPhase(gameId, 'final');
    } else {
      await setCurrentQuestion(gameId, nextIndex);
    }
  }, [gameId, gameState]);

  // Muestra la respuesta oculta de un jugador en la pregunta 15
  const handleRevealAnswer = useCallback(async (playerId) => {
    if (!gameId) return;
    await revealOpenAnswer(gameId, playerId);
  }, [gameId]);

  // Le da el punto extra a un jugador por su respuesta en la pregunta 15
  const handleAwardBonus = useCallback(async (playerId) => {
    if (!gameId) return;
    await awardBonusPoint(gameId, playerId);
  }, [gameId]);

  // Le quita el punto extra a un jugador (si el host se equivocó)
  const handleRemoveBonus = useCallback(async (playerId) => {
    if (!gameId) return;
    await removeBonusPoint(gameId, playerId);
  }, [gameId]);

  // Termina el juego y muestra el ranking final en pantalla
  const handleFinish = useCallback(async () => {
    if (!gameId) return;
    await setPhase(gameId, 'final');
  }, [gameId]);

  // Saca a un jugador del lobby — le pregunta confirmación antes de borrarlo
  const handleRemovePlayer = useCallback(async (playerId, nickname) => {
    if (!gameId) return;
    const name = nickname || (players && players[playerId]?.nickname) || 'Jugador';
    const confirmed = window.confirm(`¿Expulsar a "${name}" del lobby?`);
    if (!confirmed) return;
    try {
      await removePlayer(gameId, playerId);
    } catch (err) {
      console.error('Error al sacar jugador:', err);
    }
  }, [gameId, players]);

  // Cierra el lobby: avisa a todos los jugadores y marca la sala como cerrada
  const handleCloseLobby = useCallback(async () => {
    if (!gameId) return;
    const confirmed = window.confirm('¿Cerrar el lobby? Todos los jugadores serán desconectados.');
    if (!confirmed) return;
    try {
      await closeLobby(gameId);
      // ✅ Fix: desmontar suscriptores activos ANTES de limpiar el estado
      // para evitar que reciban updates de una partida ya cerrada y dupliquen datos
      if (unsubsRef.current.game) { unsubsRef.current.game(); unsubsRef.current.game = null; }
      if (unsubsRef.current.players) { unsubsRef.current.players(); unsubsRef.current.players = null; }
      if (unsubsRef.current.open) { unsubsRef.current.open(); unsubsRef.current.open = null; }
      // Reiniciamos el estado local para que el host vea la pantalla de crear partida
      setGameId(null);
      setGameState(null);
      setPlayers(null);
      setOpenAnswers(null);
    } catch (err) {
      console.error('Error al cerrar lobby:', err);
    }
  }, [gameId]);

  // Alternar pantalla completa
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error intentando entrar en pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // ==========================================================================
  // DATOS CALCULADOS A PARTIR DEL ESTADO
  // ==========================================================================

  // Número de la pregunta que se está mostrando ahora mismo
  const currentQuestionIndex = gameState ? gameState.currentQuestion : 0;
  // Los datos completos de esa pregunta (texto, opciones, respuesta)
  const currentQuestion = questions[currentQuestionIndex] || null;
  // En qué etapa del juego estamos (lobby, pregunta, resultados...)
  const phase = gameState ? gameState.phase : 'lobby';

  // Cuántos jugadores hay en total y cuántos ya respondieron la pregunta actual
  const totalPlayers = players ? Object.keys(players).length : 0;
  const answeredCount = players
    ? Object.values(players).filter(
        (p) => p.answers && p.answers[String(currentQuestionIndex)]
      ).length
    : 0;

  // Lista ordenada de jugadores con sus notas (para el ranking final)
  const ranking = generateRanking(players, questions);

  // URL que verán los jugadores — siempre usa window.location.origin para ser correcta en cualquier entorno
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join`
    : '/join';

  // ==========================================================================
  // QUÉ PANTALLA MOSTRAR
  // ──────────────────────────────────────────────────────────────────────────
  // RENDERIZADO
  // ──────────────────────────────────────────────────────────────────────────

  // Botones flotantes (Volver y Pantalla Completa)
  const TopControls = (
    <div style={{
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 100,
    }}>
      <button
        onClick={() => router.push('/')}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
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
        Volver al Inicio
      </button>
      <button
        onClick={toggleFullScreen}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
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
        🖥️ Pantalla Completa
      </button>
    </div>
  );

  // Pantalla de carga mientras lee de Firebase
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        {TopControls}
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Conectando con la sala...</p>
      </div>
    );
  }

  // Pantalla inicial: si no hay partida activa, el host debe crear una manualmente
  if (!gameId) {
    return (
      <div className={styles.loadingContainer}>
        {TopControls}
        <span style={{ fontSize: '3rem' }}>🎂</span>
        <p className={styles.loadingText}>¡Bienvenido, Host!</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginTop: '-0.5rem' }}>
          No hay ninguna partida activa. Crea una para que los invitados puedan entrar.
        </p>

        {createError && (
          <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '320px', textAlign: 'center' }}>
            ⚠️ {createError}
          </p>
        )}

        <button
          onClick={handleCreateGame}
          style={{
            marginTop: '1.5rem',
            padding: '1rem 2.5rem',
            fontSize: '1.2rem',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00d4ff, #3498db)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🎮 Crear Nueva Partida
        </button>
      </div>
    );
  }

  return (
    <div className={styles.hostContainer}>
      {TopControls}
      {/* Indicador de Game ID para debugging */}
      <div className={styles.gameIdBadge}>
        ID: {gameId ? gameId.slice(-6) : '...'}
      </div>

      {/* FASE 1: Lobby — Sala de espera */}
      {phase === 'lobby' && (
        <Lobby
          players={players}
          onStart={handleStartGame}
          joinUrl={joinUrl}
          isHost={true}
          onRemovePlayer={handleRemovePlayer}
          onCloseLobby={handleCloseLobby}
        />
      )}

      {/* FASE 2a: Pregunta activa — Mostrando pregunta y opciones */}
      {phase === 'question' && currentQuestion && currentQuestion.type === 'multiple' && (
      <QuestionDisplay
        key={currentQuestionIndex}
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={TOTAL_SCORED_QUESTIONS}
          answeredCount={answeredCount}
          totalPlayers={totalPlayers}
          players={players}
          questionIndex={currentQuestionIndex}
          onShowResults={handleShowResults}
          revealedOptions={gameState?.revealedOptions || 0}
          onRevealOption={handleRevealOption}
          onRemovePlayer={handleRemovePlayer}
        />
      )}

      {/* FASE 2b: Resultados — Gráfico de respuestas */}
      {phase === 'results' && currentQuestion && (
        <ResultsChart
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          players={players}
          questionIndex={currentQuestionIndex}
          onNext={handleNextQuestion}
          isLastQuestion={currentQuestionIndex === TOTAL_SCORED_QUESTIONS - 1}
        />
      )}

      {/* FASE 3: Pregunta 15 abierta con censura */}
      {phase === 'open_question' && (
        <OpenQuestion
          openAnswers={openAnswers}
          players={players}
          onReveal={handleRevealAnswer}
          onAwardBonus={handleAwardBonus}
          onRemoveBonus={handleRemoveBonus}
          onFinish={handleFinish}
          onRemovePlayer={handleRemovePlayer}
        />
      )}

      {/* FASE 4: Leaderboard final */}
      {phase === 'final' && !showAnswers && (
        <Leaderboard
          ranking={ranking}
          isHost={true}
          onShowAnswers={() => setShowAnswers(true)}
        />
      )}

      {/* FASE 5 (local, solo host): Respuestas correctas de todas las preguntas */}
      {phase === 'final' && showAnswers && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem',
          gap: '1.5rem',
          minHeight: '100vh',
        }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', color: '#f1c40f', textAlign: 'center' }}>
            💡 Respuestas Correctas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
            Trivia de Cumpleaños de Juan
          </p>
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.filter(q => q.type === 'multiple').map((q, idx) => (
              <div key={q.id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '1.2rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.2rem',
              }}>
                <span style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#00d4ff',
                  minWidth: '2rem',
                  textAlign: 'center',
                }}>{q.id}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>{q.text}</p>
                  <div style={{
                    background: 'rgba(0,255,136,0.1)',
                    border: '1px solid rgba(0,255,136,0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{ color: '#00ff88', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                      ✅ {q.correctAnswer} — {q.options[q.correctAnswer]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => setShowAnswers(false)}
              style={{
                padding: '0.75rem 2rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              ← Volver al Ranking
            </button>
            <button
              onClick={handleCloseLobby}
              style={{
                padding: '0.75rem 2rem',
                background: 'rgba(255, 80, 80, 0.2)',
                border: '1px solid rgba(255, 80, 80, 0.4)',
                borderRadius: '12px',
                color: '#ff6b6b',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ❌ Terminar Partida y Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
