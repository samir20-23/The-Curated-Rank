"use client"

import { useState } from "react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  itemName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function DeleteConfirmationModal({ isOpen, itemName, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  const [step, setStep] = useState<"confirm" | "math" | "final">("confirm")
  const [mathAnswer, setMathAnswer] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const correctAnswer = (num1 + num2).toString()

  const handleConfirm = async () => {
    if (step === "confirm") {
      setStep("math")
    } else if (step === "math") {
      if (mathAnswer === correctAnswer) {
        setStep("final")
      } else {
        alert("Incorrect answer. Please try again.")
        setMathAnswer("")
      }
    } else if (step === "final") {
      setIsDeleting(true)
      try {
        await onConfirm()
        setStep("confirm")
        setMathAnswer("")
        onCancel()
      } catch (error) {
        console.error("Error deleting:", error)
        setIsDeleting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-sm w-full">
        <div className="p-6">
          {step === "confirm" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Are you sure?</h2>
              <p className="text-slate-300">
                You are about to delete <span className="font-semibold text-emerald-300">"{itemName}"</span>. This
                action cannot be undone.
              </p>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "math" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Confirm Deletion</h2>
              <p className="text-slate-300">Please solve this math problem to confirm:</p>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-300 mb-4">
                  {num1} + {num2} = ?
                </p>
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirm()
                  }}
                  className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Answer"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300 transition"
                >
                  Continue
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "final" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Final Confirmation</h2>
              <p className="text-slate-300">
                Are you absolutely certain you want to permanently delete{" "}
                <span className="font-semibold">"{itemName}"</span>?
              </p>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
