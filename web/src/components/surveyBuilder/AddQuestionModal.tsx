import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import {
  CloseIcon,
  XIcon,
  ShortTextIcon,
  MultipleChoiceIcon,
  RatingIcon,
  RankingIcon,
  MatrixIcon,
  FileUploadIcon,
  CommentIcon,
  TimerIcon,
  EmailQIcon,
} from '@/utils/icons'
import type { AddQuestionModalProps, QuestionTypeOption } from '@/types'
import { isValidQuestionTitle, isValidQuestionOptions } from '@/utils/validations'

const QUESTION_TYPES: QuestionTypeOption[] = [
  {
    id: 'short_text',
    label: 'Short Text',
    icon: <ShortTextIcon />,
    description: 'Single line text answer',
  },
  {
    id: 'multiple_choice',
    label: 'Multiple Choice',
    icon: <MultipleChoiceIcon />,
    description: 'Choose one or more options',
  },
  {
    id: 'rating',
    label: '1-5 Rating',
    icon: <RatingIcon />,
    description: 'Star or numeric rating',
  },
  {
    id: 'ranking',
    label: 'Ranking',
    icon: <RankingIcon />,
    description: 'Order items by preference',
  },
  {
    id: 'matrix',
    label: 'Matrix',
    icon: <MatrixIcon />,
    description: 'Grid of questions',
  },
  {
    id: 'file_upload',
    label: 'File Upload',
    icon: <FileUploadIcon />,
    description: 'Allow file attachments',
  },
  {
    id: 'comment',
    label: 'Long Text',
    icon: <CommentIcon />,
    description: 'Multi-line text answer',
  },
  {
    id: 'timer',
    label: 'Timed Question',
    icon: <TimerIcon />,
    description: 'Answer within time limit',
  },
  {
    id: 'email',
    label: 'Email',
    icon: <EmailQIcon />,
    description: 'Collect email address',
  },
]

export const AddQuestionModal = ({ isOpen, isLoading, onClose, onSubmit }: AddQuestionModalProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      setStep('select')
      setSelectedType(null)
      setTitle('')
      setDescription('')
      setOptions(['', ''])
      setErrors({})
    }
  }, [isOpen])

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setStep('configure')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const cleanedTitle = title.trim()

    // Validate title
    if (!cleanedTitle) {
      newErrors.title = 'Question title is required'
    } else if (!isValidQuestionTitle(cleanedTitle)) {
      newErrors.title = 'Question title must be 3-100 characters'
    }

    // Validate options for multiple choice
    if (selectedType === 'multiple_choice') {
      if (!isValidQuestionOptions(options)) {
        const filledOptions = options.filter((opt) => opt.trim())
        if (filledOptions.length < 2) {
          newErrors.options = 'Add at least 2 options'
        } else {
          newErrors.options = 'Options must be unique'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const filledOptions = selectedType === 'multiple_choice' ? options.filter((opt) => opt.trim()) : undefined

    let mappedType: 'short_text' | 'multiple_choice' | 'rating' = 'short_text'
    if (selectedType === 'multiple_choice') {
      mappedType = 'multiple_choice'
    } else if (selectedType === 'rating') {
      mappedType = 'rating'
    }

    await onSubmit(mappedType, title.trim(), description.trim() || undefined, filledOptions)

    setStep('select')
    setSelectedType(null)
    setTitle('')
    setDescription('')
    setOptions(['', ''])
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx))
    }
  }

  const updateOption = (idx: number, value: string) => {
    const newOptions = [...options]
    newOptions[idx] = value
    setOptions(newOptions)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-violet-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-violet-100 bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-bold text-white">
            {step === 'select' ? 'Add Question' : 'Question Details'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-violet-100 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <div>
              <p className="text-sm text-gray-600 mb-6">Choose a question type to get started</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-violet-500 hover:bg-violet-50 transition-all"
                  >
                    <div className="mb-2">{type.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., How satisfied are you?"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50 text-gray-900"
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context or help text..."
                  disabled={isLoading}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                />
              </div>

              {selectedType === 'multiple_choice' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Answer Options *</label>
                    <button
                      onClick={addOption}
                      disabled={isLoading}
                      className="text-sm text-violet-600 hover:text-violet-700 disabled:opacity-50 font-medium"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {options.map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          disabled={isLoading}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                        />
                        {options.length > 2 && (
                          <button
                            onClick={() => removeOption(idx)}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-red-600 disabled:opacity-50 p-2"
                          >
                            <XIcon />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.options && <p className="text-sm text-red-600 mt-2">{errors.options}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {step === 'configure' && (
            <button
              onClick={() => setStep('select')}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          {step === 'configure' && (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !title.trim()}
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
