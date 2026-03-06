"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuizPlayer } from "@/components/quiz/quiz-player"

// 1. Criamos um "sub-componente" apenas para ler a URL
function SearchParamsWrapper() {
  const searchParams = useSearchParams()
  const alunoId = searchParams.get('aluno_id') || undefined
  
  return <QuizPlayer alunoId={alunoId} />
}

// 2. A página principal agora envolve esse sub-componente com a placa de "Espere" (Suspense)
export default function Home() {
  return (
    <Suspense fallback={<div>Carregando aplicativo...</div>}>
      <SearchParamsWrapper />
    </Suspense>
  )
}