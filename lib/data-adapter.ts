import type { Question } from './quiz-data'
import { QuizData } from './storage'

// Converte dados do Supabase para o formato esperado pelos componentes
export function adaptQuizDataToQuestions(quizData: QuizData): Question[] {
  return quizData.questoes.map((questao, index) => {
    // Converter alternativas de JSONB para array de strings
    let alternatives: string[] = []
    
    if (typeof questao.alternativas === 'string') {
      try {
        alternatives = JSON.parse(questao.alternativas)
      } catch {
        alternatives = []
      }
    } else if (Array.isArray(questao.alternativas)) {
      alternatives = questao.alternativas
    }

    // Matcher Perfeito: Pega apenas a primeira letra da resposta_correta
    const correctLetter = questao.resposta_correta.trim().charAt(0).toUpperCase();
    
    // Encontra a alternativa que COMEÇA com essa exata letra
    const foundIndex = alternatives.findIndex(alt =>
      alt.trim().toUpperCase().startsWith(correctLetter)
    );

    console.log(`[MATCH DEBUG] Questão ${index + 1}: Banco: "${correctLetter}" | Encontrado Index: ${foundIndex}`);
    console.log('[MATCH DEBUG] Resposta correta original:', questao.resposta_correta);
    console.log('[MATCH DEBUG] Alternativas:', alternatives);

    return {
      id: index + 1,
      statement: questao.enunciado,
      alternatives,
      correctIndex: foundIndex, // Retorna -1 se der erro, NUNCA força para 0
      explanation: questao.explicacao || ''
    }
  })
}

// Converte uma questão do formato do componente para o formato do Supabase
export function adaptQuestionToSupabase(question: Question, idQuestionario: string, numero: number) {
  return {
    id_questionario: idQuestionario,
    numero,
    enunciado: question.statement,
    tipo: 'multipla_escolha',
    alternativas: JSON.stringify(question.alternatives),
    resposta_correta: question.alternatives[question.correctIndex],
    explicacao: question.explanation
  }
}
