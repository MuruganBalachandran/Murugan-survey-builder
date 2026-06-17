// region imports

import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { AppLayout } from '@/components/Layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ResponsesOverTimeChart } from '@/components/surveyResponses/ResponsesOverTimeChart'
import { fetchSurveyResponses } from '@/store/slices/responseSlice'
import { fetchUserSurveys } from '@/store/slices/surveySlice'
import type { DashboardResponse, StatCardProps } from '@/types'
import {
  DASHBOARD_SURVEYS_PAGE_SIZE,
  DRAFT_SURVEYS_PREVIEW_LIMIT,
  RECENT_RESPONSES_LIMIT,
  TOP_SURVEYS_LIMIT,
} from '@/utils/constants'
import {
  formatRelativeTime,
  getGreeting,
  isAnswered,
  startOfCurrentWeek,
} from '@/utils/common'
import {
  CompletionIcon,
  DashboardSurveyIcon,
  DraftIcon,
  PublishedIcon,
  ResponseIcon,
} from '@/utils/icons'

// endregion

// region helpers
const StatCard = ({ label, value, detail, icon, iconClassName }: StatCardProps) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{detail}</p>
      </div>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
        {icon}
      </span>
    </div>
  </div>
)
// endregion

/**
 * DashboardPage - User dashboard displaying surveys, responses, and analytics
 * Shows overview statistics, recent activity, top surveys, and draft surveys
 */
// region component
export const DashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { surveys, surveysTotal, isLoading } = useAppSelector((state) => state.survey)
  const { responses, isLoading: responsesLoading } = useAppSelector((state) => state.response)

  // region effects

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    dispatch(fetchUserSurveys({ pageSize: DASHBOARD_SURVEYS_PAGE_SIZE }))
  }, [dispatch, isAuthenticated, navigate])

  useEffect(() => {
    if (!isAuthenticated) return
    const refreshSurveys = () =>
      dispatch(fetchUserSurveys({ pageSize: DASHBOARD_SURVEYS_PAGE_SIZE }))
    window.addEventListener('focus', refreshSurveys)
    return () => window.removeEventListener('focus', refreshSurveys)
  }, [dispatch, isAuthenticated])

  // load responses for all surveys via Redux thunk
  useEffect(() => {
    if (!isAuthenticated || surveys.length === 0) return
    for (const survey of surveys) {
      dispatch(fetchSurveyResponses({
        surveyId: survey.id,
        surveyTitle: survey.title,
        questionCount: survey.questionCount ?? 0,
      }))
    }
  }, [dispatch, isAuthenticated, surveys])

  // endregion

  // region derived data

  const dashboardData = useMemo(() => {
    const typedResponses = responses as DashboardResponse[]
    const totalResponses = surveys.reduce((sum, survey) => sum + (survey.responseCount ?? 0), 0)

    const sortedResponses = [...typedResponses].sort(
      (first, second) =>
        new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime(),
    )

    const weekStart = startOfCurrentWeek()
    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const count = typedResponses.filter((response) => {
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

    const answeredFields = typedResponses.reduce(
      (sum, response) =>
        sum + response.answers.filter((answer) => isAnswered(answer.value)).length,
      0,
    )
    const totalFields = typedResponses.reduce(
      (sum, response) => sum + Math.max(response.questionCount, response.answers.length),
      0,
    )
    const completionRate = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0

    return {
      totalResponses,
      responsesThisWeek,
      completionRate,
      weekDays,
      recentResponses: sortedResponses.slice(0, RECENT_RESPONSES_LIMIT),
      topSurveys: [...surveys]
        .sort((first, second) => (second.responseCount ?? 0) - (first.responseCount ?? 0))
        .slice(0, TOP_SURVEYS_LIMIT),
      draftSurveys: surveys.filter((survey) => survey.status !== 'published'),
    }
  }, [responses, surveys])

  // endregion

  if (!isAuthenticated) return null

  const maxSurveyResponses = Math.max(
    ...dashboardData.topSurveys.map((survey) => survey.responseCount ?? 0),
    1,
  )
  const isDashboardLoading = isLoading && surveys.length === 0

  // region render
  return (
    <AppLayout>
      <div className="app-page">
        <section className="app-hero">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')?.[0] || 'there'}
              </h1>
              <p className="mt-3 text-base text-violet-100">
                You collected{' '}
                <span className="font-bold text-white">
                  {dashboardData.responsesThisWeek.toLocaleString()}
                </span>{' '}
                new responses this week.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate({ to: '/surveys' })}
              className="bg-white !text-indigo-600 !border-none"
            >
              Manage surveys
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Surveys"
            value={surveysTotal.toLocaleString()}
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
            label="Closed"
            value={surveys.filter((s) => s.status === 'closed').length.toLocaleString()}
            detail="No longer accepting responses"
            icon={<CompletionIcon />}
            iconClassName="bg-gray-100 text-gray-600"
          />
          <StatCard
            label="Drafts"
            value={surveys.filter((s) => s.status === 'draft').length.toLocaleString()}
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
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Drafts
                </p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">
                  Continue where you left off
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  These surveys are still drafts and need finishing before sharing.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboardData.draftSurveys.slice(0, DRAFT_SURVEYS_PREVIEW_LIMIT).map((survey) => (
                <div
                  key={survey.id}
                  className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                        Draft
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-gray-900">{survey.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {survey.questionCount ?? 0} questions ·{' '}
                        {(survey.responseCount ?? 0).toLocaleString()} responses
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
          <ResponsesOverTimeChart
            days={dashboardData.weekDays}
            badge={`${dashboardData.responsesThisWeek} this week`}
          />

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
                <p className="py-8 text-center text-sm text-gray-500">
                  Loading survey performance...
                </p>
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
                        style={{
                          width: `${((survey.responseCount ?? 0) / maxSurveyResponses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  Create a survey to see performance.
                </p>
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
                <p className="py-8 text-center text-sm text-gray-500">
                  Loading recent responses...
                </p>
              ) : dashboardData.recentResponses.length > 0 ? (
                dashboardData.recentResponses.map((response) => (
                  <button
                    key={response.id}
                    type="button"
                    onClick={() =>
                      navigate({ to: `/surveys/${response.surveyId}/responses` })
                    }
                    className="flex w-full items-center gap-4 py-4 text-left transition-colors first:pt-0 last:pb-0 hover:bg-gray-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CompletionIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Anonymous</span> submitted{' '}
                        <span className="font-semibold text-gray-900">
                          "{response.surveyTitle}"
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {formatRelativeTime(response.submittedAt)}
                      </span>
                    </span>
                    <span className="text-lg text-gray-300">›</span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">No responses yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Share a published survey to start seeing activity.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
  // endregion
}
// endregion
