import { get, set, del, clear } from 'idb-keyval'

// Tipos para armazenamento local
export interface QuizData {
  questionario: {
    id: string
    id_professor: string
    disciplina: string
    serie_ano: string
    tema: string
    tipo_questoes: string
    total_questoes: number
    status: string
    criado_em: string
    codigo_acesso: string
    titulo: string
  }
  questoes: Array<{
    id: string
    id_questionario: string
    numero: number
    enunciado: string
    tipo: string
    alternativas: any
    resposta_correta: string
    explicacao: string
  }>
}

export interface SessionState {
  id_aluno: string
  id_questionario: string
  id_sessao?: string
  questao_atual: number
  status: 'em_andamento' | 'concluido' | 'abandonado'
  iniciado_em: string
  concluido_em?: string
  respostas: Array<{
    id_questao: string
    resposta_aluno: string
    correta: boolean
    respondido_em: string
  }>
}

// Chaves do IndexedDB
const STORAGE_KEYS = {
  QUIZ_DATA: 'quiz_data',
  SESSION_STATE: 'session_state',
  SYNC_QUEUE: 'sync_queue'
} as const

// Serviço de Storage Local
export class LocalStorageService {
  // Quiz Data
  static async saveQuizData(quizData: QuizData): Promise<void> {
    await set(STORAGE_KEYS.QUIZ_DATA, quizData)
  }

  static async getQuizData(): Promise<QuizData | null> {
    try {
      const data = await get(STORAGE_KEYS.QUIZ_DATA)
      return data || null
    } catch {
      return null
    }
  }

  static async clearQuizData(): Promise<void> {
    await del(STORAGE_KEYS.QUIZ_DATA)
  }

  // Session State
  static async saveSessionState(sessionState: SessionState): Promise<void> {
    await set(STORAGE_KEYS.SESSION_STATE, sessionState)
  }

  static async getSessionState(): Promise<SessionState | null> {
    try {
      const data = await get(STORAGE_KEYS.SESSION_STATE)
      return data || null
    } catch {
      return null
    }
  }

  static async clearSessionState(): Promise<void> {
    await del(STORAGE_KEYS.SESSION_STATE)
  }

  // Sync Queue (para implementar depois)
  static async addToSyncQueue(data: any): Promise<void> {
    const queue = await this.getSyncQueue()
    queue.push(data)
    await set(STORAGE_KEYS.SYNC_QUEUE, queue)
  }

  static async getSyncQueue(): Promise<any[]> {
    try {
      return await get<any[]>(STORAGE_KEYS.SYNC_QUEUE) || []
    } catch {
      return []
    }
  }

  static async saveSyncQueue(queue: any[]): Promise<void> {
    await set(STORAGE_KEYS.SYNC_QUEUE, queue)
  }

  static async clearSyncQueue(): Promise<void> {
    await del(STORAGE_KEYS.SYNC_QUEUE)
  }

  // Limpar todos os dados
  static async clearAll(): Promise<void> {
    await clear()
  }
}
