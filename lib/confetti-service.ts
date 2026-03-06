import confetti from 'canvas-confetti'

export class ConfettiService {
  // Verificar se o usuário prefere movimento reduzido
  private static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Disparar confetes para respostas corretas
  static async triggerSuccess(): Promise<void> {
    // Verificar acessibilidade
    if (this.prefersReducedMotion()) {
      console.log('Confetes desativados: usuário prefere movimento reduzido')
      return
    }

    try {
      // Configuração acessível e performática com z-index alto
      await confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'], // Verdes
        ticks: 100, // Reduz duração para melhor performance
        gravity: 1.2,
        scalar: 0.8,
        shapes: ['square', 'circle'],
        zIndex: 999999 // Z-index alto para aparecer sobre UI
      })
    } catch (error) {
      console.error('Erro ao disparar confetes:', error)
    }
  }

  // Disparar confetes para conclusão do quiz (mais elaborado)
  static async triggerCompletion(): Promise<void> {
    if (this.prefersReducedMotion()) {
      console.log('Confetes desativados: usuário prefere movimento reduzido')
      return
    }

    try {
      // Primeira explosão
      await confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'], // Cores vibrantes
        ticks: 150,
        gravity: 1.1,
        scalar: 1,
        zIndex: 999999 // Z-index alto para aparecer sobre UI
      })

      // Segunda explosão após 300ms
      setTimeout(async () => {
        await confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#ef4444'],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.8,
          zIndex: 999999 // Z-index alto para aparecer sobre UI
        })
      }, 300)

      // Terceira explosão após 600ms
      setTimeout(async () => {
        await confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#ef4444'],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.8,
          zIndex: 999999 // Z-index alto para aparecer sobre UI
        })
      }, 600)
    } catch (error) {
      console.error('Erro ao disparar confetes de conclusão:', error)
    }
  }
}
