import { Outlet, useLocation } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/lib/toast'
import { AppLayout } from '@/components/Layout/AppLayout'
import { CustomModal } from '@/components/common/CustomModal'
import { OffCanvas } from '@/components/common/OffCanvas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SurveysGrid } from '@/components/surveys/SurveysGrid'
import { SurveyDetailsForm } from '@/components/surveys/SurveyDetailsForm'
import { BrandingForm } from '@/components/surveys/BrandingForm'
import { ShareSurveyModal } from '@/components/surveys/ShareSurveyModal'
import { SurveyBasicsStep } from '@/components/surveys/SurveyBasicsStep'
import { SurveyBrandingStep } from '@/components/surveys/SurveyBrandingStep'
import { SurveyQuestionsStep } from '@/components/surveys/SurveyQuestionsStep'
import { SurveyPublishStep } from '@/components/surveys/SurveyPublishStep'
import { QuestionComposerCard } from '@/components/surveys/QuestionComposerCard'
import { useModal } from '@/hooks/useModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import type { Survey } from '@/services/api/surveys'
import type { Question } from '@/types/survey'
import { CalendarIcon, SortIcon, FilterIcon } from '@/utils/icons'
import {
  clearCurrentSurvey,
  clearError,
  createNewSurvey,
  deleteSurveyById,
  fetchSurveyById,
  fetchUserSurveys,
  updateSurveyDetails,
} from '@/store/slices/surveySlice'
import {
  addQuestionToSurvey,
  deleteQuestionFromSurvey,
  reorderSurveyQuestions,
  updateQuestionDetails,
} from '@/store/slices/questionSlice'
import type { SurveyRecord, QuestionFormState } from '@/types'
import {
  DEFAULT_SURVEY_FORM as defaultSurveyForm,
  DEFAULT_QUESTION_FORM,
  SURVEY_PAGE_SIZE,
} from '@/utils/constants'
import {
  isValidSurveyTitle,
  isValidSurveyDescription,
  isValidQuestionTitle,
  isValidQuestionOptions,
  isMultipleChoiceQuestion,
} from '@/utils/validations'
import {
  normalizeQuestionType,
  statusLabel,
  buildPaginationItems,
  getSurveyUrl,
  readFileAsDataUrl,
} from '@/utils/common/survey'

const defaultQuestionForm: QuestionFormState = DEFAULT_QUESTION_FORM

