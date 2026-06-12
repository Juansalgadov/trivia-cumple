// ============================================================================
// gameService.js — El Motor del Juego
// ============================================================================
//
// Este es el "cerebro" de la aplicación. Contiene todas las funciones
// que permiten que el juego avance: crear la sala de espera, permitir
// que la gente entre, enviar respuestas y cambiar de pregunta.
//
// Todas estas funciones se comunican con la base de datos para guardar
// los datos de manera instantánea, de forma que cuando el presentador (Host)
// hace un cambio, todos los celulares se actualizan al mismo tiempo.
// ============================================================================

import { database } from './firebase';

import {
  ref,
  set,
  push,
  get,
  update,
  onValue,
  off,
  onDisconnect,
} from 'firebase/database';

// ============================================================================
// CREACIÓN Y GESTIÓN DE PARTIDAS
// ============================================================================

/**
 * Crea una nueva "sala de juego" desde cero.
 * Le asigna un código único automáticamente para no mezclar partidas.
 */
export async function createGame() {
  // Si Firebase no está configurado todavía (.env.local vacío), lanzamos un error claro
  if (!database) {
    throw new Error('Firebase no está configurado. Crea el archivo .env.local con tus credenciales.');
  }

  const gamesRef = ref(database, 'games');
  const newGameRef = push(gamesRef);

  // La partida empieza en estado de sala de espera ("lobby")
  await set(newGameRef, {
    phase: 'lobby',
    currentQuestion: 0,
    showResults: false,
    createdAt: Date.now(),
    hostConnected: true,
  });

  // Si el host cierra la pestaña sin cerrar el lobby, Firebase marca automáticamente
  // la partida como 'closed' para que los jugadores no queden bloqueados
  await onDisconnect(newGameRef).update({ phase: 'closed' });

  return newGameRef.key;
}

/**
 * Permite que una persona con su celular entre a la sala de juego.
 * Le crea su perfil con puntaje 0.
 */
export async function joinGame(gameId, nickname) {
  if (!database) throw new Error('Firebase no está configurado.');
  const playersRef = ref(database, `games/${gameId}/players`);
  const newPlayerRef = push(playersRef);

  await set(newPlayerRef, {
    nickname: nickname,
    score: 0,
    bonusPoint: false,
    joinedAt: Date.now(),
  });

  // Si el jugador cierra su pestaña, Firebase borra automáticamente su entrada
  // Esto evita que queden "fantasmas" en la lista de jugadores del lobby
  await onDisconnect(newPlayerRef).remove();

  return newPlayerRef.key;
}

/**
 * Elimina a un jugador de la partida (usada por el host desde el lobby).
 * Borra completamente su entrada de la base de datos.
 */
export async function removePlayer(gameId, playerId) {
  if (!database) throw new Error('Firebase no está configurado.');
  const { remove } = await import('firebase/database');
  const playerRef = ref(database, `games/${gameId}/players/${playerId}`);
  await remove(playerRef);
}

/**
 * Cierra el lobby: marca la partida como 'closed' en Firebase.
 * Los jugadores dentro detectan este estado y ven una pantalla de aviso.
 * También impide que nuevos jugadores entren a una sala vieja.
 */
export async function closeLobby(gameId) {
  if (!database) throw new Error('Firebase no está configurado.');
  const gameRef = ref(database, `games/${gameId}`);
  // Cancelar el onDisconnect primero para que no se dispare al salir
  await onDisconnect(gameRef).cancel();
  await update(gameRef, { phase: 'closed' });
}


// ============================================================================
// ENVÍO DE RESPUESTAS
// ============================================================================

/**
 * Guarda el botón (A, B, C o D) que tocó un jugador en su celular.
 */
export async function submitAnswer(gameId, playerId, questionIndex, answer) {
  const answerRef = ref(database, `games/${gameId}/players/${playerId}/answers`);
  await update(answerRef, {
    [String(questionIndex)]: answer,
  });
}

/**
 * Cancela el voto de un jugador borrando su respuesta para la pregunta actual.
 * Permite que el jugador vuelva a votar mientras la pregunta esté abierta.
 */
export async function cancelAnswer(gameId, playerId, questionIndex) {
  const { remove } = await import('firebase/database');
  const answerRef = ref(database, `games/${gameId}/players/${playerId}/answers/${String(questionIndex)}`);
  await remove(answerRef);
}

/**
 * Guarda el texto libre que escribe un jugador en la pregunta final.
 * Por defecto, este texto se guarda como "oculto" (censurado) para
 * que el presentador lo revele después.
 */
export async function submitOpenAnswer(gameId, playerId, text) {
  const openRef = ref(database, `games/${gameId}/openAnswers/${playerId}`);
  await set(openRef, {
    text: text,
    revealed: false,
    bonusAwarded: false,
    submittedAt: Date.now(),
  });
}

/**
 * Permite a un jugador cancelar su respuesta libre en la pregunta 15
 * para poder reescribirla.
 */
