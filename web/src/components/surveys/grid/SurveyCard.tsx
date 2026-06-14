// region imports
import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { SurveyCardEditIcon, PreviewIcon, ShareIcon, TrashIcon, ResponseIcon } from '@/utils/icons'
import type { SurveyCardProps } from '@/types'
// endregion

// region helpers

// human-readable label for each survey status
const statusLabel = (status?: string) => {
  switch (status) {
    case 'published': return 'Published'
    case 'closed': return 'Closed'
    case 'archived': return 'Archived'
    default: return 'Draft'
  }
}

// tailwind classes for the status badge colour
const statusTone = (status?: string) => {
  switch (status) {
    case 'published': return 'bg-emerald-50 text-emerald-700'
    case 'closed': return 'bg-gray-100 text-gray-700'
    case 'archived': return 'bg-amber-50 text-amber-700'
    default: return 'bg-violet-50 text-violet-700'
  }
}

// truncate long descriptions with an ellipsis
const truncateDescription = (description: string, limit = 98) => {
  if (description.length <= limit) return description
  return `${description.slice(0, limit).trimEnd()}...`
}

// endregion

// region component
export const SurveyCard = ({ survey, onEdit, onPreview, onShare, onDelete }: SurveyCardProps) => {
  const navigate = useNavigate()

  // region state
  const [showMore, setShowMore] = useState(false)
  // endregion

  // region derived data
  const titleInitial = survey.title?.trim()?.[0]?.toUpperCase() || '?'
  const accentColor = survey.primaryColor || '#6366F1'
  const canExpand = (survey.description?.length ?? 0) > 98

  // truncate or expand description based on toggle state
  const description = useMemo(() => {
    if (!survey.description) return ''
    return showMore ? survey.description : truncateDescription(survey.description)
  }, [showMore, survey.description])
  // endregion

  // region render
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* accent bar using survey primary color */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-5">
        {/* card header — logo/initial, title, slug, status badge, edit button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              {survey.logoUrl ? (
                <img src={survey.logoUrl} alt={`${survey.title} logo`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold">{titleInitial}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-gray-900">{survey.title}</h3>
              <p className="mt-1 truncate text-xs text-gray-500">formcraft.io/s/{survey.slug}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(survey.status)}`}>
              {statusLabel(survey.status)}
            </span>
            <button
              type="button"
              onClick={() => onEdit(survey.id)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-violet-600 transition-colors hover:bg-violet-50"
              aria-label="Edit survey"
              title="Edit survey"
            >
              <SurveyCardEditIcon />
            </button>
          </div>
        </div>

        {/* expandable description with read-more toggle */}
        {survey.description && (
          <div className="mt-3">
            <p className="text-sm leading-6 text-gray-600">
              {description}{' '}
              {canExpand && (
                <button
                  type="button"
                  onClick={() => setShowMore((current) => !current)}
                  className="font-medium text-violet-600 transition-colors hover:text-violet-700"
                >
                  {showMore ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>{survey.responseCount ?? 0} responses</span>
        </div>

        {/* action toolbar — responses, preview, share, delete */}
        <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/surveys/$id/responses', params: { id: survey.id } })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50"
            aria-label="View responses"
            title="View responses"
          >
            <ResponseIcon />
          </button>

          <button
            type="button"
            onClick={() => onPreview(survey.slug)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50"
            aria-label="Preview survey"
            title="Preview survey"
          >
            <PreviewIcon />
          </button>

          {/* share disabled until survey is published */}
          <button
            type="button"
            onClick={() => survey.status === 'published' && onShare(survey.slug)}
            disabled={survey.status !== 'published'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Share survey"
            title={survey.status === 'published' ? 'Share survey' : 'Publish before sharing'}
          >
            <ShareIcon />
          </button>

          <button
            type="button"
            onClick={() => onDelete(survey.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-red-600 transition-colors hover:bg-red-50"
            aria-label="Delete survey"
            title="Delete survey"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  )
  // endregion
}
// endregion
