import { supabase } from './supabase'
import { LocalStorageService, QuizData } from './storage'

export class QuizService {
  // Buscar questionário completo do Supabase pelo código de acesso
  static async fetchQuizByCode(codigoAcesso: string): Promise<QuizData | null> {
    try {
      console.log(`Buscando questionário com código: ${codigoAcesso}`)
      
      // Buscar questionário
      const { data: questionario, error: quizError } = await supabase
        .from('questionarios')
        .select('*')
        .eq('codigo_acesso', codigoAcesso)
        .eq('status', 'ativo')
        .single()

      if (quizError) {
        console.error('Erro Supabase ao buscar questionário:', {
          error: quizError,
          details: quizError.details,
          hint: quizError.hint,
          code: quizError.code
        })
        throw new Error(`Erro ao buscar questionário: ${quizError.message}`)
      }

      if (!questionario) {
        console.warn('Questionário não encontrado para o código:', codigoAcesso)
        return null
      }

      console.log('Questionário encontrado:', questionario.id)

      // Buscar questões do questionário
      const { data: questoes, error: questionsError } = await supabase
        .from('questoes')
        .select('*')
        .eq('id_questionario', questionario.id)
        .order('numero', { ascending: true })

      if (questionsError) {
        console.error('Erro Supabase ao buscar questões:', {
          error: questionsError,
          details: questionsError.details,
          hint: questionsError.hint,
          code: questionsError.code
        })
        throw new Error(`Erro ao buscar questões: ${questionsError.message}`)
      }

      console.log(`Encontradas ${questoes?.length || 0} questões`)

      const quizData: QuizData = {
        questionario: {
          id: questionario.id,
          id_professor: questionario.id_professor,
          disciplina: questionario.disciplina,
          serie_ano: questionario.serie_ano,
          tema: questionario.tema,
          tipo_questoes: questionario.tipo_questoes,
          total_questoes: questionario.total_questoes,
          status: questionario.status,
          criado_em: questionario.criado_em,
          codigo_acesso: questionario.codigo_acesso,
          titulo: questionario.titulo
        },
        questoes: questoes || []
      }

      // Salvar no storage local
      await LocalStorageService.saveQuizData(quizData)
      console.log('Questionário salvo no storage local')

      return quizData
    } catch (error) {
      console.error('Erro completo em fetchQuizByCode:', error)
      throw error // Repassar o erro para tratamento superior
    }
  }

  // Criar nova sessão de aluno (Get or Create)
  static async createStudentSession(idQuestionario: string, idAluno: string): Promise<string | null> {
    try {
      console.log(`Verificando sessão existente para aluno "${idAluno}" no questionário ${idQuestionario}`)
      
      // 1. PRIMEIRO: Verificar se sessão já existe (Get)
      const { data: existingSession, error: fetchError } = await supabase
        .from('sessoes_aluno')
        .select('*')
        .eq('id_questionario', idQuestionario)
        .eq('id_aluno', idAluno)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro Supabase ao buscar sessão existente:', {
          error: fetchError,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        })
        throw new Error(`Erro ao buscar sessão existente: ${fetchError.message}`)
      }

      // 2. SE JÁ EXISTE: Retornar ID da sessão existente
      if (existingSession) {
        console.log('Sessão existente encontrada:', existingSession.id)
        console.log('Status:', existingSession.status)
        console.log('Questão atual:', existingSession.questao_atual)
        
        // Se estiver concluída, podemos criar nova ou retornar existente
        if (existingSession.status === 'concluido') {
          console.log('Sessão já foi concluída. Criando nova sessão.')
        } else {
          // Retornar sessão em andamento para continuar de onde parou
          return existingSession.id
        }
      }

      // 3. SE NÃO EXISTE: Criar nova sessão (Create)
      console.log('Criando nova sessão para aluno')
      
      const sessionData = {
        id_questionario: idQuestionario,
        id_aluno: idAluno,
        questao_atual: 1,
        status: 'em_andamento',
        iniciado_em: new Date().toISOString()
      }
      
      console.log('Dados da nova sessão:', sessionData)

      const { data, error: insertError } = await supabase
        .from('sessoes_aluno')
        .insert(sessionData)
        .select('id')
        .single()

      if (insertError) {
        console.error('Erro Supabase ao criar sessão:', {
          error: insertError,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
          message: insertError.message
        })
        throw new Error(`Erro ao criar sessão: ${insertError.message}`)
      }

      if (!data) {
        console.error('Sessão criada mas sem retorno de ID')
        throw new Error('Sessão criada mas não foi possível obter o ID')
      }

      console.log('Nova sessão criada com sucesso:', data.id)
      return data.id
    } catch (error) {
      console.error('Erro completo em createStudentSession:', error)
      throw error // Repassar o erro para tratamento superior
    }
  }

  // Finalizar sessão de aluno (independente da sincronização de respostas)
  static async finishStudentSession(idSession: string): Promise<boolean> {
    try {
      console.log(`Finalizando sessão ${idSession}...`)
      
      const { error } = await supabase
        .from('sessoes_aluno')
        .update({
          status: 'concluido',
          concluido_em: new Date().toISOString()
        })
        .eq('id', idSession)

      if (error) {
        console.error('Erro ao finalizar sessão:', {
          error: error,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      console.log('Sessão finalizada com sucesso!')
      return true
    } catch (error) {
      console.error('Erro completo em finishStudentSession:', error)
      return false
    }
  }

  // Verificar se existe sessão em andamento
  static async getActiveSession(idQuestionario: string, idAluno: string): Promise<any | null> {
    try {
      console.log(`Buscando sessão ativa para aluno ${idAluno} no questionário ${idQuestionario}`)
      
      const { data, error } = await supabase
        .from('sessoes_aluno')
        .select('*')
        .eq('id_questionario', idQuestionario)
        .eq('id_aluno', idAluno)
        .eq('status', 'em_andamento')
        .single()

      // PGRST116 = "row not found" - comportamento esperado para aluno novo
      if (error && error.code === 'PGRST116') {
        console.log('Nenhuma sessão ativa encontrada (aluno novo)')
        return null
      }

      if (error) {
        console.error('Erro Supabase ao buscar sessão ativa:', {
          error: error,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      console.log('Sessão ativa encontrada:', data?.id)
      return data
    } catch (error) {
      console.error('Erro completo em getActiveSession:', error)
      return null
    }
  }

  // Buscar respostas existentes de uma sessão
  static async getSessionAnswers(idSessao: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('respostas_alunos')
        .select('*')
        .eq('id_sessao', idSessao)
        .order('respondido_em', { ascending: true })

      if (error) {
        console.error('Erro ao buscar respostas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar respostas:', error)
      return []
    }
  }
}
