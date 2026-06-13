import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AppLayout } from '@/components/Layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getSurveyResponses } from '@/services/api/responses'
import { fetchUserSurveys } from '@/store/slices/surveySlice'
import { DashboardSurveyIcon, ResponseIcon, CompletionIcon, PublishedIcon, DraftIcon } from '@/utils/icons'
import type { DashboardResponse, StatCardProps } from '@/types'

const StatCard = ({ label, value, detail, icon, iconClassName }: StatCardProps) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{detail}</p>
      </div>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>{icon}</span>
    </div>
  </div>
)

const isAnswered = (value: string | string[] | number) => {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

const startOfCurrentWeek = () => {
  const date = new Date()
  const day = date.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - daysSinceMonday)
  return date
}

const formatRelativeTime = (dateValue: string) => {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000))
  if (elapsedSeconds < 60) return 'Just now'

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) return `${elapsedMinutes} min${elapsedMinutes === 1 ? '' : 's'} ago`

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`

  const elapsedDays = Math.floor(elapsedHours / 24)
  if (elapsedDays < 7) return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`

  return new Date(dateValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const DashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { surveys, isLoading } = useAppSelector((state) => state.survey)
  const [responses, setResponses] = useState<DashboardResponse[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }

    dispatch(fetchUserSurveys())
  }, [dispatch, isAuthenticated, navigate])

  useEffect(() => {
    if (!isAuthenticated) return

    const refreshSurveys = () => {
      dispatch(fetchUserSurveys())
    }

    window.addEventListener('focus', refreshSurveys)
    return () => window.removeEventListener('focus', refreshSurveys)
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || surveys.length === 0) {
      setResponses([])
      return
    }

    let cancelled = false

    const loadResponses = async () => {
      setResponsesLoading(true)
      const results = await Promise.all(
        surveys.map(async (survey) => {
          try {
            const result = await getSurveyResponses(survey.id)
            if (!result.success || !result.data) return []

            return result.data.map((response) => ({
              ...response,
              surveyId: survey.id,
              surveyTitle: survey.title,
              questionCount: survey.questionCount ?? 0,
            }))
          } catch {
            return []
          }
        }),
      )

      if (!cancelled) {
        setResponses(results.flat())
        setResponsesLoading(false)
      }
    }

    void loadResponses()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, surveys])

  const dashboardData = useMemo(() => {
    const totalResponses = surveys.reduce((sum, survey) => sum + (survey.responseCount ?? 0), 0)
    const sortedResponses = [...responses].sort(
      (first, second) => new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime(),
    )

    const weekStart = startOfCurrentWeek()
    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const count = responses.filter((response) => {
        const submittedAt = new Date(response.submittedAt)
        return submittedAt >= date && submittedAt < nextDate
      }).length

      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        count,
        isToday: date.toDateString() === new Date().toDateString(),
      }
    })

    const responsesThisWeek = weekDays.reduce((sum, day) => sum + day.count, 0)
    const answeredFields = responses.reduce(
      (sum, response) => sum + response.answers.filter((answer) => isAnswered(answer.value)).length,
      0,
    )
    const totalFields = responses.reduce(
      (sum, response) => sum + Math.max(response.questionCount, response.answers.length),
      0,
    )
    const completionRate = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0

    return {
      totalResponses,
      responsesThisWeek,
      completionRate,
      weekDays,
      recentResponses: sortedResponses.slice(0, 5),
      topSurveys: [...surveys]
        .sort((first, second) => (second.responseCount ?? 0) - (first.responseCount ?? 0))
        .slice(0, 5),
      draftSurveys: surveys.filter((survey) => survey.status !== 'published'),
    }
  }, [responses, surveys])

  if (!isAuthenticated) return null

  const maxDailyResponses = Math.max(...dashboardData.weekDays.map((day) => day.count), 1)
  const maxSurveyResponses = Math.max(
    ...dashboardData.topSurveys.map((survey) => survey.responseCount ?? 0),
    1,
  )
  const isDashboardLoading = isLoading && surveys.length === 0

  return (
    <AppLayout>
      <div className="app-page">
        <section className="app-hero">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="mt-3 text-base text-violet-100">
                You collected{' '}
                <span className="font-bold text-white">{dashboardData.responsesThisWeek.toLocaleString()}</span>{' '}
                new responses this week.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate({ to: '/surveys' })}
              style={{ background: 'white', color: '#4F46E5', border: 'none' }}
            >
              Manage surveys
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Surveys"
            value={surveys.length.toLocaleString()}
            detail="Total surveys created"
            icon={<DashboardSurveyIcon />}
            iconClassName="bg-violet-50 text-violet-600"
          />
          <StatCard
            label="Responses"
            value={dashboardData.totalResponses.toLocaleString()}
            detail="Captured across all surveys"
            icon={<ResponseIcon />}
            iconClassName="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Published"
            value={surveys.filter((s) => s.status === 'published').length.toLocaleString()}
            detail="Active surveys"
            icon={<PublishedIcon />}
            iconClassName="bg-green-50 text-green-600"
          />
          <StatCard
            label="Drafts"
            value={surveys.filter((s) => s.status !== 'published').length.toLocaleString()}
            detail="In progress surveys"
            icon={<DraftIcon />}
            iconClassName="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Completion"
            value={`${dashboardData.completionRate}%`}
            detail="Answered fields in submissions"
            icon={<CompletionIcon />}
            iconClassName="bg-amber-50 text-amber-600"
          />
        </section>
        {dashboardData.draftSurveys.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Drafts</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">Continue where you left off</h2>
                <p className="mt-1 text-sm text-gray-600">These surveys are still drafts and need finishing before sharing.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboardData.draftSurveys.slice(0, 3).map((survey) => (
                <div key={survey.id} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Draft</p>
                      <h3 className="mt-2 text-base font-semibold text-gray-900">{survey.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {survey.questionCount ?? 0} questions · {(survey.responseCount ?? 0).toLocaleString()} responses
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Draft
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate({ to: '/surveys' })}
                    className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                  >
                    Continue editing
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Responses over time</h2>
                <p className="mt-1 text-sm text-gray-500">Submission activity for the current week</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                {dashboardData.responsesThisWeek} this week
              </span>
            </div>

            <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
              {dashboardData.weekDays.map((day) => {
                const height = day.count === 0 ? 4 : Math.max(12, (day.count / maxDailyResponses) * 100)

                return (
                  <div key={day.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3">
                    <span className="text-xs font-semibold text-gray-600">{day.count}</span>
                    <div className="flex h-48 w-full items-end rounded-xl bg-gray-50 px-1.5 pt-2">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          day.isToday
                            ? 'bg-gradient-to-t from-violet-600 to-indigo-400'
                            : 'bg-gradient-to-t from-violet-300 to-violet-200'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${day.label}: ${day.count} responses`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${day.isToday ? 'text-violet-700' : 'text-gray-500'}`}>
                      {day.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top surveys</h2>
                <p className="mt-1 text-sm text-gray-500">Ranked by responses</p>
              </div>
              <button
                type="button"
                onClick={() => navigate({ to: '/surveys' })}
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View all
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {isDashboardLoading ? (
                <p className="py-8 text-center text-sm text-gray-500">Loading survey performance...</p>
              ) : dashboardData.topSurveys.length > 0 ? (
                dashboardData.topSurveys.map((survey, index) => (
                  <div key={survey.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          <span className="mr-2 text-gray-400">{index + 1}.</span>
                          {survey.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {(survey.responseCount ?? 0).toLocaleString()} responses
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate({ to: `/surveys/${survey.id}/responses` })}
                        className="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        View analytics
                      </button>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${((survey.responseCount ?? 0) / maxSurveyResponses) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">Create a survey to see performance.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent activity</h2>
              <p className="mt-1 text-sm text-gray-500">Latest responses across your surveys</p>
            </div>

            <div className="mt-6 divide-y divide-gray-100">
              {responsesLoading && responses.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">Loading recent responses...</p>
              ) : dashboardData.recentResponses.length > 0 ? (
                dashboardData.recentResponses.map((response) => (
                  <button
                    key={response.id}
                    type="button"
                    onClick={() => navigate({ to: `/surveys/${response.surveyId}/responses` })}
                    className="flex w-full items-center gap-4 py-4 text-left transition-colors first:pt-0 last:pb-0 hover:bg-gray-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CompletionIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Anonymous</span> submitted{' '}
                        <span className="font-semibold text-gray-900">"{response.surveyTitle}"</span>
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">{formatRelativeTime(response.submittedAt)}</span>
                    </span>
                    <span className="text-lg text-gray-300">›</span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">No responses yet</p>
                  <p className="mt-1 text-sm text-gray-500">Share a published survey to start seeing activity.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
