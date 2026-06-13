import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CloseIcon } from '@/utils/icons'

export const CreateSurveyModal = ({ isOpen, isLoading, onClose, onSubmit }: CreateSurveyModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')

    if (!title.trim()) {
      setError('Survey title is required')
      return
    }

    if (title.trim().length < 3) {
      setError('Survey title must be at least 3 characters')
      return
    }

    try {
      await onSubmit(title.trim(), description.trim() || undefined)
      setTitle('')
      setDescription('')
    } catch (err) {
      setError('Failed to create survey. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Survey</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <Input
            label="Survey Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Customer Feedback, Product Survey"
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description to help respondents understand the survey..."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary" fullWidth disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary" fullWidth isLoading={isLoading}>
            Create Survey
          </Button>
        </div>
      </div>
    </div>
  )
}
