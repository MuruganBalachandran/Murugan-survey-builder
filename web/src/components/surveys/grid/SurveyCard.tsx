// region imports

import { useNavigate } from "@tanstack/react-router";
import type { SurveyCardProps } from "@/types";
import { useCountdown } from "@/hooks/useCountdown";
import {
  CloseCircleIcon,
  DuplicateIcon,
  PreviewIcon,
  ResponseIcon,
  ShareIcon,
  SurveyCardEditIcon,
  TrashIcon,
} from "@/utils/icons";
import { statusLabel, statusTone, truncateDescription } from "@/utils/common";

// endregion

// region component
export const SurveyCard = ({
  survey,
  onEdit,
  onPreview,
  onShare,
  onDelete,
  onDuplicate,
  onManualClose,
  onAutoExpire,
}: SurveyCardProps) => {
  const navigate = useNavigate();

  // region derived data
  const titleInitial = survey.title?.trim()?.[0]?.toUpperCase() ?? "?";
  const accentColor = survey.primaryColor || "#6366F1";
  const description = survey.description
    ? truncateDescription(survey.description)
    : "No description added.";
  const countdown = useCountdown(
    survey.status === 'published' ? survey.endsAt : undefined,
    () => onAutoExpire(survey.id),
  )

  const countdownDisplay = survey.status === 'closed'
    ? survey.endsAt ? 'Ended' : null
    : countdown || null

  const timelineLabel = countdownDisplay
    ?? (survey.status === 'published' ? 'Accepting responses' : 'Not published yet')

  const timelineColor = countdownDisplay === 'Ended'
    ? 'text-red-500'
    : survey.status === 'published'
      ? 'text-emerald-600'
      : 'text-gray-400'
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
                <img
                  src={survey.logoUrl}
                  alt={`${survey.title} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">{titleInitial}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-gray-900">
                {survey.title}
              </h3>
              <p className="mt-1 truncate text-xs text-gray-500">
                formcraft.io/s/{survey.slug}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(survey.status)}`}
            >
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

        {/* description — capped at 50 chars, fallback when empty */}
        <div className="mt-3">
          <p className={`text-sm leading-6 ${survey.description ? "text-gray-600" : "italic text-gray-400"}`}>
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>{survey.responseCount ?? 0} responses</span>
        </div>

        {/* timeline — countdown, ended, or default status label */}
        <p className={`mt-1.5 text-xs font-medium ${timelineColor}`}>
          {timelineLabel}
        </p>

        {/* action toolbar — responses, preview, share, manual close, delete */}
        <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/surveys/$id/responses",
                params: { id: survey.id },
              })
            }
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
            onClick={() =>
              survey.status === "published" && onShare(survey.slug)
            }
            disabled={survey.status !== "published"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Share survey"
            title={
              survey.status === "published"
                ? "Share survey"
                : "Publish before sharing"
            }
          >
            <ShareIcon />
          </button>

          {/* manual close — only actionable for published surveys */}
          <button
            type="button"
            onClick={() => onDuplicate(survey.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-violet-600 transition-colors hover:bg-violet-50"
            aria-label="Duplicate survey"
            title="Duplicate survey"
          >
            <DuplicateIcon />
          </button>

          {/* manual close — only actionable for published surveys */}
          <button
            type="button"
            onClick={() => onManualClose(survey.id)}
            disabled={survey.status !== "published"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close survey"
            title={
              survey.status === "published"
                ? "Close survey"
                : "Only published surveys can be closed"
            }
          >
            <CloseCircleIcon />
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
  );
  // endregion
};
// endregion
