"use client"

import { useSearchParams } from 'next/navigation'
import { QuizPlayer } from "@/components/quiz/quiz-player"

export default function Home() {
  const searchParams = useSearchParams()
  const alunoId = searchParams.get('aluno_id') || undefined
  
  return <QuizPlayer alunoId={alunoId} />
}
