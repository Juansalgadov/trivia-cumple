// ============================================================================
// questions.js — Banco de Preguntas de la Trivia
// ============================================================================
//
// Este archivo contiene todas las preguntas del juego. 
// Cada pregunta es un "bloque" de información que tiene un número, el texto
// de la pregunta, las 4 opciones, y cuál de ellas es la correcta.
// ============================================================================

export const questions = [
  {
    id: 1,
    text: "¿Qué hace Juan cuando se siente incómodo en una reunión con amigos?",
    options: {
      A: "Se va del sitio.",
      B: "Se aísla y se pone los audífonos.",
      C: "Intenta acoplarse de todas maneras para no incomodar a nadie",
      D: "Le habla a Kast para pedirle piedad"
    },
    correctAnswer: "B",
    type: "multiple" // Significa que es de elegir A, B, C o D
  },
  {
    id: 2,
    text: "¿Cuál es el tema de conversación que más le gusta hablar a Juan?",
    options: {
      A: "Videojuegos",
      B: "Dios",
      C: "Informática",
      D: "Música"
    },
    correctAnswer: "D",
    type: "multiple"
  },
  {
    id: 3,
    text: "¿Qué cosa pequeña hace enojar más a Juan?",
    options: {
      A: "Que una persona sea impuntual",
      B: "Que le toquen el cuello",
      C: "Que una persona se crea superior",
      D: "Terquedad"
    },
    correctAnswer: "B",
    type: "multiple"
  },
  {
    id: 4,
    text: "¿Cuál es el instrumento favorito de Juan?",
    options: {
      A: "Piano",
      B: "Batería",
      C: "Guitarra",
      D: "Maracas"
    },
    correctAnswer: "B",
    type: "multiple"
  },
  {
    id: 5,
    text: "¿Cuál es el videojuego favorito de Juan?",
    options: {
      A: "Nier Autómata",
      B: "Batman Arkham Origins",
      C: "Spiderman 2",
      D: "El juego del dinosaurio de Google"
    },
    correctAnswer: "C",
    type: "multiple"
  },
  {
    id: 6,
    text: "Si algún amigo de Juan está a punto de recibir un golpe de alguien, ¿qué haría Juan?",
    options: {
      A: "Se mete en medio para defender al agresor",
      B: "Se mete en medio e intenta alejar al amigo sin pegarle a nadie.",
      C: "Se mete en medio intentando alejar al agresor.",
      D: "Se mete a pelear para defender a su amigo."
    },
    correctAnswer: "B",
    type: "multiple"
  },
  {
    id: 7,
    text: "¿Cuál es el artista, rapero o banda favorita de Juan?",
    options: {
      A: "Noah Thorne",
      B: "NF",
      C: "Canserbero",
      D: "Good Kid"
    },
    correctAnswer: "B",
    type: "multiple"
  },
  {
    id: 8,
    text: "¿Cuál fue el momento más vergonzoso en la vida de Juan?",
    options: {
      A: "El día que cantó en la Iglesia solo",
      B: "Nada porque el Monte Everest no tiene nada en contra de Juan",
      C: "Cuando tocó las maracas por primera vez en frente del alcalde de Macul",
      D: "Cuando vio por primera vez el video de él molestando a su hermana en el carro."
    },
    correctAnswer: "A",
    type: "multiple"
  },
  {
    id: 9,
    text: "¿Cómo se comporta Juan cuando se siente feliz?",
    options: {
      A: "Tranquilo",
      B: "Cariñoso",
      C: "Enérgico",
      D: "Bromista"
    },
    correctAnswer: "C",
    type: "multiple"
  },
  {
    id: 10,
    text: "¿Cuál es la cosa de su carrera que más le gusta a Juan?",
    options: {
      A: "No ir",
      B: "Planificar soluciones para un código",
      C: "Conocer Inteligencia Artificial",
      D: "Programar"
    },
    correctAnswer: "D",
    type: "multiple"
  },
  {
    id: 11,
    text: "¿Cuál es la película favorita de Juan?",
    options: {
      A: "Oppenheimer",
      B: "Anita",
      C: "Whiplash",
      D: "Batman de Robert Pattinson"
    },
    correctAnswer: "C",
    type: "multiple"
  },
  {
    id: 12,
    text: "¿Por qué Juan no quiere hablar de Attack on Titan a pesar de que sea su serie favorita?",
    options: {
      A: "Se siente identificado con un personaje de la serie",
      B: "Porque la serie le caen mal sus personajes",
      C: "Porque es una historia que se trata de inmigrantes que quieren atravesar las fronteras de manera ilegal",
      D: "Todas las anteriores"
    },
    correctAnswer: "A",
    type: "multiple"
  },
  {
    id: 13,
    text: "¿Qué acción de Juan aumenta más cuando quiere mucho a una persona?",
    options: {
      A: "Cariño Físico",
      B: "Aconsejar",
      C: "Analizar a la persona",
      D: "Molestar a la persona"
    },
    correctAnswer: "C",
    type: "multiple"
  },
  {
    id: 14,
    text: "¿Qué es lo que hace Juan cuando se siente triste?",
    options: {
      A: "Lo habla con algún familiar cercano",
      B: "Hablarlo con su mejor amigo/a",
      C: "Guardarlo para sí mismo",
      D: "Intenta distraerse para no pensar en ello"
    },
    correctAnswer: "C",
    type: "multiple"
  },
  {
    id: 15,
    text: "¿Quién es Juan para ti y por qué lo elegiste como amigo?",
    options: {},
    correctAnswer: null,
    type: "open" // Significa que es de texto libre, sin opciones
  }
];

// Constante que nos dice cuántas preguntas "normales" hay para calificar
export const TOTAL_SCORED_QUESTIONS = 14;

/**
 * Función para buscar una pregunta específica por su número
 */
export function getQuestion(index) {
  return questions[index] || null;
}
