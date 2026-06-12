// ============================================================================
// scoreService.js — Sistema de Notas y Puntuaciones
// ============================================================================
//
// Este archivo contiene las fórmulas matemáticas para calcular
// las notas finales de cada jugador. Es como la calculadora del profesor:
// le pasas cuántas respuestas correctas tuvo alguien y te devuelve su nota.
// La escala va del 1.0 (todo malo) al 7.0 (todo bueno), con un 8.0 especial
// si alguien responde TODO perfecto y además se gana el punto extra.
// ============================================================================

import { TOTAL_SCORED_QUESTIONS } from './questions';

/**
 * Esta función es la "fórmula del profesor". Le pasas dos cosas:
 *   - score: cuántas preguntas contestó bien (un número del 0 al 14)
 *   - hasBonus: si recibió el punto extra de la pregunta 15 (sí o no)
 * Y te devuelve la nota final (ejemplo: 5.3, 7.0, o el 8.0).
 */
export function calculateGrade(score, hasBonus) {
  // Si sacó todo perfecto Y tiene el punto extra, le damos 8.0 directamente.
  if (score >= TOTAL_SCORED_QUESTIONS && hasBonus) {
    return 8.0;
  }

  // Aquí aplicamos la fórmula matemática típica:
  // Con 0 aciertos = 1.0
  // Con 14 aciertos = 7.0
  const rawGrade = 1.0 + (score * 6.0 / TOTAL_SCORED_QUESTIONS);

  // Redondeamos para que solo tenga un decimal (ejemplo: 4.357 se vuelve 4.4)
  return Math.round(rawGrade * 10) / 10;
}

/**
 * Esta función compara las respuestas del jugador con las respuestas correctas.
 * Por cada acierto, suma 1 punto. Es como cuando el profesor revisa
 * tu prueba pregunta por pregunta y cuenta los aciertos.
 */
export function calculateScore(answers, questions) {
  let score = 0; // Empezamos con 0 puntos

  // Revisamos pregunta por pregunta
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    // Saltamos la pregunta abierta (la última) porque el host la evalúa a mano
    if (question.type !== 'multiple') continue;

    // Si la respuesta del jugador es igual a la correcta, sumamos 1 punto
    if (answers && answers[String(i)] === question.correctAnswer) {
      score++;
    }
  }

  return score;
}

/**
 * Esta función toma a TODOS los jugadores, calcula la nota de cada uno,
 * y los ordena de mayor a menor nota para armar el podio de ganadores.
 */
export function generateRanking(players, questions) {
  // Si no hay jugadores, devolvemos una lista vacía
  if (!players) return [];

  // Convertimos los datos de los jugadores en una lista ordenada
  const ranking = Object.entries(players).map(([playerId, playerData]) => {
    // Por cada jugador, calculamos sus aciertos y su nota final
    const score = calculateScore(playerData.answers, questions);
    const hasBonus = playerData.bonusPoint === true;
    const grade = calculateGrade(score, hasBonus);

    // Empaquetamos la información del jugador
    return {
      playerId,
      nickname: playerData.nickname || 'Anónimo',
      score,
      bonus: hasBonus,
      grade,
    };
  });

  // Ordenamos la lista de mayor a menor nota
  ranking.sort((a, b) => b.grade - a.grade);

  // Asignamos el puesto a cada uno (1°, 2°, 3...)
  // Implementamos "Dense Ranking": si empatan en nota, reciben la misma posición.
  let currentPosition = 1;
  ranking.forEach((entry, index) => {
    if (index > 0 && entry.grade === ranking[index - 1].grade) {
      // Empate con el anterior, misma posición
      entry.position = ranking[index - 1].position;
    } else {
      // Nueva nota, siguiente posición secuencial (1, 2, 3...)
      entry.position = currentPosition;
    }
    currentPosition = entry.position + 1; // El siguiente que no empate tendrá la posición que sigue
  });

  return ranking;
}
