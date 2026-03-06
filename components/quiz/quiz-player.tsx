"use client"

import { useCallback } from "react"
import { XCircle } from "lucide-react"
import { StartScreen } from "./start-screen"
import { QuizScreen } from "./quiz-screen"
import { ResultScreen } from "./result-screen"
import { Confetti } from "./confetti"
import { useQuizState } from "@/hooks/useQuizState"
import { adaptQuizDataToQuestions } from "@/lib/data-adapter"

interface QuizPlayerProps {
  alunoId?: string
}

export function QuizPlayer({ alunoId }: QuizPlayerProps) {
  const {
    quizData,
    sessionState,
    isLoading,
    error,
    loadQuizByCode,
    resumeSession,
    saveAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz
  } = useQuizState(alunoId)

  const handleStart = useCallback(async (quizCode: string, studentName: string) => {
    if (!alunoId && !studentName) {
      return
    }
    
    const studentId = alunoId || studentName
    const success = await loadQuizByCode(quizCode, studentId)
    
    if (!success) {
      console.error('Falha ao carregar questionário')
    }
  }, [alunoId, loadQuizByCode])

  const handleFinish = useCallback(async (finalScore: number, totalQuestions: number) => {
    await finishQuiz()
  }, [finishQuiz])

  // Calcular score real baseado estritamente nas respostas salvas
  const calculateRealScore = useCallback(() => {
    if (!sessionState?.respostas || sessionState.respostas.length === 0) return 0
    
    // Contar apenas respostas marcadas como corretas no array
    const correctAnswers = sessionState.respostas.filter(resposta => resposta.correta === true).length
    
    console.log('Cálculo do score final:', {
      total_respostas: sessionState.respostas.length,
      corretas: correctAnswers,
      incorretas: sessionState.respostas.filter(r => r.correta === false).length,
      score_calculado: correctAnswers
    })
    
    return correctAnswers
  }, [sessionState])

  const handleRestart = useCallback(async () => {
    await resetQuiz()
  }, [resetQuiz])

  // Lógica de recuperação automática de sessão
  const handleResume = useCallback(async () => {
    const hasSession = await resumeSession()
    if (hasSession) {
      console.log('Sessão recuperada com sucesso')
    }
  }, [resumeSession])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar quiz</h2>
          <p className="text-red-700 mb-4 text-sm leading-relaxed">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Determinar qual tela mostrar
  let currentScreen: "start" | "quiz" | "result" = "start"
  
  if (sessionState) {
    if (sessionState.status === 'concluido') {
      currentScreen = "result"
    } else if (sessionState.status === 'em_andamento' && quizData) {
      currentScreen = "quiz"
    }
  }

  // Adaptar dados do quiz para o formato esperado pelo QuizScreen
  const adaptedQuestions = quizData ? adaptQuizDataToQuestions(quizData) : []

  return (
    <>
      <Confetti active={false} />

      {currentScreen === "start" && (
        <StartScreen 
          onStart={handleStart} 
        />
      )}

      {currentScreen === "quiz" && quizData && sessionState && sessionState.status === 'em_andamento' && (
        <QuizScreen
          questions={adaptedQuestions}
          currentQuestion={sessionState.questao_atual}
          onFinish={handleFinish}
          onSaveAnswer={saveAnswer}
          onNextQuestion={nextQuestion}
        />
      )}

      {currentScreen === "result" && (
        <ResultScreen
          score={calculateRealScore()}
          total={adaptedQuestions.length}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
