import { useEffect } from 'react'
import { WhatsAppIcon, MailShareIcon, CopyShareIcon, Share2Icon, LinkedInIcon } from '@/utils/icons'
import { toast } from '@/lib/toast'
import { getSurveyUrl } from '@/utils/common/survey'
import type { ShareSurveyModalProps } from '@/types'

export const ShareSurveyModal = ({ survey, onClose, onCopy }: ShareSurveyModalProps) => {
  useEffect(() => {
    if (!survey) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, survey])

  if (!survey) return null

  const surveyUrl = getSurveyUrl(survey.slug)
  const shareText = `Please take a moment to complete "${survey.title}".`
  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const shareOptions = [
    {
      label: 'WhatsApp',
      icon: <WhatsAppIcon />,
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      onClick: () => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${surveyUrl}`)}`),
    },
    {
      label: 'Email',
      icon: <MailShareIcon />,
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      onClick: () =>
        window.location.assign(
          `mailto:?subject=${encodeURIComponent(survey.title)}&body=${encodeURIComponent(`${shareText}\n\n${surveyUrl}`)}`,
        ),
    },
    {
      label: 'LinkedIn',
      icon: <LinkedInIcon />,
      className: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
      onClick: () =>
        openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(surveyUrl)}`),
    },
  ]

  const handleNativeShare = async () => {
    if (!navigator.share) return

    try {
      await navigator.share({ title: survey.title, text: shareText, url: surveyUrl })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error('Unable to open share options')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} role="presentation" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-survey-title"
          className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
            <div>
              <h2 id="share-survey-title" className="text-lg font-bold text-gray-900">
                Share survey
              </h2>
              <p className="mt-1 text-sm text-gray-600">Invite people to respond to {survey.title}.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close share modal"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div>
              <label htmlFor="survey-share-link" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Public link
              </label>
              <div className="flex gap-2">
                <input
                  id="survey-share-link"
                  value={surveyUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <button
                  type="button"
                  onClick={() => onCopy(survey.slug)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  <CopyShareIcon />
                  Copy
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Share with</p>
              <div className="grid grid-cols-3 gap-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={option.onClick}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold transition-colors ${option.className}`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Share2Icon />
                More share options
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
