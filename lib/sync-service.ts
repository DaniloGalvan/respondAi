import { supabase } from './supabase'
import { LocalStorageService } from './storage'

interface SyncItem {
  type: 'answer' | 'finish_session'
  data: any
  sessionId: string
  timestamp: string
}

export class SyncService {
  private static isOnline = navigator.onLine
  private static syncInProgress = false

  // Inicializar observadores de online/offline
  static init() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Processar fila de sincronização
  static async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return
    }

    this.syncInProgress = true

    try {
      const queue = await LocalStorageService.getSyncQueue()
      
      if (queue.length === 0) {
        return
      }

      console.log(`Processando ${queue.length} itens da fila de sincronização`)

      // Agrupar itens por tipo para processamento em lote
      const answers = queue.filter(item => item.type === 'answer')
      const sessionUpdates = queue.filter(item => item.type === 'finish_session')

      // Sincronizar respostas em lote
      if (answers.length > 0) {
        await this.syncAnswers()
      }

      // Sincronizar atualizações de sessão
      if (sessionUpdates.length > 0) {
        await this.syncSessionUpdates(sessionUpdates)
      }

      // Limpar fila sincronizada
      await LocalStorageService.clearSyncQueue()
      
      console.log('Sincronização concluída com sucesso')
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Sincronizar respostas pendentes (com UPSERT para evitar duplicatas)
  static async syncAnswers(): Promise<void> {
    try {
      const queue = await LocalStorageService.getSyncQueue()
      const answerItems = queue.filter(item => item.type === 'answer')

      if (answerItems.length === 0) {
        console.log('Nenhuma resposta para sincronizar')
        return
      }

      console.log(`Sincronizando ${answerItems.length} respostas...`)

      // Função simples de validação de UUID
      const isValidUUID = (str: string) => {
        return str.length > 10 && /^[0-9a-f-]+$/i.test(str)
      }

      // SANITIZAÇÃO: Filtrar apenas itens com UUIDs válidos
      const sanitizedItems = answerItems.filter(item => {
        const isValidSessionId = isValidUUID(item.sessionId)
        const isValidQuestionId = isValidUUID(item.data.id_questao)
        
        if (!isValidSessionId || !isValidQuestionId) {
          console.warn(`[SYNC SANITIZE] Descartando item inválido:`, {
            sessionId: item.sessionId,
            questionId: item.data.id_questao,
            validSession: isValidSessionId,
            validQuestion: isValidQuestionId
          })
          return false
        }
        return true
      })

      console.log(`Itens válidos para sincronizar: ${sanitizedItems.length}/${answerItems.length}`)

      if (sanitizedItems.length === 0) {
        // Limpar fila corrompida
        await LocalStorageService.clearSyncQueue()
        return
      }

      // Tentar sincronizar itens válidos com UPSERT (sobrescreve duplicatas)
      const answersToSync = sanitizedItems.map(item => ({
        id_sessao: item.sessionId,
        id_questao: item.data.id_questao,
        resposta_aluno: item.data.resposta_aluno,
        correta: item.data.correta,
        respondido_em: item.data.respondido_em
      }))

      const { error } = await supabase
        .from('respostas_alunos')
        .upsert(answersToSync, {
          onConflict: 'id_sessao,id_questao' // Constraint UNIQUE do banco
        })

      // TRATAMENTO RESILIENTE: Não quebrar o fluxo em caso de erro
      if (error) {
        console.warn('[SYNC ERROR] Falha ao sincronizar respostas, mas continuando o fluxo:', {
          error: error.message,
          details: error.details,
          code: error.code
        })
        // Não dá throw new Error - apenas log e continua
        return
      }

      console.log('Respostas sincronizadas/atualizadas com sucesso!')
      
      // Limpar apenas itens sincronizados com sucesso
      const syncedItemIds = new Set(sanitizedItems.map(item => item.timestamp))
      const remainingItems = queue.filter(item => !syncedItemIds.has(item.timestamp))
      await LocalStorageService.saveSyncQueue(remainingItems)

    } catch (error) {
      console.warn('[SYNC CATCH] Erro geral na sincronização, mas fluxo continua:', error)
      // Não propaga erro para não quebrar finalização da sessão
    }
  }

  // Sincronizar atualizações de sessão
  private static async syncSessionUpdates(sessionUpdates: SyncItem[]): Promise<void> {
    // Pegar apenas o último update de sessão (mais recente)
    const latestUpdate = sessionUpdates[sessionUpdates.length - 1]
    
    if (!latestUpdate || !latestUpdate.data.id_sessao) {
      return
    }

    const { error } = await supabase
      .from('sessoes_aluno')
      .update({
        status: latestUpdate.data.status,
        concluido_em: latestUpdate.data.concluido_em
      })
      .eq('id', latestUpdate.data.id_sessao)

    if (error) {
      throw new Error(`Erro ao atualizar sessão: ${error.message}`)
    }
  }

  // Verificar status de conexão
  static isOnlineStatus(): boolean {
    return this.isOnline
  }

  // Forçar sincronização manual
  static async forceSync(): Promise<void> {
    await this.processSyncQueue()
  }
}
