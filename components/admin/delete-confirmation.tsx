"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

interface DeleteConfirmationProps {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isSecondConfirm?: boolean
}

export default function DeleteConfirmation({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isSecondConfirm = false,
}: DeleteConfirmationProps) {
  const { t } = useLanguage()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAnimate(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`glass-strong rounded-xl max-w-md w-full p-8 transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } ${isSecondConfirm ? "border-2 border-red-500/50" : ""}`}
      >
        <div className={`text-4xl mb-4 text-center ${isSecondConfirm ? "animate-bounce" : ""}`}>
          {isSecondConfirm ? "⚠️" : "🗑️"}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3 text-center">{title}</h2>
        <p className="text-foreground/70 mb-8 text-center">{description}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg font-medium transition duration-300 hover:scale-105"
          >
            {t("admin.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition duration-300 hover:scale-105 ${
              isSecondConfirm 
                ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {t("admin.delete")}
          </button>
        </div>
      </div>
    </div>
  )
}