export async function cancelOpenAnswer(gameId, playerId) {
  const { remove } = await import('firebase/database');
  const openRef = ref(database, `games/${gameId}/openAnswers/${playerId}`);
  await remove(openRef);
}

// ============================================================================
// CONTROLES DEL PRESENTADOR (HOST)
// ============================================================================

/**
 * Cambia la etapa del juego (ej: pasar del lobby a las preguntas).
 */
export async function setPhase(gameId, phase) {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, { phase });
}

/**
 * Avanza a la siguiente pregunta.
 */
export async function setCurrentQuestion(gameId, questionIndex) {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, {
    currentQuestion: questionIndex,
    // Si llegamos a la pregunta final, cambiamos a un modo especial
    phase: questionIndex === 14 ? 'open_question' : 'question',
    showResults: false,
    revealedOptions: 0, // Reiniciamos el contador de opciones reveladas al cambiar de pregunta
  });
}

/**
 * Actualiza cuántas opciones (A, B, C, D) están visibles actualmente.
 * Se usa para revelar las opciones una por una.
 */
export async function setRevealedOptions(gameId, count) {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, {
    revealedOptions: count
  });
}

/**
 * Muestra el gráfico con la respuesta correcta en la pantalla grande.
 */
export async function showResults(gameId) {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, {
    phase: 'results',
    showResults: true,
  });
}

/**
 * Quita la censura de la respuesta de un jugador en la pregunta final.
 */
export async function revealOpenAnswer(gameId, playerId) {
  const openRef = ref(database, `games/${gameId}/openAnswers/${playerId}`);
  await update(openRef, { revealed: true });
}

/**
 * Le da 1 punto extra especial a un jugador.
 */
export async function awardBonusPoint(gameId, playerId) {
  const openRef = ref(database, `games/${gameId}/openAnswers/${playerId}`);
  await update(openRef, { bonusAwarded: true });

  const playerRef = ref(database, `games/${gameId}/players/${playerId}`);
  await update(playerRef, { bonusPoint: true });
}

/**
 * Le quita el punto extra al jugador (en caso de error).
 */
export async function removeBonusPoint(gameId, playerId) {
  const openRef = ref(database, `games/${gameId}/openAnswers/${playerId}`);
  await update(openRef, { bonusAwarded: false });

  const playerRef = ref(database, `games/${gameId}/players/${playerId}`);
  await update(playerRef, { bonusPoint: false });
}

// ============================================================================
// OBSERVADORES EN TIEMPO REAL
// ============================================================================

/**
 * Esta función se queda "vigilando" el estado de la partida.
 * Cada vez que hay un cambio mínimo, avisa instantáneamente
 * a todos los celulares conectados.
 */
export function onGameStateChanged(gameId, callback) {
  if (!database) return () => {}; // Si no hay Firebase, devolvemos una función vacía
  const gameRef = ref(database, `games/${gameId}`);
  onValue(gameRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(gameRef);
}

/**
 * Vigila la lista de jugadores que van entrando a la partida.
 */
export function onPlayersChanged(gameId, callback) {
  if (!database) return () => {};
  const playersRef = ref(database, `games/${gameId}/players`);
  onValue(playersRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(playersRef);
}

/**
 * Vigila las respuestas enviadas para la última pregunta escrita.
 */
export function onOpenAnswersChanged(gameId, callback) {
  if (!database) return () => {};
  const openRef = ref(database, `games/${gameId}/openAnswers`);
  onValue(openRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(openRef);
}

/**
 * Busca cuál fue la última partida activa para conectar a los nuevos jugadores.
 * SOLO LEE — no borra nada para evitar que cualquier visita altere datos.
 * La limpieza de partidas viejas la hace únicamente el host al cerrar el lobby.
 */
export async function getActiveGameId() {
  if (!database) return null;

  const gamesRef = ref(database, 'games');
  const snapshot = await get(gamesRef);

  if (!snapshot.exists()) return null;

  const games = snapshot.val();
  let latestGameId = null;
  let latestTimestamp = 0;

  // Ignorar partidas terminadas, cerradas o con más de 8 horas de antigüedad
  const MAX_AGE_MS = 8 * 60 * 60 * 1000;
  const cutoff = Date.now() - MAX_AGE_MS;

  for (const [id, game] of Object.entries(games)) {
    if (
      game.phase === 'final' ||
      game.phase === 'closed' ||
      !game.createdAt ||
      game.createdAt < cutoff
    ) {
      continue; // Ignorar, pero NO borrar desde el cliente
    }

    if (game.createdAt > latestTimestamp) {
      latestTimestamp = game.createdAt;
      latestGameId = id;
    }
  }

  return latestGameId;
}

/**
 * Obtiene la fase actual de una partida específica.
 * Se usa para verificar si el juego ya empezó antes de dejar entrar a un jugador tardío.
 */
export async function getGamePhase(gameId) {
  if (!database) return null;
  const phaseRef = ref(database, `games/${gameId}/phase`);
  const snapshot = await get(phaseRef);
  return snapshot.val();
}
