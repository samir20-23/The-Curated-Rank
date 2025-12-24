"use client"

interface DeleteConfirmationProps {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmation({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-strong rounded-xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-foreground/70 mb-8">{description}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg font-medium transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium transition duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