export const SurveysPage = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const modal = useModal()

  const surveys = useAppSelector((state) => state.survey.surveys) as SurveyRecord[]
  const currentSurvey = useAppSelector((state) => state.survey.currentSurvey) as SurveyRecord | null
  const isLoading = useAppSelector((state) => state.survey.isLoading)
  const error = useAppSelector((state) => state.survey.error)

  // State management
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1)
  const [createSurveyId, setCreateSurveyId] = useState<string | null>(null)
  const [isQuestionComposerOpen, setIsQuestionComposerOpen] = useState(false)
  const [questionMode, setQuestionMode] = useState<'create' | 'edit'>('create')
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [isSavingSurvey, setIsSavingSurvey] = useState(false)
  const [isPublishingSurvey, setIsPublishingSurvey] = useState(false)
  const [isSavingQuestion, setIsSavingQuestion] = useState(false)
  const [logoFileName, setLogoFileName] = useState('')
  const [surveyForm, setSurveyForm] = useState(defaultSurveyForm)
  const [surveyErrors, setSurveyErrors] = useState<Record<string, string>>({})
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm)
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({})
  const [surveySearch, setSurveySearch] = useState('')
  const [surveyDateRange, setSurveyDateRange] = useState('all')
  const [surveyStatus, setSurveyStatus] = useState('all')
  const [surveySortBy, setSurveySortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null)
  const [surveyToShare, setSurveyToShare] = useState<Pick<Survey, 'title' | 'slug'> | null>(null)

  const pageSize = SURVEY_PAGE_SIZE

  // Memoized computations
  const activeSurvey = useMemo(() => {
    const surveyId = selectedSurveyId ?? (isCreateOpen ? createSurveyId : null)
    if (!surveyId) return null
    if (currentSurvey?.id === surveyId) {
      return currentSurvey
    }
    return surveys.find((survey) => survey.id === surveyId) ?? null
  }, [currentSurvey, createSurveyId, isCreateOpen, selectedSurveyId, surveys])

  const activeQuestions = activeSurvey?.questions ?? []

  const hasEditChanges = useMemo(() => {
    if (!activeSurvey) return false

    return (
      activeSurvey.title !== surveyForm.title.trim() ||
      (activeSurvey.description || '') !== surveyForm.description.trim() ||
      (activeSurvey.primaryColor || '').toLowerCase() !== surveyForm.primaryColor.toLowerCase() ||
      (activeSurvey.logoUrl || '') !== surveyForm.logoUrl.trim()
    )
  }, [activeSurvey, surveyForm])

  const orderedSurveys = useMemo(
    () =>
      [...surveys].sort((first, second) => {
        const firstDate = new Date(first.createdAt).getTime()
        const secondDate = new Date(second.createdAt).getTime()
        return secondDate - firstDate
      }),
    [surveys],
  )

  const filteredSurveys = useMemo(() => {
    const query = surveySearch.trim().toLowerCase()
    const now = Date.now()
    const rangeFiltered = orderedSurveys.filter((survey) => {
      if (surveyDateRange === 'all') {
        return true
      }

      const createdAt = new Date(survey.createdAt).getTime()
      const daysAgo = (now - createdAt) / (1000 * 60 * 60 * 24)

      if (surveyDateRange === '7d') {
        return daysAgo <= 7
      }

      if (surveyDateRange === '30d') {
        return daysAgo <= 30
      }

      return true
    })

    const statusFiltered = rangeFiltered.filter((survey) => {
      if (surveyStatus === 'all') {
        return true
      }
      return survey.status === surveyStatus
    })

    const searchFiltered = !query
      ? statusFiltered
      : statusFiltered.filter((survey) => {
          const searchable = [survey.title, survey.description, survey.slug, statusLabel(survey.status)]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchable.includes(query)
        })

    return [...searchFiltered].sort((first, second) => {
      switch (surveySortBy) {
        case 'oldest':
          return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
        case 'title':
          return first.title.localeCompare(second.title)
        case 'responses':
          return (second.responseCount ?? 0) - (first.responseCount ?? 0)
        case 'newest':
        default:
          return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      }
    })
  }, [orderedSurveys, surveyDateRange, surveyStatus, surveySearch, surveySortBy])

  const totalPages = Math.max(1, Math.ceil(filteredSurveys.length / pageSize))
  const paginatedSurveys = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredSurveys.slice(startIndex, startIndex + pageSize)
  }, [currentPage, filteredSurveys])

  const pageItems = useMemo(() => buildPaginationItems(currentPage, totalPages), [currentPage, totalPages])

  // Effects
  useEffect(() => {
    dispatch(fetchUserSurveys())
  }, [dispatch])

  useEffect(() => {
    const refreshSurveys = () => {
      dispatch(fetchUserSurveys())
    }

    window.addEventListener('focus', refreshSurveys)
    return () => window.removeEventListener('focus', refreshSurveys)
  }, [dispatch])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [surveySearch])

  useEffect(() => {
    const surveyIdToLoad = selectedSurveyId ?? (isCreateOpen ? createSurveyId : null)
    if (surveyIdToLoad) {
      dispatch(fetchSurveyById(surveyIdToLoad))
    } else {
      dispatch(clearCurrentSurvey())
    }
  }, [createSurveyId, dispatch, isCreateOpen, selectedSurveyId])

  useEffect(() => {
    if (!activeSurvey) return

    setSurveyForm({
      title: activeSurvey.title,
      description: activeSurvey.description || '',
      primaryColor: activeSurvey.primaryColor || '#6366F1',
      logoUrl: activeSurvey.logoUrl || '',
    })
  }, [activeSurvey?.id])

  useEffect(() => {
    if (error) {
      const errorMsg = Object.values(error)[0] || 'An error occurred'
      toast.error(errorMsg)
      dispatch(clearError())
    }
  }, [dispatch, error])

  // Event handlers
  const closeSurveyDrawer = () => {
    setSelectedSurveyId(null)
    setIsQuestionComposerOpen(false)
    setEditingQuestionId(null)
    setQuestionForm(defaultQuestionForm)
    setQuestionErrors({})
  }

  const closeCreateWizard = () => {
    setIsCreateOpen(false)
    setCreateStep(1)
    setSelectedSurveyId(null)
    setCreateSurveyId(null)
    setIsQuestionComposerOpen(false)
    setEditingQuestionId(null)
    setQuestionForm(defaultQuestionForm)
    setQuestionErrors({})
    setLogoFileName('')
    setSurveyForm(defaultSurveyForm)
    setSurveyErrors({})
  }

  const refreshData = async (surveyId?: string) => {
    await dispatch(fetchUserSurveys())
    if (surveyId) {
      await dispatch(fetchSurveyById(surveyId))
    }
  }

  const openCreateDrawer = () => {
    setSurveyForm(defaultSurveyForm)
    setSurveyErrors({})
    setCreateStep(1)
    setLogoFileName('')
    setSelectedSurveyId(null)
    setCreateSurveyId(null)
    setIsQuestionComposerOpen(false)
    setIsCreateOpen(true)
  }

  const openSurveyDrawer = (surveyId: string) => {
    setSelectedSurveyId(surveyId)
    setIsCreateOpen(false)
  }

  const openAddQuestionDrawer = () => {
    setQuestionMode('create')
    setEditingQuestionId(null)
    setQuestionForm(defaultQuestionForm)
    setQuestionErrors({})
    setIsQuestionComposerOpen(true)
  }

  const openEditQuestionDrawer = (question: Question) => {
    setQuestionMode('edit')
    setEditingQuestionId(question.id)
    setQuestionErrors({})
    setQuestionForm({
      type:
        question.uiType === 'textarea'
          ? 'long_text'
          : question.uiType === 'checkbox_group'
            ? 'checkbox_group'
            : question.uiType === 'select'
              ? 'dropdown'
              : question.uiType === 'toggle'
                ? 'yes_no'
                : question.type === 'multiple_choice' || question.type === 'rating'
                  ? question.type
                  : 'short_text',
      uiType: question.uiType || (question.type === 'rating' ? 'buttons' : 'input'),
      title: question.title,
      description: question.description || '',
      required: question.required,
      options:
        (question.type === 'multiple_choice' || question.uiType === 'checkbox_group' || question.uiType === 'select') && question.options && question.options.length > 0
          ? question.options.map((option) => option)
          : ['', ''],
    })
    setIsQuestionComposerOpen(true)
  }

  const validateSurveyForm = () => {
    const nextErrors: Record<string, string> = {}
    const title = surveyForm.title.trim()
    const description = surveyForm.description.trim()

    if (!title) {
      nextErrors.title = 'Survey title is required'
    } else if (!isValidSurveyTitle(title)) {
      nextErrors.title = 'Survey title must be 3-20 characters'
    }

    if (description && !isValidSurveyDescription(description)) {
      nextErrors.description = 'Description must be 5-100 characters'
    }

    setSurveyErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateQuestionForm = () => {
    const nextErrors: Record<string, string> = {}
    const cleanedTitle = questionForm.title.trim()

    if (!cleanedTitle) {
      nextErrors.title = 'Question title is required'
    } else if (!isValidQuestionTitle(cleanedTitle)) {
      nextErrors.title = 'Question title must be 3-100 characters'
    }

    if (isMultipleChoiceQuestion(questionForm.type)) {
      if (!isValidQuestionOptions(questionForm.options)) {
        const cleaned = questionForm.options.map((opt) => opt.trim()).filter(Boolean)
        if (cleaned.length < 2) {
          nextErrors.options = 'Add at least 2 options'
        } else {
          nextErrors.options = 'Options must be unique'
        }
      }
    }

    setQuestionErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleLogoUpload = async (file: File | null) => {
    if (!file) {
      setLogoFileName('')
      setSurveyForm((current) => ({ ...current, logoUrl: '' }))
      return
    }

    const nextLogoUrl = await readFileAsDataUrl(file)
    setLogoFileName(file.name)
    setSurveyForm((current) => ({ ...current, logoUrl: nextLogoUrl }))
  }

  const handleWizardNext = async () => {
    if (createStep === 1) {
      if (!validateSurveyForm()) return
      setCreateStep(2)
      return
    }

    if (createStep === 2) {
      setIsSavingSurvey(true)
      try {
        let surveyIdToRefresh: string | undefined = selectedSurveyId ?? undefined

        if (selectedSurveyId) {
          const result = await dispatch(
            updateSurveyDetails({
              id: selectedSurveyId,
              title: surveyForm.title.trim(),
              description: surveyForm.description.trim() || undefined,
              primaryColor: surveyForm.primaryColor,
              logoUrl: surveyForm.logoUrl.trim() || undefined,
            }),
          )

          if (result.type !== updateSurveyDetails.fulfilled.type) {
            throw new Error('Failed to update survey')
          }
        } else {
          const createAction = await dispatch(
            createNewSurvey({
              title: surveyForm.title.trim(),
              description: surveyForm.description.trim() || undefined,
            }),
          )

          const createdSurveyId = (createAction.payload as { id?: string } | undefined)?.id

          if (!createdSurveyId) {
            throw new Error('Failed to create survey')
          }

          const updateAction = await dispatch(
            updateSurveyDetails({
              id: createdSurveyId,
              title: surveyForm.title.trim(),
              description: surveyForm.description.trim() || undefined,
              primaryColor: surveyForm.primaryColor,
              logoUrl: surveyForm.logoUrl.trim() || undefined,
            }),
          )

          if (updateAction.type !== updateSurveyDetails.fulfilled.type) {
            throw new Error('Failed to save branding')
          }

          surveyIdToRefresh = createdSurveyId
          setCreateSurveyId(createdSurveyId)
        }

        await refreshData(surveyIdToRefresh)
        setCreateSurveyId(surveyIdToRefresh ?? null)
        setCreateStep(3)
      } catch {
        toast.error('Failed to save survey')
      } finally {
        setIsSavingSurvey(false)
      }
      return
    }

    if (createStep === 3) {
      if (activeQuestions.length === 0) {
        toast.error('Add at least one question before continuing')
        return
      }
      setCreateStep(4)
    }
  }

  const handleWizardBack = () => {
    setCreateStep((current) => Math.max(1, current - 1) as 1 | 2 | 3)
  }

  const handleWizardFinish = () => {
    closeCreateWizard()
  }

  const handleSaveSurvey = async () => {
    if (!activeSurvey || !validateSurveyForm()) return

    if (!hasEditChanges) {
      toast.info('No changes detected')
      return
    }

    setIsSavingSurvey(true)
    try {
      const result = await dispatch(
        updateSurveyDetails({
          id: activeSurvey.id,
          title: surveyForm.title.trim(),
          description: surveyForm.description.trim() || undefined,
          primaryColor: surveyForm.primaryColor,
          logoUrl: surveyForm.logoUrl.trim() || undefined,
        }),
      )

      if (result.type === updateSurveyDetails.fulfilled.type) {
        await refreshData(activeSurvey.id)
        toast.success('Survey saved')
        closeSurveyDrawer()
      } else {
        toast.error('Failed to save survey')
      }
    } finally {
      setIsSavingSurvey(false)
    }
  }

  const handleSurveyDelete = (survey: SurveyRecord) => {
    modal.openModal({
      title: 'Delete Survey',
      description: `Delete "${survey.title}"? This also removes its questions and responses.`,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await dispatch(deleteSurveyById(survey.id))
        if (selectedSurveyId === survey.id) {
          closeSurveyDrawer()
        }
        await dispatch(fetchUserSurveys())
        toast.success('Survey deleted')
      },
    })
  }

  const handleQuestionDelete = (question: Question) => {
    if (!activeSurvey) return

    modal.openModal({
      title: 'Delete Question',
      description: `Delete "${question.title}"?`,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const result = await dispatch(
          deleteQuestionFromSurvey({ surveyId: activeSurvey.id, questionId: question.id }),
        )

        if (result.type === deleteQuestionFromSurvey.fulfilled.type) {
          await refreshData(activeSurvey.id)
          toast.success('Question deleted')
        } else {
          toast.error('Failed to delete question')
        }
      },
    })
  }

  const handleQuestionDragStart = (questionId: string) => {
    setDraggedQuestionId(questionId)
  }

  const handleQuestionDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleQuestionDrop = async (targetQuestionId: string) => {
    if (!activeSurvey || !draggedQuestionId || draggedQuestionId === targetQuestionId) {
      setDraggedQuestionId(null)
      return
    }

    const questionIds = activeQuestions.map((question) => question.id)
    const draggedIndex = questionIds.findIndex((id) => id === draggedQuestionId)
    const targetIndex = questionIds.findIndex((id) => id === targetQuestionId)

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedQuestionId(null)
      return
    }

    const [movedQuestionId] = questionIds.splice(draggedIndex, 1)
    if (!movedQuestionId) {
      setDraggedQuestionId(null)
      return
    }

    questionIds.splice(targetIndex, 0, movedQuestionId)

    const result = await dispatch(reorderSurveyQuestions({ surveyId: activeSurvey.id, questionIds }))
    if (result.type === reorderSurveyQuestions.fulfilled.type) {
      await refreshData(activeSurvey.id)
      toast.success('Questions reordered')
    } else {
      toast.error('Failed to reorder questions')
    }

    setDraggedQuestionId(null)
  }

  const handleQuestionDragEnd = () => {
    setDraggedQuestionId(null)
  }

  const handleSaveQuestion = async () => {
    if (!activeSurvey || !validateQuestionForm()) return

    const cleanedOptions = questionForm.options.map((option) => option.trim()).filter(Boolean)
    const mappedQuestion = normalizeQuestionType(questionForm.type)
    const payload = {
      surveyId: activeSurvey.id,
      type: mappedQuestion.type,
      uiType: mappedQuestion.uiType,
      title: questionForm.title.trim(),
      description: questionForm.description.trim() || undefined,
      required: questionForm.required,
      options:
        questionForm.type === 'multiple_choice' || questionForm.type === 'checkbox_group' || questionForm.type === 'dropdown'
          ? cleanedOptions
          : undefined,
    }

    setIsSavingQuestion(true)
    try {
      const result =
        questionMode === 'edit' && editingQuestionId
          ? await dispatch(
              updateQuestionDetails({
                ...payload,
                questionId: editingQuestionId,
              }),
            )
          : await dispatch(addQuestionToSurvey(payload))

      if (
        result.type === updateQuestionDetails.fulfilled.type ||
        result.type === addQuestionToSurvey.fulfilled.type
      ) {
        await refreshData(activeSurvey.id)
        setEditingQuestionId(null)
        setQuestionForm(defaultQuestionForm)
        toast.success(questionMode === 'edit' ? 'Question updated' : 'Question added')
        if (questionMode === 'edit' && selectedSurveyId && !isCreateOpen) {
          closeSurveyDrawer()
        } else {
          setIsQuestionComposerOpen(false)
        }
        setEditingQuestionId(null)
        setQuestionForm(defaultQuestionForm)
      } else {
        toast.error('Failed to save question')
      }
    } finally {
      setIsSavingQuestion(false)
    }
  }

  const handlePublishSurvey = async () => {
    if (!activeSurvey || activeSurvey.status === 'published') return

    if (activeQuestions.length === 0) {
      toast.error('Add at least one question before publishing')
      return
    }

    setIsPublishingSurvey(true)
    try {
      const result = await dispatch(
        updateSurveyDetails({
          id: activeSurvey.id,
          status: 'published',
          publishedAt: activeSurvey.publishedAt || new Date().toISOString(),
        }),
      )

      if (result.type === updateSurveyDetails.fulfilled.type) {
        await refreshData(activeSurvey.id)
        toast.success('Survey published')
        if (isCreateOpen) {
          closeCreateWizard()
        } else {
          closeSurveyDrawer()
        }
      } else {
        toast.error('Failed to publish survey')
      }
    } finally {
      setIsPublishingSurvey(false)
    }
  }

  const handleOpenPreview = (slug: string) => {
    window.open(getSurveyUrl(slug), '_blank', 'noopener,noreferrer')
  }

  const handleCopySurveyLink = async (slug: string) => {
    const survey = surveys.find((item) => item.slug === slug)
    if (!survey || survey.status !== 'published') {
      toast.error('Publish the survey before sharing it')
      return
    }

    try {
      await navigator.clipboard.writeText(getSurveyUrl(slug))
      toast.success('Public link copied')
    } catch {
      toast.error('Unable to copy the public link')
    }
  }

  const handleOpenShareModal = (slug: string) => {
    const survey = surveys.find((item) => item.slug === slug)
    if (!survey) return

    if (survey.status !== 'published') {
      toast.error('Publish the survey before sharing it')
      return
    }

    setSurveyToShare({ title: survey.title, slug: survey.slug })
  }

  const handlePreviewSurvey = (slug: string) => {
    window.open(getSurveyUrl(slug), '_blank', 'noopener,noreferrer')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (location.pathname !== '/surveys' && location.pathname.startsWith('/surveys/')) {
    return <Outlet />
  }

  return (
    <AppLayout>
      <div className="app-page">
        <div className="app-hero flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-100">
              Survey workspace
            </p>
            <p className="max-w-none text-violet-100">
              Create branded surveys, add questions from a drawer, reorder them, and share public links without leaving the page.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="secondary"
              onClick={openCreateDrawer}
              style={{ background: 'white', color: '#4F46E5', border: 'none' }}
            >
              Create survey
            </Button>
          </div>
        </div>

        <section className="app-panel w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h2 className="text-xl font-bold text-gray-900">Your surveys</h2>

            <div className="grid w-full gap-3 lg:max-w-5xl lg:grid-cols-[minmax(0,1.5fr)_150px_150px_150px]">
              <Input
                value={surveySearch}
                onChange={(event) => setSurveySearch(event.target.value)}
                placeholder="Search surveys"
              />

              <Select
                value={surveyDateRange}
                onChange={(event) => setSurveyDateRange(event.target.value)}
                placeholder="Date range"
                icon={<CalendarIcon />}
                options={[
                  { value: 'all', label: 'All time' },
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                ]}
              />

              <Select
                value={surveyStatus}
                onChange={(event) => setSurveyStatus(event.target.value)}
                placeholder="Status"
                icon={<FilterIcon />}
                options={[
                  { value: 'all', label: 'All status' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />

              <Select
                value={surveySortBy}
                onChange={(event) => setSurveySortBy(event.target.value)}
                placeholder="Sort by"
                icon={<SortIcon />}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'title', label: 'Title A to Z' },
                  { value: 'responses', label: 'Most responses' },
                ]}
              />
            </div>
          </div>

          {isLoading && surveys.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Loading surveys...
            </div>
          ) : filteredSurveys.length > 0 ? (
            <>
              <div className="mt-6">
                <SurveysGrid
                  surveys={paginatedSurveys}
                  onEdit={openSurveyDrawer}
                  onPreview={handleOpenPreview}
                  onShare={handleOpenShareModal}
                  onDelete={(id) => {
                    const survey = paginatedSurveys.find((item) => item.id === id)
                    if (survey) {
                      handleSurveyDelete(survey)
                    }
                  }}
                />
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredSurveys.length)} of {filteredSurveys.length}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {pageItems.map((item, index) =>
                      item === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm font-semibold text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handlePageChange(item)}
                          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors ${
                            item === currentPage
                              ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                          aria-current={item === currentPage ? 'page' : undefined}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : surveys.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No surveys match your filter.
            </div>
          ) : (
            <div className="mt-6 flex min-h-[calc(100vh-20rem)] items-center justify-center rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <button
                type="button"
                onClick={openCreateDrawer}
                className="mx-auto text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
              >
                Create new survey
              </button>
            </div>
          )}
        </section>
      </div>

      <OffCanvas
        isOpen={isCreateOpen}
        onClose={closeCreateWizard}
        title={
          createStep === 1
            ? 'Create survey'
            : createStep === 2
              ? 'Add brand'
              : createStep === 3
                ? 'Add questions'
                : 'Publish & share'
        }
        description={
          createStep === 1
            ? 'Start with the survey title and description.'
            : createStep === 2
              ? 'Add your brand color and logo.'
              : createStep === 3
                ? 'Add questions without leaving this drawer.'
                : 'Publish the survey and share the live link.'
        }
        size="xl"
        footer={
          <div className="flex w-full items-center justify-between gap-4">
            <Button variant="tertiary" onClick={handleWizardBack} disabled={createStep === 1}>
              Back
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    createStep === step ? 'bg-violet-600 text-white' : 'bg-white text-gray-500'
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>

            {createStep < 4 ? (
              <Button
                variant="primary"
                onClick={handleWizardNext}
                isLoading={isSavingSurvey}
                disabled={createStep === 1 ? !surveyForm.title.trim() : false}
              >
                Next
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleWizardFinish}>
                  Done
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePublishSurvey}
                  isLoading={isPublishingSurvey}
                  disabled={!activeSurvey || activeQuestions.length === 0 || activeSurvey.status === 'published'}
                >
                  {activeSurvey?.status === 'published' ? 'Published' : 'Publish survey'}
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            {createStep === 1 && (
              <SurveyBasicsStep
                title={surveyForm.title}
                description={surveyForm.description}
                error={surveyErrors?.title}
                descriptionError={surveyErrors?.description}
                onTitleChange={(value) => setSurveyForm((current) => ({ ...current, title: value }))}
                onDescriptionChange={(value) => setSurveyForm((current) => ({ ...current, description: value }))}
                onTitleBlur={() => {
                  const error = surveyForm.title.trim() === '' ? 'Survey title is required' : ''
                  setSurveyErrors((current) => ({ ...current, title: error }))
                }}
                onDescriptionBlur={() => {
                  const error = surveyForm.description.trim() === '' ? 'Description is required' : ''
                  setSurveyErrors((current) => ({ ...current, description: error }))
                }}
              />
            )}

            {createStep === 2 && (
              <SurveyBrandingStep
                primaryColor={surveyForm.primaryColor}
                logoUrl={surveyForm.logoUrl}
                logoFileName={logoFileName}
                onColorChange={(value) => setSurveyForm((current) => ({ ...current, primaryColor: value }))}
                onLogoUrlChange={(value) => setSurveyForm((current) => ({ ...current, logoUrl: value }))}
                onLogoUpload={handleLogoUpload}
                onLogoUrlBlur={() => {
                  const error = surveyForm.logoUrl.trim() !== '' && !surveyForm.logoUrl.startsWith('http') ? 'Invalid URL format' : ''
                  setSurveyErrors((current) => ({ ...current, logoUrl: error }))
                }}
              />
            )}

            {createStep === 3 && (
              <>
                <SurveyQuestionsStep
                  surveyTitle={activeSurvey?.title || surveyForm.title || 'Survey title'}
                  surveyDescription={activeSurvey?.description || surveyForm.description || undefined}
                  questions={activeQuestions}
                  isQuestionsLoading={isLoading && activeQuestions.length === 0}
                  isDraggingQuestionId={draggedQuestionId}
                  onAddQuestion={openAddQuestionDrawer}
                  onEditQuestion={openEditQuestionDrawer}
                  onDeleteQuestion={handleQuestionDelete}
                  onQuestionDragStart={handleQuestionDragStart}
                  onQuestionDragOver={handleQuestionDragOver}
                  onQuestionDrop={handleQuestionDrop}
                  onQuestionDragEnd={handleQuestionDragEnd}
                />

                <QuestionComposerCard
                  isOpen={isQuestionComposerOpen}
                  mode={questionMode}
                  form={questionForm}
                  errors={questionErrors}
                  isSaving={isSavingQuestion}
                  onClose={() => {
                    setIsQuestionComposerOpen(false)
                    setEditingQuestionId(null)
                    setQuestionForm(defaultQuestionForm)
                    setQuestionErrors({})
                  }}
                  onSave={handleSaveQuestion}
                  onChange={(updater) => setQuestionForm((current) => updater(current))}
                />
              </>
            )}

            {createStep === 4 && (
              <SurveyPublishStep
                surveyTitle={activeSurvey?.title || surveyForm.title || 'Survey title'}
                surveySlug={activeSurvey?.slug}
                isPublished={activeSurvey?.status === 'published'}
                onCopyLink={() => activeSurvey?.slug && handleCopySurveyLink(activeSurvey.slug)}
                onPreview={() => activeSurvey?.slug && activeSurvey.status === 'published' && handlePreviewSurvey(activeSurvey.slug)}
                isPublishing={isPublishingSurvey}
              />
            )}
          </div>
        </div>
      </OffCanvas>

      <OffCanvas
        isOpen={selectedSurveyId !== null}
        onClose={closeSurveyDrawer}
        title={activeSurvey?.title || 'Survey editor'}
        description={activeSurvey ? 'Edit details, brand, and questions from one drawer.' : 'Loading survey...'}
        size="xl"
        zIndex={70}
        footer={
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSaveSurvey} isLoading={isSavingSurvey} disabled={!hasEditChanges}>
              Save changes
            </Button>
            {activeSurvey && activeSurvey.status !== 'published' && (
              <Button 
                variant="primary" 
                onClick={handlePublishSurvey} 
                isLoading={isPublishingSurvey}
                disabled={activeQuestions.length === 0}
              >
                Publish survey
              </Button>
            )}
            <Button variant="tertiary" onClick={closeSurveyDrawer}>
              Close
            </Button>
          </div>
        }
      >
        {!activeSurvey ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Loading survey...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Basic info</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">Survey details</h3>
                  <p className="mt-2 text-sm text-gray-600">Update the title and description here.</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {statusLabel(activeSurvey.status)}
                </span>
              </div>
              <div className="mt-5">
                <SurveyDetailsForm
                  title={surveyForm.title}
                  description={surveyForm.description}
                  onTitleChange={(value) => setSurveyForm((current) => ({ ...current, title: value }))}
                  onDescriptionChange={(value) => setSurveyForm((current) => ({ ...current, description: value }))}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Brand info</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">Appearance</h3>
                  <p className="mt-2 text-sm text-gray-600">Pick the color and logo shown to respondents.</p>
                </div>
              </div>
              <div className="mt-5">
                <BrandingForm
                  primaryColor={surveyForm.primaryColor}
                  logoUrl={surveyForm.logoUrl}
                  logoFileName={logoFileName}
                  onColorChange={(value) => setSurveyForm((current) => ({ ...current, primaryColor: value }))}
                  onLogoUrlChange={(value) => setSurveyForm((current) => ({ ...current, logoUrl: value }))}
                  onLogoUpload={handleLogoUpload}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Questions</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">Builder content</h3>
                  <p className="mt-2 text-sm text-gray-600">Add, remove, and reorder the survey questions.</p>
                </div>
                <Button variant="primary" onClick={openAddQuestionDrawer}>
                  Add question
                </Button>
              </div>

              {activeQuestions.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No questions yet. Add the first one from the drawer.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {activeQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      draggable
                      onDragStart={() => handleQuestionDragStart(question.id)}
                      onDragOver={handleQuestionDragOver}
                      onDrop={() => handleQuestionDrop(question.id)}
                      onDragEnd={handleQuestionDragEnd}
                      className={`rounded-2xl border bg-gray-50 p-4 transition-all ${
                        draggedQuestionId === question.id ? 'border-violet-500 opacity-50' : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                            {/* DragIcon would be imported but using text for simplicity */}
                            ⋮
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-600 shadow-sm">
                                Q{index + 1}
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm">
                                {question.type}
                              </span>
                              {question.required && (
                                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="mt-3 text-base font-semibold text-gray-900">{question.title}</p>
                            {question.description && <p className="mt-1 text-sm text-gray-600">{question.description}</p>}
                            {question.type === 'multiple_choice' && question.options?.length ? (
                              <div className="mt-3 space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={`${question.id}-${optionIndex}`} className="text-sm text-gray-700">
                                    • {option}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditQuestionDrawer(question)}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-violet-600 transition-colors hover:bg-violet-50"
                              title="Edit question"
                              aria-label="Edit question"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleQuestionDelete(question)}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                              title="Delete question"
                              aria-label="Delete question"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <QuestionComposerCard
                isOpen={isQuestionComposerOpen}
                mode={questionMode}
                form={questionForm}
                errors={questionErrors}
                isSaving={isSavingQuestion}
                onClose={() => {
                  setIsQuestionComposerOpen(false)
                  setEditingQuestionId(null)
                  setQuestionForm(defaultQuestionForm)
                  setQuestionErrors({})
                }}
                onSave={handleSaveQuestion}
                onChange={(updater) => setQuestionForm((current) => updater(current))}
              />
            </div>
          </div>
        )}
      </OffCanvas>

      <ShareSurveyModal
        survey={surveyToShare}
        onClose={() => setSurveyToShare(null)}
        onCopy={handleCopySurveyLink}
      />

      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        description={modal.description}
        variant={modal.variant}
        onClose={modal.closeModal}
        onConfirm={modal.handleConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={modal.isLoading}
      />
    </AppLayout>
  )
}
