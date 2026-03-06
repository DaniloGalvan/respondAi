"use client"

import { useState } from "react"
import { BookOpen, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StartScreenProps {
  onStart: (quizCode: string, studentName: string) => Promise<void>
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [quizCode, setQuizCode] = useState("")
  const [studentName, setStudentName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showValidationError, setShowValidationError] = useState(false)

  const canStart = quizCode.trim().length > 0 && studentName.trim().length >= 5 && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos
    if (quizCode.trim().length === 0 || studentName.trim().length < 5) {
      setShowValidationError(true)
      return
    }
    
    setShowValidationError(false)
    setIsLoading(true)
    try {
      await onStart(quizCode.trim(), studentName.trim())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <BookOpen className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            RespondAI
          </h1>
          <p className="text-center text-base leading-relaxed text-muted-foreground">
            Insira o codigo do quiz fornecido pelo seu professor para comecar.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quiz-code"
              className="text-sm font-semibold text-foreground"
            >
              Codigo do Quiz
            </label>
            <Input
              id="quiz-code"
              type="text"
              placeholder="Ex: #HIST05"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
              disabled={isLoading}
              aria-label="Codigo do quiz. Insira o codigo fornecido pelo professor"
              aria-required="true"
              autoComplete="off"
              className="h-14 rounded-xl border-2 border-border bg-background px-4 text-lg font-medium placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="student-name"
              className="text-sm font-semibold text-foreground"
            >
              Nome ou Matricula
              <span className="ml-1 text-red-500">*</span>
            </label>
            <Input
              id="student-name"
              type="text"
              placeholder="Seu nome ou numero de matricula"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              disabled={isLoading}
              aria-label="Nome ou matricula do aluno. Campo obrigatorio"
              autoComplete="name"
              required
              className="h-12 rounded-xl border-2 border-border bg-background px-4 text-base placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={!canStart}
            className="mt-2 h-14 rounded-xl text-base font-semibold transition-all focus-visible:ring-4 focus-visible:ring-primary/40 cursor-pointer disabled:cursor-not-allowed"
            aria-label={isLoading ? "Carregando quiz" : "Iniciar o quiz"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Carregando...
              </>
            ) : (
              <>
                Iniciar Quiz
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        {/* Mensagem de Validação */}
        {showValidationError && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">Campos obrigatórios</p>
            <p>Preencha o código do quiz e seu nome/matrícula (mínimo 5 caracteres) para continuar.</p>
          </div>
        )}

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Ao iniciar, suas respostas serao registradas automaticamente.
        </p>
      </div>
    </div>
  )
}
