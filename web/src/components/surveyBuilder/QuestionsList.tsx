import { useState } from 'react'
import type { Question, QuestionsListProps } from '@/types'
import { useAppDispatch } from '@/hooks/redux'
import { deleteQuestionFromSurvey, reorderSurveyQuestions, updateQuestionDetails} from '@/store/slices/questionSlice'
import { toast } from '@/lib/toast'
import { CustomModal } from '@/components/common/CustomModal'
import { useModal } from '@/hooks/useModal'
import { TrashIcon, DragIcon, SettingsIcon } from '@/utils/icons'

export const QuestionsList = ({ questions, isEmpty = false, surveyId }: QuestionsListProps) => {
  const dispatch = useAppDispatch()
  const { isOpen, title, description, variant, isLoading, openModal, closeModal, handleConfirm } = useModal()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    openModal({
      title: 'Delete Question',
      description: `Are you sure you want to delete this question? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setDeletingId(questionId)
        try {
          const result = await dispatch(deleteQuestionFromSurvey({ surveyId, questionId }))
          if (result.type === deleteQuestionFromSurvey.fulfilled.type) {
            toast.success('Question deleted')
          } else {
            toast.error('Failed to delete question')
          }
        } finally {
          setDeletingId(null)
        }
      },
    })
  }

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedId(questionId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (!draggedId) return

    const draggedIdx = questions.findIndex((q) => q.id === draggedId)
    if (draggedIdx === -1 || draggedIdx === targetIdx) {
      setDraggedId(null)
      return
    }

    const newOrder = [...questions]
    const draggedQuestion = newOrder[draggedIdx]
    if (!draggedQuestion) {
      setDraggedId(null)
      return
    }

    newOrder.splice(draggedIdx, 1)
    newOrder.splice(targetIdx, 0, draggedQuestion)

    const questionIds = newOrder.map((q) => q.id)
    const result = await dispatch(reorderSurveyQuestions({ surveyId, questionIds }))

    if (result.type === reorderSurveyQuestions.fulfilled.type) {
      toast.success('Questions reordered')
    }
    setDraggedId(null)
  }

  const handleEditStart = (question: Question) => {
    setEditingId(question.id)
    setEditData({
      [question.id]: {
        title: question.title,
        description: question.description || '',
        options: question.options || [],
      },
    })
  }

  const handleEditSave = async (question: Question) => {
    const data = editData[question.id]
    if (!data.title.trim()) {
      toast.error('Question title is required')
      return
    }

    const result = await dispatch(
      updateQuestionDetails({
        surveyId,
        questionId: question.id,
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        options: question.type === 'multiple_choice' ? data.options.filter((o: string) => o.trim()) : undefined,
      }),
    )

    if (result.type === updateQuestionDetails.fulfilled.type) {
      setEditingId(null)
      toast.success('Question updated')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'short_text':
        return 'Short Text'
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'rating':
        return '5-Star Rating'
      default:
        return type
    }
  }

  if (isEmpty) {
    return (
      <div className="app-panel-muted border-2 border-dashed border-violet-200 p-12 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
              <path d="M12 2L2 7v10a11.07 11.07 0 0 0 11 11 11.07 11.07 0 0 0 11-11V7l-10-5" />
              <polyline points="12 12 16 8 12 4 8 8" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
        <p className="text-gray-600">Click "Add Question" to start building your survey</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions ({questions.length})</h2>
      
      {questions.map((question, idx) => (
        <div
          key={question.id}
          draggable
          onDragStart={(e) => handleDragStart(e, question.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, idx)}
          className={`rounded-2xl border-2 bg-white shadow-sm transition-all ${
            draggedId === question.id
              ? 'opacity-50 border-violet-500'
              : 'border-gray-200 hover:border-violet-300'
          }`}
        >
          {editingId === question.id ? (
            // Edit Mode
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Question Title</label>
                <input
                  type="text"
                  value={editData[question.id]?.title || ''}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      [question.id]: { ...editData[question.id], title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                <textarea
                  value={editData[question.id]?.description || ''}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      [question.id]: { ...editData[question.id], description: e.target.value },
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {question.type === 'multiple_choice' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Options</label>
                  <div className="space-y-1">
                    {(editData[question.id]?.options || []).map((option: string, optIdx: number) => (
                      <input
                        key={optIdx}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editData[question.id]?.options || [])]
                          newOptions[optIdx] = e.target.value
                          setEditData({
                            ...editData,
                            [question.id]: { ...editData[question.id], options: newOptions },
                          })
                        }}
                        className="w-full px-3 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSave(question)}
                  className="flex-1 px-3 py-2 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="p-4 flex items-start gap-4">
              {/* Drag Handle */}
              <div className="pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <DragIcon />
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{getTypeLabel(question.type)}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{question.title}</h3>
                {question.description && (
                  <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                )}

                {question.type === 'multiple_choice' && question.options && question.options.length > 0 && (
                  <div className="mt-2 space-y-1 ml-4">
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"></span>
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'rating' && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEditStart(question)}
                  disabled={deletingId === question.id}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Edit question"
                >
                  <SettingsIcon />
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  disabled={deletingId === question.id}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-50 p-2 hover:bg-red-50 rounded transition-colors"
                  title="Delete question"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isOpen && deletingId !== null}
        title={title}
        description={description}
        variant={variant}
        onClose={closeModal}
        onConfirm={handleConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isLoading}
      />
    </div>
  )
}
