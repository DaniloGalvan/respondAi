"use client"

import { useState, useEffect, useCallback } from 'react'
import { QuizService } from '@/lib/quiz-service'
import { LocalStorageService, QuizData, SessionState } from '@/lib/storage'
import { SyncService } from '@/lib/sync-service'
import { ConfettiService } from '@/lib/confetti-service'

interface UseQuizStateReturn {
  // Estado
  quizData: QuizData | null
  sessionState: SessionState | null
  isLoading: boolean
  error: string | null
  
  // Ações
  loadQuizByCode: (codigoAcesso: string, alunoId: string) => Promise<boolean>
  resumeSession: () => Promise<boolean>
  saveAnswer: (questionId: string, answerText: string, isCorrect: boolean) => void
  nextQuestion: () => void
  finishQuiz: () => Promise<void>
  resetQuiz: () => Promise<void>
}

export function useQuizState(alunoId?: string): UseQuizStateReturn {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inicializar serviço de sincronização
  useEffect(() => {
    SyncService.init()
  }, [])

  // Recuperação de estado ao montar o componente
  useEffect(() => {
    const recoverState = async () => {
      if (!alunoId) return

      try {
        // Verificar se existe sessão em andamento no storage local
        const localSession = await LocalStorageService.getSessionState()
        
        if (localSession && localSession.id_aluno === alunoId && localSession.status === 'em_andamento') {
          // Recuperar dados do quiz também
          const localQuiz = await LocalStorageService.getQuizData()
          
          if (localQuiz) {
            setSessionState(localSession)
            setQuizData(localQuiz)
            console.log('Sessão recuperada do storage local')
          }
        }
      } catch (error) {
        console.error('Erro ao recuperar estado:', error)
      }
    }

    recoverState()
  }, [alunoId])

  // Carregar questionário por código
  const loadQuizByCode = useCallback(async (codigoAcesso: string, studentId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar questionário no Supabase
      const data = await QuizService.fetchQuizByCode(codigoAcesso)
      
      if (!data) {
        setError('Questionário não encontrado. Verifique o código.')
        return false
      }

      setQuizData(data)

      // Verificar se já existe sessão ativa
      const existingSession = await QuizService.getActiveSession(data.questionario.id, studentId)
      
      let sessionData: SessionState
      
      if (existingSession) {
        // Recuperar sessão existente
        const answers = await QuizService.getSessionAnswers(existingSession.id)
        
        sessionData = {
          id_aluno: studentId,
          id_questionario: data.questionario.id,
          id_sessao: existingSession.id,
          questao_atual: existingSession.questao_atual,
          status: existingSession.status as 'em_andamento' | 'concluido' | 'abandonado',
          iniciado_em: existingSession.iniciado_em,
          respostas: answers.map(a => ({
            id_questao: a.id_questao,
            resposta_aluno: a.resposta_aluno,
            correta: a.correta,
            respondido_em: a.respondido_em
          }))
        }
      } else {
        // Criar nova sessão ou recuperar existente (Get or Create)
        const sessionId = await QuizService.createStudentSession(data.questionario.id, studentId)
        
        if (!sessionId) {
          setError('Erro ao criar/recuperar sessão. Tente novamente.')
          return false
        }

        // Verificar se é sessão existente buscando no Supabase
        const existingSessionData = await QuizService.getActiveSession(data.questionario.id, studentId)
        
        if (existingSessionData && existingSessionData.id === sessionId) {
          // Sessão existente recuperada - buscar respostas
          console.log('Recuperando sessão existente com respostas')
          const answers = await QuizService.getSessionAnswers(sessionId)
          
          sessionData = {
            id_aluno: studentId,
            id_questionario: data.questionario.id,
            id_sessao: sessionId,
            questao_atual: existingSessionData.questao_atual,
            status: existingSessionData.status as 'em_andamento' | 'concluido' | 'abandonado',
            iniciado_em: existingSessionData.iniciado_em,
            respostas: answers.map(a => ({
              id_questao: a.id_questao,
              resposta_aluno: a.resposta_aluno,
              correta: a.correta,
              respondido_em: a.respondido_em
            }))
          }
        } else {
          // Nova sessão criada
          console.log('Nova sessão criada')
          sessionData = {
            id_aluno: studentId,
            id_questionario: data.questionario.id,
            id_sessao: sessionId,
            questao_atual: 1,
            status: 'em_andamento',
            iniciado_em: new Date().toISOString(),
            respostas: []
          }
        }
      }

      // Salvar estado localmente
      await LocalStorageService.saveSessionState(sessionData)
      setSessionState(sessionData)

      return true
    } catch (error: any) {
      console.error('Erro ao carregar questionário:', error)
      
      // Capturar mensagem de erro original do Supabase
      let errorMessage = 'Erro ao carregar questionário. Tente novamente.'
      
      if (error.message) {
        // Se for erro do Supabase, mostrar a mensagem original
        if (error.message.includes('Erro ao buscar questionário:') || 
            error.message.includes('Erro ao buscar questões:') ||
            error.message.includes('Erro ao criar sessão:')) {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Retomar sessão existente
  const resumeSession = useCallback(async (): Promise<boolean> => {
    try {
      const localSession = await LocalStorageService.getSessionState()
      const localQuiz = await LocalStorageService.getQuizData()

      if (!localSession || !localQuiz) {
        return false
      }

      setSessionState(localSession)
      setQuizData(localQuiz)
      return true
    } catch (error) {
      console.error('Erro ao retomar sessão:', error)
      return false
    }
  }, [])

  // Salvar resposta - blindagem total
  const saveAnswer = useCallback((questionId: string, answerText: string, isCorrect: boolean) => {
    if (!sessionState || !quizData) return

    console.log('[SAVE ANSWER] Recebendo da UI:', {
      questionId,
      answerText,
      isCorrect
    })

    // Push direto sem recálculos
    const answerData = {
      id_questao: questionId,
      resposta_aluno: answerText,
      correta: isCorrect, // Booleano direto da UI
      respondido_em: new Date().toISOString()
    }

    const updatedSession = {
      ...sessionState,
      respostas: [...sessionState.respostas, answerData]
    }

    console.log('[SAVE ANSWER] Resposta salva:', answerData)

    // Salvar localmente
    LocalStorageService.saveSessionState(updatedSession)
    setSessionState(updatedSession)

    // Disparar confete se acertou
    if (isCorrect) {
      console.log('[SAVE ANSWER] Acertou! Disparando confete...')
      ConfettiService.triggerSuccess()
    }

    // Adicionar à fila de sincronização
    if (sessionState.id_sessao) {
      LocalStorageService.addToSyncQueue({
        type: 'answer',
        data: answerData,
        sessionId: sessionState.id_sessao,
        timestamp: new Date().toISOString()
      })

      // Tentar sincronizar se estiver online
      if (SyncService.isOnlineStatus()) {
        SyncService.processSyncQueue()
      }
    }
  }, [sessionState, quizData])

  // Próxima questão
  const nextQuestion = useCallback(() => {
    if (!sessionState) return

    const updatedSession = {
      ...sessionState,
      questao_atual: sessionState.questao_atual + 1
    }

    LocalStorageService.saveSessionState(updatedSession)
    setSessionState(updatedSession)
  }, [sessionState])

  // Finalizar quiz
  const finishQuiz = useCallback(async () => {
    if (!sessionState) return

    try {
      console.log('[FINISH QUIZ] Iniciando finalização...')

      // 1. Tentar sincronizar respostas (não crítico se falhar)
      if (SyncService.isOnlineStatus()) {
        console.log('[FINISH QUIZ] Tentando sincronizar respostas...')
        await SyncService.processSyncQueue()
      } else {
        console.log('[FINISH QUIZ] Offline - respostas ficarão na fila')
      }

      // 2. FINALIZAR SESSÃO INDEPENDENTEMENTE (crítico)
      if (sessionState.id_sessao) {
        console.log('[FINISH QUIZ] Finalizando sessão no banco...')
        const success = await QuizService.finishStudentSession(sessionState.id_sessao)
        
        if (success) {
          console.log('[FINISH QUIZ] Sessão finalizada com sucesso!')
        } else {
          console.warn('[FINISH QUIZ] Falha ao finalizar sessão, mas continuando...')
        }

        // Atualizar estado local
        const updatedSession = {
          ...sessionState,
          status: 'concluido' as const,
          concluido_em: new Date().toISOString()
        }
        
        await LocalStorageService.saveSessionState(updatedSession)
        setSessionState(updatedSession)
      }

      console.log('[FINISH QUIZ] Finalização concluída')
    } catch (error) {
      console.error('[FINISH QUIZ] Erro na finalização:', error)
      // Não quebra o fluxo mesmo em caso de erro
    }
  }, [sessionState])

  // Resetar quiz
  const resetQuiz = useCallback(async () => {
    await LocalStorageService.clearSessionState()
    await LocalStorageService.clearQuizData()
    setQuizData(null)
    setSessionState(null)
    setError(null)
  }, [])

  return {
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
  }
}
