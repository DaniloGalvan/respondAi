"use client"

import { useState, useCallback } from "react"
import { StartScreen } from "./start-screen"
import { QuizScreen } from "./quiz-screen"
import { ResultScreen } from "./result-screen"
import { Confetti } from "./confetti"
import { MOCK_QUIZ } from "@/lib/quiz-data"

type Screen = "start" | "quiz" | "result"

export function QuizPlayer() {
  const [screen, setScreen] = useState<Screen>("start")
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleStart = useCallback((_quizCode: string, _studentName: string) => {
    setScreen("quiz")
  }, [])

  const handleCorrectAnswer = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)
  }, [])

  const handleFinish = useCallback((finalScore: number, totalQuestions: number) => {
    setScore(finalScore)
    setTotal(totalQuestions)
    setScreen("result")
  }, [])

  const handleRestart = useCallback(() => {
    setScore(0)
    setTotal(0)
    setScreen("start")
  }, [])

  return (
    <>
      <Confetti active={showConfetti} />

      {screen === "start" && <StartScreen onStart={handleStart} />}

      {screen === "quiz" && (
        <QuizScreen
          questions={MOCK_QUIZ}
          onFinish={handleFinish}
          onCorrectAnswer={handleCorrectAnswer}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          score={score}
          total={total}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
