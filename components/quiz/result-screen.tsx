"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Target, RotateCcw, CloudUpload, CheckCircle2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncService } from "@/lib/sync-service"
import { ConfettiService } from "@/lib/confetti-service"

interface ResultScreenProps {
  score: number
  total: number
  onRestart: () => void
}

export function ResultScreen({ score, total, onRestart }: ResultScreenProps) {
  const [syncState, setSyncState] = useState<"syncing" | "done" | "offline">("syncing")
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const hasTriggeredFinalConfetti = useRef(false) // Evita disparo duplicado
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  // Confete final único (apenas uma vez ao montar)
  useEffect(() => {
    if (!hasTriggeredFinalConfetti.current && percentage >= 70) {
      console.log('ResultScreen: Disparando confete final único!')
      ConfettiService.triggerCompletion() // Método correto
      hasTriggeredFinalConfetti.current = true
    }
  }, [percentage])

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Tentar sincronizar quando online
  useEffect(() => {
    if (isOnline) {
      const syncData = async () => {
        try {
          setSyncState("syncing")
          await SyncService.forceSync()
          setSyncState("done")
        } catch (error) {
          console.error('Erro na sincronização:', error)
          setSyncState("offline")
        }
      }

      // Pequeno delay para mostrar o estado de sincronização
      const timer = setTimeout(syncData, 1000)
      return () => clearTimeout(timer)
    } else {
      setSyncState("offline")
    }
  }, [isOnline])

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Excelente! Você arrasou!"
    if (percentage >= 70) return "Muito bem! Ótimo desempenho!"
    if (percentage >= 50) return "Bom trabalho! Continue estudando!"
    return "Não desanime! Pratique mais!"
  }

  const getPerformanceColor = () => {
    if (percentage >= 70) return "text-success"
    if (percentage >= 50) return "text-accent-foreground"
    return "text-destructive"
  }

  const getSyncMessage = () => {
    if (syncState === "syncing") return "Sincronizando resultados..."
    if (syncState === "done") return "Resultados sincronizados com sucesso"
    return "Resultados salvos offline. Sincronização automática quando conectar."
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Trophy / Badge */}
        <div className="relative flex flex-col items-center gap-4">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-3xl ${
              percentage >= 70
                ? "bg-success/15"
                : percentage >= 50
                  ? "bg-accent/30"
                  : "bg-destructive/10"
            }`}
          >
            {percentage >= 70 ? (
              <Trophy
                className="h-12 w-12 text-success"
                aria-hidden="true"
              />
            ) : (
              <Target
                className={`h-12 w-12 ${percentage >= 50 ? "text-accent-foreground" : "text-destructive"}`}
                aria-hidden="true"
              />
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quiz Finalizado!
          </h1>
          <p className={`text-lg font-semibold ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Score Card */}
        <div
          className="flex w-full flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
          role="region"
          aria-label="Resultado do quiz"
        >
          {/* Big Score */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-6xl font-extrabold tracking-tighter text-primary">
              {percentage}%
            </span>
            <span className="text-sm text-muted-foreground">de acertos</span>
          </div>

          {/* Score Details */}
          <div className="flex w-full items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-success">{score}</span>
              <span className="text-xs text-muted-foreground">Corretas</span>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-destructive">
                {total - score}
              </span>
              <span className="text-xs text-muted-foreground">Incorretas</span>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>

          {/* Score Bar Visual */}
          <div className="flex w-full flex-col gap-2">
            <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Você acertou ${percentage} por cento das questões`}
              />
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <Button
          onClick={onRestart}
          variant="outline"
          className="h-12 w-full rounded-xl text-base font-semibold transition-all focus-visible:ring-4 focus-visible:ring-primary/40 cursor-pointer"
          aria-label="Jogar novamente, iniciar um novo quiz"
        >
          <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" />
          Jogar Novamente
        </Button>

        {/* Sync Status */}
        <footer className="flex items-center gap-2 text-xs text-muted-foreground">
          <div aria-live="polite" aria-atomic="true" className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>

            <div className="h-3 w-px bg-border" aria-hidden="true" />

            {/* Sync Status */}
            {syncState === "syncing" && (
              <>
                <CloudUpload className="h-4 w-4 animate-pulse" aria-hidden="true" />
                <span>{getSyncMessage()}</span>
              </>
            )}
            {syncState === "done" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                <span>{getSyncMessage()}</span>
              </>
            )}
            {syncState === "offline" && (
              <>
                <CloudUpload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{getSyncMessage()}</span>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
