"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Question } from "@/lib/quiz-data"

interface QuizScreenProps {
  questions: Question[]
  currentQuestion: number
  onFinish: (score: number, total: number) => void
  onSaveAnswer?: (questionId: string, answerText: string, isCorrect: boolean) => Promise<void>
  onNextQuestion?: () => void
}

type AnswerState = "idle" | "selected" | "answered"

export function QuizScreen({ 
  questions, 
  currentQuestion,
  onFinish, 
  onSaveAnswer,
  onNextQuestion
}: QuizScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>("idle")
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)

  // Ajustar para base 0 (array index)
  const currentIndex = currentQuestion - 1
  const question = questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / questions.length) * 100

  const handleSelect = useCallback((index: number) => {
    if (answerState !== "idle" && answerState !== "selected") return
    setSelectedIndex(index)
    setAnswerState("selected")
  }, [answerState])

  const handleAnswer = useCallback(async () => {
    if (selectedIndex === null || !onSaveAnswer) return
    
    const selectedAlternative = question.alternatives[selectedIndex]
    
    console.log('[QUIZ DEBUG] Resposta selecionada:', {
      selectedIndex,
      selectedAlternative,
      correctIndex: question.correctIndex,
      correctAlternative: question.alternatives[question.correctIndex]
    })
    
    // Verificar se o correctIndex é válido
    if (question.correctIndex === -1) {
      console.error('[QUIZ ERROR] correctIndex é -1. Não é possível avaliar resposta.')
      return
    }
    
    // Avaliação simples e direta: selectedIndex === correctIndex
    const isCorrect = selectedIndex === question.correctIndex
    
    console.log('[QUIZ DEBUG] Resultado da avaliação:', {
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect
    })
    
    // Chamada assíncrona para salvar no banco
    try {
      await onSaveAnswer(question.id.toString(), selectedAlternative, isCorrect)
      console.log('[QUIZ DEBUG] Resposta salva com sucesso')
    } catch (error) {
      console.error('[QUIZ ERROR] Erro ao salvar resposta:', error)
      // Mesmo com erro, continua o fluxo para não bloquear o usuário
    }
    
    setIsCorrect(isCorrect)
    if (isCorrect) {
      setScore((prev) => prev + 1)
    }
    setAnswerState("answered")
  }, [selectedIndex, question, onSaveAnswer])

  const handleAdvance = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      onFinish(score + (isCorrect ? 1 : 0), questions.length)
    } else {
      onNextQuestion?.()
      setSelectedIndex(null)
      setAnswerState("idle")
      setIsCorrect(false)
    }
  }, [currentIndex, questions.length, score, isCorrect, onFinish, onNextQuestion])

  // Focus management: move focus to feedback card when answer is shown
  useEffect(() => {
    if (answerState === "answered" && feedbackRef.current) {
      feedbackRef.current.focus()
    }
  }, [answerState])

  const alternativeLetters = ["A", "B", "C", "D"]

  const getAlternativeClasses = (index: number) => {
    const base =
      "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left text-base leading-relaxed transition-all focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:outline-none"

    if (answerState === "answered") {
      // REGRA ESTRITA: Verde apenas para index === correctIndex
      if (index === question.correctIndex) {
        return `${base} border-success bg-success/10 text-foreground`
      }
      // REGRA ESTRITA: Vermelho apenas para selectedIndex errado
      if (index === selectedIndex && index !== question.correctIndex) {
        return `${base} border-destructive bg-destructive/10 text-foreground`
      }
      // Outras alternativas não clicadas ficam neutras/cinza
      return `${base} border-border bg-muted/50 text-muted-foreground opacity-60`
    }

    // Estado antes de responder: alternativa selecionada fica destacada
    if (index === selectedIndex) {
      return `${base} border-primary bg-primary/10 text-foreground ring-2 ring-primary/20`
    }

    // Alternativas não selecionadas (estado normal)
    return `${base} border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-95`
  }

  if (!question || question.correctIndex === -1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-red-900 mb-2">Erro na Questão</h2>
          <p className="text-red-700 mb-4 text-sm leading-relaxed">
            Não foi possível identificar a alternativa correta para esta questão.
          </p>
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>ID: {question?.id}</p>
            <p>CorrectIndex: {question?.correctIndex}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Progress Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Questao {currentIndex + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-3 rounded-full"
            aria-label={`Progresso do quiz: questao ${currentIndex + 1} de ${questions.length}`}
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
          />
        </div>
      </header>

      {/* Question Content */}
      <main className={`flex flex-1 flex-col overflow-y-auto px-4 py-6 ${answerState === "answered" ? "pb-0" : ""}`}>
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
          {/* Question Statement */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Questao {currentIndex + 1}
            </span>
            <h2 className="text-xl font-bold leading-relaxed text-foreground md:text-2xl">
              {question.statement}
            </h2>
          </div>

          {/* Alternatives */}
          <fieldset
            className="flex flex-col gap-3"
            aria-label="Alternativas da questao"
            disabled={answerState === "answered"}
          >
            <legend className="sr-only">
              Selecione uma alternativa para a questao {currentIndex + 1}
            </legend>
            {question.alternatives.map((alt, index) => (
              <button
                key={index}
                type="button"
                role="radio"
                aria-checked={selectedIndex === index}
                aria-label={`Alternativa ${alternativeLetters[index]}: ${alt}`}
                onClick={() => handleSelect(index)}
                disabled={answerState === "answered"}
                className={getAlternativeClasses(index)}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    answerState === "answered" && index === question.correctIndex
                      ? "bg-success text-success-foreground" // Verde para resposta correta
                      : answerState === "answered" &&
                          index === selectedIndex &&
                          index !== question.correctIndex
                        ? "bg-destructive text-destructive-foreground" // Vermelho para resposta errada
                        : index === selectedIndex
                          ? "bg-primary text-primary-foreground" // Azul para selecionada
                          : "bg-muted text-muted-foreground" // Cinza para não selecionadas
                  }`}
                  aria-hidden="true"
                >
                  {alternativeLetters[index]}
                </span>
                <span className="pt-1">{alt}</span>
              </button>
            ))}
          </fieldset>

          {/* Answer Button */}
          {answerState !== "answered" && (
            <Button
              onClick={handleAnswer}
              disabled={selectedIndex === null}
              className="h-14 rounded-xl text-base font-semibold transition-all focus-visible:ring-4 focus-visible:ring-primary/40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Confirmar resposta selecionada"
            >
              Responder
            </Button>
          )}
        </div>
      </main>

      {/* Feedback Bottom Sheet - Fixed Overlay */}
      {answerState === "answered" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 border-t-2 border-border"
          style={{ animationFillMode: "both" }}
        >
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className={`mx-auto max-w-2xl px-4 py-5 focus:outline-none ${
              isCorrect ? "bg-white dark:bg-slate-950" : "bg-white dark:bg-slate-950"
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2
                    className="h-7 w-7 shrink-0 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="h-7 w-7 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`text-lg font-bold ${
                    isCorrect ? "text-success" : "text-destructive"
                  }`}
                >
                  {isCorrect ? "Resposta Correta!" : "Resposta Incorreta"}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {question.explanation}
              </p>

              <Button
                ref={nextBtnRef}
                onClick={handleAdvance}
                className="mt-1 h-12 rounded-xl text-base font-semibold transition-all focus-visible:ring-4 focus-visible:ring-primary/40 cursor-pointer"
                aria-label={
                  currentIndex + 1 >= questions.length
                    ? "Ver resultado final do quiz"
                    : "Avancar para a proxima questao"
                }
              >
                {currentIndex + 1 >= questions.length
                  ? "Ver Resultado"
                  : "Avancar"}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
